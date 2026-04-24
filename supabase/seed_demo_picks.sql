-- =========================================================================
-- Pro Pick 6 — Demo picks seed
-- 5 picks for each demo account, dates spread over the last 5 days, mix of
-- results weighted by each capper's ROI (hot accounts win more, cold lose more).
-- Run AFTER seed_demo_accounts.sql so the seller_id FKs resolve.
-- =========================================================================
-- NOT strictly idempotent (each run inserts fresh rows). If you want to
-- re-seed, first delete existing demo picks with:
--   delete from public.picks where seller_id::text like 'a0000000%';
-- =========================================================================

insert into public.picks (seller_id, sport, pick_type, matchup, selection, pick_date, result) values
  -- SharpMike (NBA, hot, +18.4% ROI)
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'LAL @ BOS',        'Celtics -4.5',        '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'ML',     'DEN @ PHX',        'Nuggets ML',          '2026-04-21', 'win'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'O/U',    'MIA @ NYK',        'Over 214.5',          '2026-04-20', 'win'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Prop',   'Tatum Points',     'Over 28.5',           '2026-04-19', 'loss'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'GSW @ MEM',        'Grizzlies +2.5',      '2026-04-23', 'pending'),

  -- NFLNerd (NFL, hot, +14.2%)
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'ML',     'KC @ BUF',         'Bills ML',            '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'O/U',    'DAL @ PHI',        'Under 48.5',          '2026-04-21', 'win'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Prop',   'Mahomes Pass Yds', 'Over 285.5',          '2026-04-20', 'loss'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Spread', 'SF @ SEA',         '49ers -5',            '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'ML',     'BAL @ CIN',        'Ravens ML',           '2026-04-23', 'pending'),

  -- PuckProphet (NHL, +11%)
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'ML',     'TOR @ MTL',        'Leafs ML',            '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Spread', 'EDM @ VAN',        'Oilers -1.5',         '2026-04-21', 'loss'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'O/U',    'BOS @ FLA',        'Over 6.5',            '2026-04-20', 'win'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Prop',   'McDavid Points',   'Over 1.5',            '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'ML',     'COL @ DAL',        'Avalanche ML',        '2026-04-23', 'pending'),

  -- DiamondDan (MLB, neutral +4.2%)
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'ML',     'NYY @ BOS',        'Yankees ML',          '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'O/U',    'LAD @ SD',         'Over 8.5',            '2026-04-21', 'loss'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'Spread', 'HOU @ TEX',        'Astros -1.5',         '2026-04-20', 'loss'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'Prop',   'Judge HR',         'Yes +220',            '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'ML',     'ATL @ NYM',        'Braves ML',           '2026-04-23', 'pending'),

  -- CoinFlipCarl (NBA, cold -12.1%)
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'Spread', 'SAC @ POR',        'Kings -1.5',          '2026-04-22', 'loss'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'ML',     'CHA @ ATL',        'Hornets ML',          '2026-04-21', 'loss'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'O/U',    'ORL @ WAS',        'Over 221',            '2026-04-20', 'loss'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'Prop',   'LaMelo Ast',       'Over 7.5',            '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'Parlay', '4-leg dog parlay', '+1200',               '2026-04-23', 'pending'),

  -- LineHunter (NFL, hot +16.8%)
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Spread', 'GB @ CHI',         'Packers -3',          '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'ML',     'MIA @ NE',         'Dolphins ML',         '2026-04-21', 'win'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'O/U',    'LAR @ ARI',        'Over 44.5',           '2026-04-20', 'win'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Prop',   'Allen Pass Yds',   'Over 265',            '2026-04-19', 'loss'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Spread', 'NYG @ WAS',        'Giants +3.5',         '2026-04-23', 'pending'),

  -- ChalkCharlie (NFL, neutral +2.1%)
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'ML',     'DET @ TB',         'Lions ML',            '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'Spread', 'IND @ TEN',        'Colts -2',            '2026-04-21', 'loss'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'O/U',    'JAX @ HOU',        'Under 42',            '2026-04-20', 'loss'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'Prop',   'Henry Rush Yds',   'Over 85.5',           '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'ML',     'LV @ LAC',         'Chargers ML',         '2026-04-23', 'pending'),

  -- ParlayPete (NBA, cold -18.5%)
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'Parlay', '3-leg Parlay',     '+650',                '2026-04-22', 'loss'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'Parlay', '4-leg Parlay',     '+1100',               '2026-04-21', 'loss'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'ML',     'CLE @ TOR',        'Raptors ML',          '2026-04-20', 'loss'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'O/U',    'POR @ DET',        'Over 225',            '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'Parlay', '5-leg Parlay',     '+2500',               '2026-04-23', 'pending'),

  -- LockLegend (NCAAF, +9.3%)
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'Spread',  'Georgia @ Bama',   'Georgia -14',     '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'ML',      'OSU @ MICH',       'Buckeyes ML',     '2026-04-21', 'win'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'Futures', 'OSU CFP',          'To make CFP +150','2026-04-20', 'pending'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'Prop',    'Ewers TDs',        'Over 2.5',        '2026-04-19', 'win'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'O/U',     'TEX @ OU',         'Over 58',         '2026-04-23', 'pending'),

  -- UnderDogDom (MLB, +6.7%)
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'OAK @ SEA', 'Athletics +180', '2026-04-22', 'win'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'PIT @ CIN', 'Pirates +140',   '2026-04-21', 'loss'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'KC @ CWS',  'Royals +130',    '2026-04-20', 'win'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'MIA @ WSH', 'Marlins +160',   '2026-04-19', 'loss'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'MIN @ CLE', 'Twins +115',     '2026-04-23', 'pending');

-- =========================================================================
-- Extra picks for today — the top 4 cappers hit the 6-pick feed minimum
-- so the home feed has something to render. Others stay hidden.
-- =========================================================================

insert into public.picks (seller_id, sport, pick_type, matchup, selection, pick_date, result) values
  -- SharpMike (brings him from 1 → 7 picks today)
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'PHI @ MIL',       'Bucks -3',          '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'ML',     'OKC @ NOP',       'Thunder ML',        '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'O/U',    'CHI @ MIN',       'Over 218.5',        '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Prop',   'Curry 3PTM',      'Over 4.5',          '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'UTA @ HOU',       'Jazz +6',           '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Parlay', '3-leg parlay',    'BOS/DEN/MIL ML',    '2026-04-23', 'pending'),

  -- NFLNerd (1 → 6)
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Spread', 'CLE @ PIT',       'Steelers -2.5',     '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'O/U',    'NE @ NYJ',        'Under 38.5',        '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'ML',     'DEN @ KC',        'Chiefs ML',         '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Prop',   'Hurts Rush',      'Over 45.5',         '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Spread', 'ATL @ CAR',       'Falcons -4.5',      '2026-04-23', 'pending'),

  -- PuckProphet (1 → 6)
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Spread', 'TBL @ WSH',       'Lightning -1.5',    '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'O/U',    'VGK @ CGY',       'Over 6',            '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'ML',     'SJ @ ANA',        'Sharks ML',         '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Prop',   'Draisaitl Pts',   'Over 1.5',          '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Spread', 'NYR @ PHI',       'Rangers -1.5',      '2026-04-23', 'pending'),

  -- LineHunter (1 → 6)
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'ML',     'SEA @ LAR',       'Rams ML',           '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Spread', 'NO @ TB',         'Bucs -6',           '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'O/U',    'MIN @ DET',       'Over 48',           '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Prop',   'Lamar Rush',      'Over 58.5',         '2026-04-23', 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Parlay', '2-leg ML parlay', 'KC/LAR +180',       '2026-04-23', 'pending');

-- Verify: 71 total demo picks (50 history + 21 today for the 4 active cappers)
-- select count(*) from public.picks where seller_id::text like 'a0000000%';
