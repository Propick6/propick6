-- =========================================================================
-- Pro Pick 6 — pg_cron schedule for the grade-picks Edge Function
-- =========================================================================
-- Apply order:
--   1. Apply 2026-04-25_pick_grading.sql (schema + trigger)
--   2. Deploy the Edge Function `grade-picks`
--      (source at supabase/functions/grade-picks/index.ts)
--   3. Apply THIS file (cron schedule that calls the deployed function)
-- =========================================================================

-- pg_cron schedules SQL inside the database; pg_net lets us make HTTP calls
-- from those scheduled jobs. Both are first-party Supabase extensions and
-- safe to enable on the free tier.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace any existing schedule with the same name. cron.unschedule throws
-- if the job doesn't exist, so swallow that case.
do $$
begin
  perform cron.unschedule('grade-picks-every-15min');
exception when others then
  null;
end $$;

-- Every 15 minutes, fire-and-forget POST to the Edge Function. The function
-- is idempotent and only acts on pending picks whose game started 3+ hours
-- ago, so frequent calls are cheap (just a no-op when there's nothing to do).
select cron.schedule(
  'grade-picks-every-15min',
  '*/15 * * * *',
  $job$
    select net.http_post(
      url := 'https://uwisbvqmrosygwdawomd.supabase.co/functions/v1/grade-picks',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    ) as request_id;
  $job$
);
