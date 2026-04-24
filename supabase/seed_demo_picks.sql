-- =========================================================================
-- Pro Pick 6 — Demo picks seed
-- 5 history picks + extras for today per capper. Dates are RELATIVE to
-- current_date so the data stays fresh no matter when this is run.
-- Run AFTER seed_demo_accounts.sql.
-- =========================================================================
-- To refresh dates on existing seed rows without re-inserting, run only the
-- final UPDATE block at the bottom of this file.
-- =========================================================================

-- Clear out any prior demo picks so dates stay consistent on re-seed.
delete from public.picks where seller_id::text like 'a0000000%';

insert into public.picks (seller_id, sport, pick_type, matchup, selection, pick_date, result) values
  -- =========================================================================
  -- HISTORY (4 picks each, dates 4d→1d ago, mix of results by ROI)
  -- =========================================================================

  -- SharpMike (NBA, hot, +18.4% ROI)
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'LAL @ BOS',        'Celtics -4.5',        current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'ML',     'DEN @ PHX',        'Nuggets ML',          current_date - 2, 'win'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'O/U',    'MIA @ NYK',        'Over 214.5',          current_date - 3, 'win'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Prop',   'Tatum Points',     'Over 28.5',           current_date - 4, 'loss'),

  -- NFLNerd (NFL, hot, +14.2%)
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'ML',     'KC @ BUF',         'Bills ML',            current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'O/U',    'DAL @ PHI',        'Under 48.5',          current_date - 2, 'win'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Prop',   'Mahomes Pass Yds', 'Over 285.5',          current_date - 3, 'loss'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Spread', 'SF @ SEA',         '49ers -5',            current_date - 4, 'win'),

  -- PuckProphet (NHL, +11%)
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'ML',     'TOR @ MTL',        'Leafs ML',            current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Spread', 'EDM @ VAN',        'Oilers -1.5',         current_date - 2, 'loss'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'O/U',    'BOS @ FLA',        'Over 6.5',            current_date - 3, 'win'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Prop',   'McDavid Points',   'Over 1.5',            current_date - 4, 'win'),

  -- DiamondDan (MLB, neutral +4.2%)
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'ML',     'NYY @ BOS',        'Yankees ML',          current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'O/U',    'LAD @ SD',         'Over 8.5',            current_date - 2, 'loss'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'Spread', 'HOU @ TEX',        'Astros -1.5',         current_date - 3, 'loss'),
  ('a0000000-0000-0000-0000-000000000004', 'MLB', 'Prop',   'Judge HR',         'Yes +220',            current_date - 4, 'win'),

  -- CoinFlipCarl (NBA, cold -12.1%)
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'Spread', 'SAC @ POR',        'Kings -1.5',          current_date - 1, 'loss'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'ML',     'CHA @ ATL',        'Hornets ML',          current_date - 2, 'loss'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'O/U',    'ORL @ WAS',        'Over 221',            current_date - 3, 'loss'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA', 'Prop',   'LaMelo Ast',       'Over 7.5',            current_date - 4, 'win'),

  -- LineHunter (NFL, hot +16.8%)
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Spread', 'GB @ CHI',         'Packers -3',          current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'ML',     'MIA @ NE',         'Dolphins ML',         current_date - 2, 'win'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'O/U',    'LAR @ ARI',        'Over 44.5',           current_date - 3, 'win'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Prop',   'Allen Pass Yds',   'Over 265',            current_date - 4, 'loss'),

  -- ChalkCharlie (NFL, neutral +2.1%)
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'ML',     'DET @ TB',         'Lions ML',            current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'Spread', 'IND @ TEN',        'Colts -2',            current_date - 2, 'loss'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'O/U',    'JAX @ HOU',        'Under 42',            current_date - 3, 'loss'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL', 'Prop',   'Henry Rush Yds',   'Over 85.5',           current_date - 4, 'win'),

  -- ParlayPete (NBA, cold -18.5%)
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'Parlay', '3-leg Parlay',     '+650',                current_date - 1, 'loss'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'Parlay', '4-leg Parlay',     '+1100',               current_date - 2, 'loss'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'ML',     'CLE @ TOR',        'Raptors ML',          current_date - 3, 'loss'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA', 'O/U',    'POR @ DET',        'Over 225',            current_date - 4, 'win'),

  -- LockLegend (NCAAF, +9.3%)
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'Spread',  'Georgia @ Bama', 'Georgia -14',         current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'ML',      'OSU @ MICH',     'Buckeyes ML',         current_date - 2, 'win'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'Futures', 'OSU CFP',        'To make CFP +150',    current_date - 3, 'pending'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'Prop',    'Ewers TDs',      'Over 2.5',            current_date - 4, 'win'),

  -- UnderDogDom (MLB, +6.7%)
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'OAK @ SEA',   'Athletics +180', current_date - 1, 'win'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'PIT @ CIN',   'Pirates +140',   current_date - 2, 'loss'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'KC @ CWS',    'Royals +130',    current_date - 3, 'win'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB', 'ML', 'MIA @ WSH',   'Marlins +160',   current_date - 4, 'loss'),

  -- =========================================================================
  -- TODAY — only 4 cappers hit the 6-pick minimum so the feed has something
  -- =========================================================================

  -- SharpMike → 7 picks today
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'GSW @ MEM',        'Grizzlies +2.5',    current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'PHI @ MIL',        'Bucks -3',          current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'ML',     'OKC @ NOP',        'Thunder ML',        current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'O/U',    'CHI @ MIN',        'Over 218.5',        current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Prop',   'Curry 3PTM',       'Over 4.5',          current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Spread', 'UTA @ HOU',        'Jazz +6',           current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000001', 'NBA', 'Parlay', '3-leg parlay',     'BOS/DEN/MIL ML',    current_date, 'pending'),

  -- NFLNerd → 6
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'ML',     'BAL @ CIN',        'Ravens ML',         current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Spread', 'CLE @ PIT',        'Steelers -2.5',     current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'O/U',    'NE @ NYJ',         'Under 38.5',        current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'ML',     'DEN @ KC',         'Chiefs ML',         current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Prop',   'Hurts Rush',       'Over 45.5',         current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000002', 'NFL', 'Spread', 'ATL @ CAR',        'Falcons -4.5',      current_date, 'pending'),

  -- PuckProphet → 6
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'ML',     'COL @ DAL',        'Avalanche ML',      current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Spread', 'TBL @ WSH',        'Lightning -1.5',    current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'O/U',    'VGK @ CGY',        'Over 6',            current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'ML',     'SJ @ ANA',         'Sharks ML',         current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Prop',   'Draisaitl Pts',    'Over 1.5',          current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000003', 'NHL', 'Spread', 'NYR @ PHI',        'Rangers -1.5',      current_date, 'pending'),

  -- LineHunter → 6
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Spread', 'NYG @ WAS',        'Giants +3.5',       current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'ML',     'SEA @ LAR',        'Rams ML',           current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Spread', 'NO @ TB',          'Bucs -6',           current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'O/U',    'MIN @ DET',        'Over 48',           current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Prop',   'Lamar Rush',       'Over 58.5',         current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000006', 'NFL', 'Parlay', '2-leg ML parlay',  'KC/LAR +180',       current_date, 'pending'),

  -- Other 6 cappers get 1 pending pick each so they appear as "hidden"
  ('a0000000-0000-0000-0000-000000000004', 'MLB',   'ML',     'ATL @ NYM',      'Braves ML',         current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000005', 'NBA',   'Parlay', '4-leg dog parlay','+1200',            current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000007', 'NFL',   'ML',     'LV @ LAC',       'Chargers ML',       current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000008', 'NBA',   'Parlay', '5-leg Parlay',   '+2500',             current_date, 'pending'),
  ('a0000000-0000-0000-0000-000000000009', 'NCAAF', 'O/U',    'TEX @ OU',       'Over 58',           current_date, 'pending'),
  ('a0000000-0000-0000-0000-00000000000a', 'MLB',   'ML',     'MIN @ CLE',      'Twins +115',        current_date, 'pending');

-- Verify: 71 total demo picks (40 history + 31 today)
-- select count(*) from public.picks where seller_id::text like 'a0000000%';

-- If you ever need to refresh dates without re-inserting, the full
-- DELETE + INSERT above handles it. No separate update path needed.
