-- =========================================================================
-- Pro Pick 6 — Pools module schema
-- Paste this into Supabase SQL Editor AFTER running schema.sql (the main one),
-- because these tables reference public.profiles.
-- Safe to re-run: uses "create table if not exists" and "drop policy if exists".
-- =========================================================================

-- NHL PLAYERS (master list; populated from NHL stats API later)
create table if not exists public.nhl_players (
  id text primary key,            -- e.g. "p_McDavid_EDM" or NHL player id
  name text not null,
  team text not null,
  position text not null check (position in ('F','D','G')),
  -- Running season totals. Updated by a scheduled job.
  goals int not null default 0,
  assists int not null default 0,
  pim int not null default 0,
  wins int not null default 0,
  shutouts int not null default 0,
  updated_at timestamptz default now()
);

-- POOLS (one row per pool, official or user-created)
create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('official','private')),
  sport text not null default 'NHL',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entry_model text not null check (entry_model in ('free','tokens')),
  entry_tokens int not null default 0,         -- 🟡 cost if entry_model='tokens'
  duration text not null check (duration in ('night','week','month','playoffs','season')),
  starts_on date,
  ends_on date,
  max_entries int not null default 0,          -- 0 = unlimited
  roster_forwards int not null default 6,
  roster_defense int not null default 3,
  roster_goalies int not null default 1,
  scoring_goal int not null default 2,
  scoring_assist int not null default 1,
  scoring_pim int not null default 0,
  scoring_goalie_win int not null default 2,
  scoring_goalie_shutout int not null default 3,
  unique_draft boolean not null default false, -- true = player can only be on one team
  join_code text unique,                       -- private pools
  prize_pool text,                             -- free-form display string
  created_at timestamptz default now()
);

create index if not exists pools_kind_idx on public.pools (kind);
create index if not exists pools_owner_idx on public.pools (owner_id);

-- POOL ENTRIES (one row per team in a pool)
create table if not exists public.pool_entries (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  team_name text not null,
  locked boolean not null default false,       -- true once draft deadline passes
  created_at timestamptz default now(),
  unique (pool_id, owner_id)                   -- one entry per user per pool
);

-- POOL ENTRY PLAYERS (the roster picks for each team)
create table if not exists public.pool_entry_players (
  entry_id uuid not null references public.pool_entries(id) on delete cascade,
  player_id text not null references public.nhl_players(id) on delete restrict,
  primary key (entry_id, player_id)
);

-- Optional: POOL PAYOUTS (tracks prize distribution once a pool settles)
create table if not exists public.pool_payouts (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  entry_id uuid not null references public.pool_entries(id) on delete cascade,
  place int not null,                          -- 1, 2, 3, ...
  unlock_tokens int not null default 0,
  note text,
  paid_at timestamptz default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table public.nhl_players enable row level security;
alter table public.pools enable row level security;
alter table public.pool_entries enable row level security;
alter table public.pool_entry_players enable row level security;
alter table public.pool_payouts enable row level security;

-- Players: readable by anyone. Writes happen from the backend (service role).
drop policy if exists players_read on public.nhl_players;
create policy players_read on public.nhl_players for select using (true);

-- Pools: anyone can read (we'll filter "private" visibility at the app layer
-- by requiring the join_code). Owners can update their own pools.
drop policy if exists pools_read on public.pools;
create policy pools_read on public.pools for select using (true);

drop policy if exists pools_insert_own on public.pools;
create policy pools_insert_own on public.pools for insert
  with check (auth.uid() = owner_id);

drop policy if exists pools_update_own on public.pools;
create policy pools_update_own on public.pools for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Entries: anyone can read (needed for leaderboards). Only the owner can
-- insert/update their own entry, and only before it's locked.
drop policy if exists entries_read on public.pool_entries;
create policy entries_read on public.pool_entries for select using (true);

drop policy if exists entries_insert_own on public.pool_entries;
create policy entries_insert_own on public.pool_entries for insert
  with check (auth.uid() = owner_id);

drop policy if exists entries_update_own on public.pool_entries;
create policy entries_update_own on public.pool_entries for update
  using (auth.uid() = owner_id and locked = false)
  with check (auth.uid() = owner_id);

-- Entry players: readable by anyone. Writable only by the entry's owner, and
-- only while the entry is unlocked.
drop policy if exists entry_players_read on public.pool_entry_players;
create policy entry_players_read on public.pool_entry_players for select using (true);

drop policy if exists entry_players_write_own on public.pool_entry_players;
create policy entry_players_write_own on public.pool_entry_players for insert
  with check (
    exists (
      select 1 from public.pool_entries e
      where e.id = entry_id
        and e.owner_id = auth.uid()
        and e.locked = false
    )
  );

drop policy if exists entry_players_delete_own on public.pool_entry_players;
create policy entry_players_delete_own on public.pool_entry_players for delete
  using (
    exists (
      select 1 from public.pool_entries e
      where e.id = entry_id
        and e.owner_id = auth.uid()
        and e.locked = false
    )
  );

-- Payouts: readable by anyone. Written by backend (service role).
drop policy if exists payouts_read on public.pool_payouts;
create policy payouts_read on public.pool_payouts for select using (true);

-- =========================================================================
-- VIEW — live leaderboard per pool, computed from roster + player stats
-- =========================================================================
-- Saves the app from having to do the math on every request.
create or replace view public.pool_leaderboard as
select
  e.id          as entry_id,
  e.pool_id,
  e.owner_id,
  e.team_name,
  sum(
    coalesce(pl.goals,0)     * p.scoring_goal +
    coalesce(pl.assists,0)   * p.scoring_assist +
    coalesce(pl.pim,0)       * p.scoring_pim +
    coalesce(pl.wins,0)      * p.scoring_goalie_win +
    coalesce(pl.shutouts,0)  * p.scoring_goalie_shutout
  ) as total_points
from public.pool_entries e
join public.pools p                 on p.id = e.pool_id
left join public.pool_entry_players ep on ep.entry_id = e.id
left join public.nhl_players pl     on pl.id = ep.player_id
group by e.id, e.pool_id, e.owner_id, e.team_name;

-- =========================================================================
-- DONE. Go back to Table Editor in Supabase to confirm these appear:
--   nhl_players, pools, pool_entries, pool_entry_players, pool_payouts
-- =========================================================================
