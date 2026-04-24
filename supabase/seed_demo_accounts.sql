-- =========================================================================
-- Pro Pick 6 — Demo accounts seed
-- Creates 10 fake user accounts so the app feels populated during testing.
-- =========================================================================
-- Each account has:
--   email:    <handle>@propick6.demo
--   password: demopass123    (so you can sign in AS them if you want)
-- Emails are pre-confirmed — no need to click a confirmation link.
-- Safe to re-run: uses deterministic UUIDs + ON CONFLICT.
-- =========================================================================

-- Step 1: insert auth.users rows.
-- The on_auth_user_created trigger will auto-create the matching profiles rows.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at
) values
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sharpmike@propick6.demo',    crypt('demopass123', gen_salt('bf')), now(), '{"handle":"SharpMike"}'::jsonb,    now(), now()),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nflnerd@propick6.demo',      crypt('demopass123', gen_salt('bf')), now(), '{"handle":"NFLNerd"}'::jsonb,      now(), now()),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'puckprophet@propick6.demo',  crypt('demopass123', gen_salt('bf')), now(), '{"handle":"PuckProphet"}'::jsonb,  now(), now()),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diamonddan@propick6.demo',   crypt('demopass123', gen_salt('bf')), now(), '{"handle":"DiamondDan"}'::jsonb,   now(), now()),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'coinflipcarl@propick6.demo', crypt('demopass123', gen_salt('bf')), now(), '{"handle":"CoinFlipCarl"}'::jsonb, now(), now()),
  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'linehunter@propick6.demo',   crypt('demopass123', gen_salt('bf')), now(), '{"handle":"LineHunter"}'::jsonb,   now(), now()),
  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chalkcharlie@propick6.demo', crypt('demopass123', gen_salt('bf')), now(), '{"handle":"ChalkCharlie"}'::jsonb, now(), now()),
  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'parlaypete@propick6.demo',   crypt('demopass123', gen_salt('bf')), now(), '{"handle":"ParlayPete"}'::jsonb,   now(), now()),
  ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'locklegend@propick6.demo',   crypt('demopass123', gen_salt('bf')), now(), '{"handle":"LockLegend"}'::jsonb,   now(), now()),
  ('a0000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'underdogdom@propick6.demo',  crypt('demopass123', gen_salt('bf')), now(), '{"handle":"UnderDogDom"}'::jsonb,  now(), now())
on conflict (id) do nothing;

-- Step 2: upsert profile stats. Profile rows already exist (the trigger made them),
-- we're just filling in sport / wins / losses / roi.
-- Safe to re-run — stats refresh to these values every time.
update public.profiles set
  handle = 'SharpMike',    sport = 'NBA',   wins = 27, losses = 11, pushes = 0, roi = 18.4
where id = 'a0000000-0000-0000-0000-000000000001';

update public.profiles set
  handle = 'NFLNerd',      sport = 'NFL',   wins = 19, losses = 9,  pushes = 0, roi = 14.2
where id = 'a0000000-0000-0000-0000-000000000002';

update public.profiles set
  handle = 'PuckProphet',  sport = 'NHL',   wins = 14, losses = 7,  pushes = 0, roi = 11.0
where id = 'a0000000-0000-0000-0000-000000000003';

update public.profiles set
  handle = 'DiamondDan',   sport = 'MLB',   wins = 22, losses = 18, pushes = 0, roi = 4.2
where id = 'a0000000-0000-0000-0000-000000000004';

update public.profiles set
  handle = 'CoinFlipCarl', sport = 'NBA',   wins = 9,  losses = 16, pushes = 0, roi = -12.1
where id = 'a0000000-0000-0000-0000-000000000005';

update public.profiles set
  handle = 'LineHunter',   sport = 'NFL',   wins = 31, losses = 17, pushes = 2, roi = 16.8
where id = 'a0000000-0000-0000-0000-000000000006';

update public.profiles set
  handle = 'ChalkCharlie', sport = 'NFL',   wins = 24, losses = 20, pushes = 0, roi = 2.1
where id = 'a0000000-0000-0000-0000-000000000007';

update public.profiles set
  handle = 'ParlayPete',   sport = 'NBA',   wins = 8,  losses = 22, pushes = 0, roi = -18.5
where id = 'a0000000-0000-0000-0000-000000000008';

update public.profiles set
  handle = 'LockLegend',   sport = 'NCAAF', wins = 18, losses = 10, pushes = 1, roi = 9.3
where id = 'a0000000-0000-0000-0000-000000000009';

update public.profiles set
  handle = 'UnderDogDom',  sport = 'MLB',   wins = 15, losses = 13, pushes = 0, roi = 6.7
where id = 'a0000000-0000-0000-0000-00000000000a';

-- Verify with:  select handle, sport, wins, losses, roi from public.profiles
--               where id::text like 'a0000000%';
-- Should return 10 rows.
