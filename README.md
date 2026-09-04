# WorthCars

Instant free VIN decode + estimated market value, with a paid one-time full
history report (accidents, title, ownership) as an upsell.

## Stack

- **Next.js 14** (App Router) + **Tailwind CSS**, deployed to Vercel
- **Supabase** (Postgres) for lookup logging, the live ticker stats, and
  storing purchased reports
- **Stripe** for the one-time report unlock payment
- **NHTSA vPIC API** (free, no key) for VIN decode
- **VinAudit** (recommended) for market valuation + licensed vehicle history

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values below.
3. Create the Supabase tables: run `supabase/schema.sql` against your project
   (SQL editor or `psql`).
4. `npm run dev`

### Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | ticker stats, report storage | Without these, lookups aren't logged and the ticker shows seed numbers only. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | paid report checkout | Point the Stripe webhook at `/api/stripe/webhook` for the `checkout.session.completed` event. |
| `VINAUDIT_MARKET_VALUE_KEY` | real valuation numbers | Without it, `/api/valuation` returns a clearly-labeled deterministic demo estimate. |
| `VINAUDIT_HISTORY_KEY` | real history reports | **Required in production** — without it, `getHistoryReport` throws rather than fabricate accident/title data for a paying customer. In `NODE_ENV !== 'production'` it falls back to seeded demo data instead. |
| `ADMIN_PASSWORD` | `/admin` dashboard | Single shared password, checked against an httpOnly cookie. No user accounts anywhere in this app. |
| `NEXT_PUBLIC_BASE_URL` | Stripe redirect URLs, metadata | Your deployed domain. |

## Data provider notes

- **Valuation**: `lib/valuation.ts` calls VinAudit's Market Value API. The
  exact request/response shape there is based on VinAudit's documented
  pattern (`key` + `vin` + `mileage` + `format=json`, returning `prices.average`
  etc.) — confirm it against VinAudit's live API console once a key is
  issued; that function is the only place to change if the wire format
  differs. MarketCheck's Price API is a solid alternative if you want
  listing-comp-based valuations instead — same adapter shape.
- **History**: `lib/vehicleHistory.ts` calls VinAudit's Vehicle History API,
  an NMVTIS-approved data source. **Carfax data cannot be scraped or resold**
  — VinAudit (or another NMVTIS-approved provider like VINData) is the
  properly licensed option. Same caveat as above: confirm the live response
  shape before going to production.
- Both are gated so the app runs fully in "demo mode" without any keys —
  useful for local development — but `vehicleHistory.ts` refuses to fabricate
  a paid report in production if no key is configured.

## Architecture notes

- No user accounts anywhere — the free decode/valuation flow needs nothing,
  and the paid flow only collects an email at checkout so a report can be
  retrieved again without re-paying (`vin` + `email` uniquely key a report).
- `/api/checkout/verify` (called from the success redirect) and
  `/api/stripe/webhook` both call the same idempotent
  `lib/reportFulfillment.ts` helper, so the report gets generated once
  whichever fires first, and the webhook is the reliability backstop if the
  customer closes the tab before the client-side verify call completes.
- The homepage ticker (`lib/db.ts#getTickerStats`) blends real counts with
  seed floors so the strip never looks dead before there's real traffic —
  once real traffic clears the floor, real numbers take over automatically.
