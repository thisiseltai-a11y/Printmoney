# WorthCars

A marketplace where sellers list a car with an asking price and a minimum
they'll actually consider, buyers submit offers, and both sides negotiate
from their dashboard — with a notification the moment the other side
responds.

## Stack

- **Next.js 14** (App Router) + **Tailwind CSS**, deployed to Vercel
- **Supabase** for everything: Auth (email/password), Postgres (listings,
  offers, notifications), and Storage (listing photos). No other paid
  service is required.
- **NHTSA vPIC API** (free, no key) powers the optional "auto-fill from VIN"
  helper on the create-listing form.

## How the offer flow works

- A listing has an `asking_price` and a `minimum_offer`. The minimum is
  shown to buyers directly on the listing — an offer below it is rejected
  automatically, before the seller ever sees it.
- A valid offer starts in `pending_seller`. The seller can **accept**,
  **counter**, or **decline**.
- A counter flips the offer to `pending_buyer` — the buyer gets an in-app
  notification and can accept, counter back, or the offer stays open until
  they do (they can also withdraw it at any point while it's open).
- Accepting marks the listing `sold` and auto-declines any other open
  offers on it (each of those buyers gets notified).
- The full back-and-forth is logged in `offer_events` so the UI can show
  the negotiation history, not just the current state.

See `lib/offers.ts` for the state machine and `lib/db.ts` for the raw data
access.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL + keys.
3. Run `supabase/schema.sql` against your Supabase project (SQL editor) —
   it creates the tables, enables RLS, sets up the `profiles`-on-signup
   trigger, and creates the public `listing-photos` storage bucket.
4. In the Supabase dashboard, under Authentication → Email, confirm whether
   you want email confirmation required for signup (`app/signup/page.tsx`
   handles both cases — if confirmation is on, it shows a "check your
   email" screen instead of logging the user straight in).
5. `npm run dev`

## Notifications

In-app only for now (bell icon in the nav, polls every 30s). Email/SMS
notifications would need a provider like Resend or Twilio — that's a new
ongoing cost, so it's intentionally not wired up; ask before adding it.

## Architecture notes

- No separate "buyer" vs "seller" account type — any signed-in user can
  list a car and make offers on others' listings from the same account.
- All offer/listing state changes happen server-side (API routes using the
  Supabase service-role key) after checking the caller is the buyer or
  seller involved — RLS policies on the tables are a read-time backstop,
  not the only authorization check.
- Prices are stored in cents everywhere (`lib/money.ts` has the only two
  conversion points) to avoid floating-point rounding on money.
