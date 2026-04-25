-- =========================================================================
-- Pro Pick 6 — Follows feature (2026-04-25)
-- =========================================================================
-- Adds a follow / unfollow relationship between users.
--
-- Privacy model:
--   - Public follower COUNT — exposed via profiles.follower_count
--     (denormalized via trigger for fast reads, no joins, no RLS holes).
--   - Private follower LIST — the actual rows in public.follows are
--     readable only by the follower themselves. Nobody can enumerate
--     who follows @SharpMike beyond the count.
--
-- Safe to re-run: uses "create ... if not exists" + "drop policy if exists".
-- =========================================================================

-- 1) Denormalized follower count on profiles.
alter table public.profiles
  add column if not exists follower_count int not null default 0;

-- 2) The follow edge.
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint no_self_follow check (follower_id <> followed_id)
);

-- Index for "who follows X" lookups (used by the trigger and any future feed queries).
create index if not exists follows_followed_id_idx
  on public.follows (followed_id);

-- 3) RLS — own follows visible/editable; everyone else's are hidden.
alter table public.follows enable row level security;

drop policy if exists "follows_select_own" on public.follows;
create policy "follows_select_own"
  on public.follows for select
  using (auth.uid() = follower_id);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own"
  on public.follows for insert
  with check (auth.uid() = follower_id and follower_id <> followed_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- 4) Trigger keeps profiles.follower_count in sync on insert / delete.
create or replace function public.handle_follow_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
      set follower_count = follower_count + 1
      where id = NEW.followed_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.profiles
      set follower_count = greatest(0, follower_count - 1)
      where id = OLD.followed_id;
    return OLD;
  end if;
  return null;
end;
$$;

drop trigger if exists on_follow_insert on public.follows;
create trigger on_follow_insert
  after insert on public.follows
  for each row execute function public.handle_follow_change();

drop trigger if exists on_follow_delete on public.follows;
create trigger on_follow_delete
  after delete on public.follows
  for each row execute function public.handle_follow_change();
