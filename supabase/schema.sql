-- WorthCars marketplace schema (Supabase / Postgres).
--
-- Auth is handled by Supabase Auth (the built-in auth.users table) — this
-- file adds the app-specific tables and a trigger that creates a `profiles`
-- row whenever someone signs up.
--
-- Note: this replaces the earlier VIN-value-report product. Its tables
-- (lookups, reports, valuation_cache) are no longer used by the app and are
-- intentionally left OUT of this file rather than dropped automatically —
-- drop them yourself once you're sure you don't need that data.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists "profiles are viewable by everyone" on profiles;
create policy "profiles are viewable by everyone" on profiles for select using (true);
drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile" on profiles for update using (auth.uid() = id);
drop policy if exists "users can insert own profile" on profiles;
create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Listings ──────────────────────────────────────────────────────────
-- asking_price / minimum_offer are stored in cents. minimum_offer is shown
-- to buyers directly on the listing (the floor below which an offer is
-- auto-declined) so they're never guessing and never wasting a round-trip
-- on a lowball the seller would reject anyway.

create table if not exists listings (
  id bigint generated always as identity primary key,
  seller_id uuid not null references auth.users (id) on delete cascade,
  year integer,
  make text not null,
  model text not null,
  trim text,
  mileage integer,
  vin text,
  description text,
  photos text[] not null default '{}',
  asking_price integer not null,
  minimum_offer integer not null,
  status text not null default 'active' check (status in ('active', 'sold', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists listings_status_idx on listings (status, created_at desc);
create index if not exists listings_seller_idx on listings (seller_id);
alter table listings enable row level security;
drop policy if exists "active listings are public" on listings;
create policy "active listings are public" on listings
  for select using (status = 'active' or seller_id = auth.uid());
drop policy if exists "sellers manage own listings" on listings;
create policy "sellers manage own listings" on listings
  for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- ─── Offers ────────────────────────────────────────────────────────────
-- `amount` is whatever's currently on the table; `status` tracks whose turn
-- it is. All state transitions happen server-side (service-role key) after
-- checking the caller is the buyer or the listing's seller — see
-- lib/offers.ts — RLS here is a read-time backstop, not the only guard.

create table if not exists offers (
  id bigint generated always as identity primary key,
  listing_id bigint not null references listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  status text not null default 'pending_seller'
    check (status in ('pending_seller', 'pending_buyer', 'accepted', 'declined', 'withdrawn', 'auto_declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists offers_listing_idx on offers (listing_id);
create index if not exists offers_buyer_idx on offers (buyer_id);
alter table offers enable row level security;
drop policy if exists "buyer or seller can view their offers" on offers;
create policy "buyer or seller can view their offers" on offers
  for select using (
    buyer_id = auth.uid()
    or exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

-- Full negotiation history for an offer thread (offer / counter / accept /
-- decline / withdraw), so the UI can show the back-and-forth.
create table if not exists offer_events (
  id bigint generated always as identity primary key,
  offer_id bigint not null references offers (id) on delete cascade,
  actor_id uuid not null references auth.users (id),
  action text not null check (action in ('offer', 'counter', 'accept', 'decline', 'withdraw', 'auto_decline')),
  amount integer,
  created_at timestamptz not null default now()
);
create index if not exists offer_events_offer_idx on offer_events (offer_id, created_at);
alter table offer_events enable row level security;
drop policy if exists "buyer or seller can view offer events" on offer_events;
create policy "buyer or seller can view offer events" on offer_events
  for select using (
    exists (
      select 1 from offers o
      join listings l on l.id = o.listing_id
      where o.id = offer_id and (o.buyer_id = auth.uid() or l.seller_id = auth.uid())
    )
  );

-- ─── Notifications ─────────────────────────────────────────────────────
-- In-app only for now (no email/SMS provider wired up — that would be a
-- new ongoing cost, flag before adding it).

create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, read, created_at desc);
alter table notifications enable row level security;
drop policy if exists "users see own notifications" on notifications;
create policy "users see own notifications" on notifications
  for select using (user_id = auth.uid());
drop policy if exists "users can mark own notifications read" on notifications;
create policy "users can mark own notifications read" on notifications
  for update using (user_id = auth.uid());

-- ─── VIN decode cache ──────────────────────────────────────────────────
-- Kept from the previous build — still used by the "auto-fill from VIN"
-- helper on the create-listing form. NHTSA's decode API is free; this only
-- cuts latency/load on repeat lookups of the same VIN.
create table if not exists decode_cache (
  vin text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table decode_cache enable row level security;

-- ─── Storage bucket for listing photos ─────────────────────────────────
-- Public read (anyone can view a listing's photos), authenticated upload,
-- owner-only delete. No extra service/cost — this is part of your existing
-- Supabase project's storage.

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "listing photos are publicly readable" on storage.objects;
create policy "listing photos are publicly readable" on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists "authenticated users can upload listing photos" on storage.objects;
create policy "authenticated users can upload listing photos" on storage.objects
  for insert with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');

drop policy if exists "owners can delete their listing photos" on storage.objects;
create policy "owners can delete their listing photos" on storage.objects
  for delete using (bucket_id = 'listing-photos' and auth.uid() = owner);
