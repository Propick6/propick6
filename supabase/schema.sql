-- =========================================================================
-- Pro Pick 6 — Supabase Schema (Phase 2 prep)
-- Paste this into Supabase SQL Editor and click "Run"
-- =========================================================================
-- This creates all the tables the app needs once we wire up real data.
-- Safe to re-run: uses "create table if not exists" and "drop policy if exists".
-- =========================================================================

-- USERS (one row per authenticated user; references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text,
  created_at timestamptz default now(),
  sport text,
  unlock_tokens int not null default 0,
  earn_tokens int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  pushes int not null default 0,
  roi numeric not null default 0
);

-- PICKS (one row per individual pick submitted by a capper)
create table if not exists public.picks (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null,
  pick_type text not null check (pick_type in ('Spread','ML','O/U','Prop','Parlay','Futures')),
  matchup text not null,
  selection text not null,
  created_at timestamptz default now(),
  pick_date date not null default current_date,
  result text check (result in ('pending','win','loss','push')) default 'pending'
);

create index if not exists picks_seller_date_idx on public.picks (seller_id, pick_date);

-- UNLOCKS (buyer → seller unlock for a given day)
create table if not exists public.unlocks (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  pick_date date not null default current_date,
  created_at timestamptz default now(),
  unique (buyer_id, seller_id, pick_date)
);

-- TRANSACTIONS (every token movement — purchase, unlock, earn, convert, withdraw)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in (
    'bundle_purchase',  -- user bought unlock tokens via Stripe
    'unlock_spend',     -- user spent 1 unlock token to unlock a card
    'earn_receive',     -- seller received 1 earn token
    'conversion',       -- earn → unlock conversion
    'cash_withdrawal',  -- earn → cash via Stripe payout
    'rake'              -- platform rake (for audit)
  )),
  unlock_tokens_delta int not null default 0,
  earn_tokens_delta int not null default 0,
  cash_cents_delta int not null default 0,
  stripe_ref text,
  note text,
  created_at timestamptz default now()
);

-- ADVERTISERS (ad slots purchased)
create table if not exists public.advertisers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_email text not null,
  tier text not null check (tier in ('top','lb','native','monthly')),
  price_cents int not null,
  active_from date not null,
  active_to date not null,
  created_at timestamptz default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY — lock down the tables so users can only see their own
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.picks enable row level security;
alter table public.unlocks enable row level security;
alter table public.transactions enable row level security;
alter table public.advertisers enable row level security;

-- Profiles: anyone can read public profile info; only self can update.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
  with check (auth.uid() = id);

-- Picks: anyone can read today's picks (unlocking is enforced at the app layer
-- by only returning the full pick payload when an unlock row exists). Sellers
-- can write their own picks.
drop policy if exists picks_read on public.picks;
create policy picks_read on public.picks for select using (true);

drop policy if exists picks_write_own on public.picks;
create policy picks_write_own on public.picks for insert
  with check (auth.uid() = seller_id);

drop policy if exists picks_update_own on public.picks;
create policy picks_update_own on public.picks for update
  using (auth.uid() = seller_id);

-- Unlocks: users can read their own unlocks (buyer or seller).
drop policy if exists unlocks_read_own on public.unlocks;
create policy unlocks_read_own on public.unlocks for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Transactions: users can read their own.
drop policy if exists tx_read_own on public.transactions;
create policy tx_read_own on public.transactions for select
  using (auth.uid() = user_id);

-- Advertisers: readable by anyone, writable only via service role (backend).
drop policy if exists ads_read on public.advertisers;
create policy ads_read on public.advertisers for select using (true);

-- =========================================================================
-- DONE. Go back to your Supabase dashboard → Table Editor to confirm the
-- tables appear: profiles, picks, unlocks, transactions, advertisers.
-- =========================================================================
