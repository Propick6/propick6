-- =========================================================================
-- Pro Pick 6 — Pick grading scaffolding (2026-04-25)
-- =========================================================================
-- Adds the structured fields the auto-grader needs and a trigger that keeps
-- profiles.wins/losses/pushes in sync as picks transition out of 'pending'.
--
-- Scope: ML (moneyline) auto-grading only. Spreads, totals, props, parlays,
-- futures all stay manual until we wire an odds/lines provider.
--
-- Picks made via free-text matchup (no game from the +Pick picker) won't have
-- external_game_id and will simply remain pending — the grader skips them.
-- =========================================================================

-- ---------- 1. Structured fields on picks ----------
alter table public.picks
  add column if not exists external_game_id text,        -- ESPN event id
  add column if not exists pick_side text
    check (pick_side is null or pick_side in ('home','away')),
  add column if not exists commences_at timestamptz;     -- game start time

-- Lookup index used by the grader: pending + has-a-game-id, ordered by start.
create index if not exists picks_pending_grader_idx
  on public.picks (commences_at)
  where result = 'pending' and external_game_id is not null;

-- ---------- 2. Trigger: keep profiles record in sync as picks grade ----------
-- Fires on every UPDATE; only acts when result transitions out of 'pending'.
-- Forward transitions only for v1 (pending → win/loss/push). Reverse / change
-- transitions are an edge case we'll handle if and when grading correction UX
-- shows up; safer to write a backfill script later than to risk double-counts.
create or replace function public.handle_pick_graded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.result = 'pending' and NEW.result in ('win','loss','push') then
    update public.profiles
      set wins   = wins   + (case when NEW.result = 'win'  then 1 else 0 end),
          losses = losses + (case when NEW.result = 'loss' then 1 else 0 end),
          pushes = pushes + (case when NEW.result = 'push' then 1 else 0 end)
      where id = NEW.seller_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_pick_result_update on public.picks;
create trigger on_pick_result_update
  after update on public.picks
  for each row execute function public.handle_pick_graded();
