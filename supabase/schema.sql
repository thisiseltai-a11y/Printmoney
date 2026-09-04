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
  created_at timestamptz not null default now()
);
create index if not exists lookups_created_at_idx on lookups (created_at desc);
create index if not exists lookups_vin_idx on lookups (vin);

alter table lookups enable row level security;

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
