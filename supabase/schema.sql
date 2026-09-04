-- WorthCars database schema (Supabase / Postgres).
-- Run this once against your Supabase project. No user accounts/auth are
-- used anywhere in this app — every table is written only by server-side
-- API routes using the service-role key, so RLS stays enabled with zero
-- policies (deny-all to the anon/authenticated roles).

create table if not exists lookups (
  id bigint generated always as identity primary key,
  vin text not null,
  type text not null check (type in ('free', 'paid')),
  estimated_value integer,           -- populated on valuation lookups, used for the ticker's value trend
  ip text,                           -- used only for per-IP rate limiting math, never displayed
  created_at timestamptz not null default now()
);
create index if not exists lookups_created_at_idx on lookups (created_at desc);
create index if not exists lookups_vin_idx on lookups (vin);
create index if not exists lookups_ip_created_idx on lookups (ip, created_at desc);

alter table lookups enable row level security;

-- ip is added via ALTER so this script stays safe to re-run against a
-- database that already has the table from before this column existed.
alter table lookups add column if not exists ip text;

-- Free VIN decode results are static vehicle attributes (year/make/model/
-- trim/engine) that don't change, so they're cached indefinitely per VIN —
-- a repeat decode of the same VIN never re-hits the NHTSA API.
create table if not exists decode_cache (
  vin text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table decode_cache enable row level security;

-- Valuation results are cached per VIN + mileage (rounded to the nearest
-- 1,000 miles) for 24h — see VALUATION_CACHE_TTL_MS in lib/cache.ts — so a
-- repeat check of the same VIN at roughly the same mileage reuses the cached
-- result instead of re-billing the paid valuation API.
create table if not exists valuation_cache (
  id bigint generated always as identity primary key,
  vin text not null,
  mileage_bucket integer not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (vin, mileage_bucket)
);
create index if not exists valuation_cache_vin_idx on valuation_cache (vin);
alter table valuation_cache enable row level security;

create table if not exists reports (
  id bigint generated always as identity primary key,
  vin text not null,
  email text not null,
  stripe_session_id text,
  amount_cents integer not null default 1999,
  report_json jsonb not null,
  created_at timestamptz not null default now(),
  unique (vin, email)
);
create index if not exists reports_vin_email_idx on reports (vin, email);

alter table reports enable row level security;
