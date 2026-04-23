-- =========================================================================
-- Pro Pick 6 — NHL players seed
-- Run AFTER pools_schema.sql has created the nhl_players table.
-- Safe to re-run: uses ON CONFLICT DO UPDATE so it refreshes existing rows.
-- =========================================================================
-- Columns: id, name, team, position, goals, assists, pim, wins, shutouts
-- IDs match what the app expects (e.g. "p_McDavid_EDM").

insert into public.nhl_players (id, name, team, position, goals, assists, pim, wins, shutouts) values
  -- Forwards
  ('p_McDavid_EDM',    'McDavid',    'EDM', 'F', 62, 92, 18, 0, 0),
  ('p_Draisaitl_EDM',  'Draisaitl',  'EDM', 'F', 55, 70, 22, 0, 0),
  ('p_Matthews_TOR',   'Matthews',   'TOR', 'F', 68, 45, 30, 0, 0),
  ('p_Marner_TOR',     'Marner',     'TOR', 'F', 30, 72, 16, 0, 0),
  ('p_Nylander_TOR',   'Nylander',   'TOR', 'F', 42, 58, 12, 0, 0),
  ('p_Pastrnak_BOS',   'Pastrnak',   'BOS', 'F', 48, 60, 24, 0, 0),
  ('p_MacKinnon_COL',  'MacKinnon',  'COL', 'F', 50, 78, 20, 0, 0),
  ('p_Rantanen_COL',   'Rantanen',   'COL', 'F', 44, 66, 18, 0, 0),
  ('p_Kucherov_TBL',   'Kucherov',   'TBL', 'F', 46, 82, 30, 0, 0),
  ('p_Point_TBL',      'Point',      'TBL', 'F', 38, 50, 14, 0, 0),
  ('p_Panarin_NYR',    'Panarin',    'NYR', 'F', 42, 68, 22, 0, 0),
  ('p_Zibanejad_NYR',  'Zibanejad',  'NYR', 'F', 30, 48, 26, 0, 0),
  ('p_Reinhart_FLA',   'Reinhart',   'FLA', 'F', 50, 45, 14, 0, 0),
  ('p_Tkachuk_FLA',    'Tkachuk',    'FLA', 'F', 36, 58, 88, 0, 0),
  ('p_Crosby_PIT',     'Crosby',     'PIT', 'F', 34, 60, 18, 0, 0),
  ('p_Malkin_PIT',     'Malkin',     'PIT', 'F', 28, 50, 40, 0, 0),
  ('p_Eichel_VGK',     'Eichel',     'VGK', 'F', 32, 58, 22, 0, 0),
  ('p_Stone_VGK',      'Stone',      'VGK', 'F', 28, 42, 20, 0, 0),
  ('p_Hughes_J_NJD',   'Hughes_J',   'NJD', 'F', 36, 62, 20, 0, 0),
  ('p_Bratt_NJD',      'Bratt',      'NJD', 'F', 28, 50, 16, 0, 0),
  ('p_Peterka_BUF',    'Peterka',    'BUF', 'F', 24, 38, 18, 0, 0),
  ('p_Thompson_BUF',   'Thompson',   'BUF', 'F', 32, 40, 22, 0, 0),
  ('p_Robertson_DAL',  'Robertson',  'DAL', 'F', 34, 48, 10, 0, 0),
  ('p_Hintz_DAL',      'Hintz',      'DAL', 'F', 30, 45, 14, 0, 0),
  ('p_Bedard_CHI',     'Bedard',     'CHI', 'F', 28, 44, 16, 0, 0),
  ('p_Kaprizov_MIN',   'Kaprizov',   'MIN', 'F', 44, 52, 24, 0, 0),
  ('p_Suzuki_MTL',     'Suzuki',     'MTL', 'F', 26, 50, 14, 0, 0),
  ('p_Caufield_MTL',   'Caufield',   'MTL', 'F', 30, 34, 12, 0, 0),
  ('p_Hischier_NJD',   'Hischier',   'NJD', 'F', 24, 42, 20, 0, 0),
  ('p_DeBrincat_DET',  'DeBrincat',  'DET', 'F', 30, 40, 22, 0, 0),

  -- Defense
  ('p_Makar_COL',      'Makar',      'COL', 'D', 22, 68, 30, 0, 0),
  ('p_Hughes_Q_VAN',   'Hughes_Q',   'VAN', 'D', 18, 72, 20, 0, 0),
  ('p_Fox_NYR',        'Fox',        'NYR', 'D', 16, 60, 18, 0, 0),
  ('p_Werenski_CBJ',   'Werenski',   'CBJ', 'D', 18, 52, 30, 0, 0),
  ('p_Heiskanen_DAL',  'Heiskanen',  'DAL', 'D', 14, 58, 24, 0, 0),
  ('p_Josi_NSH',       'Josi',       'NSH', 'D', 20, 55, 28, 0, 0),
  ('p_Sergachev_UTA',  'Sergachev',  'UTA', 'D', 12, 40, 36, 0, 0),
  ('p_McAvoy_BOS',     'McAvoy',     'BOS', 'D', 10, 45, 40, 0, 0),
  ('p_Dahlin_BUF',     'Dahlin',     'BUF', 'D', 18, 50, 30, 0, 0),
  ('p_Rielly_TOR',     'Rielly',     'TOR', 'D', 10, 48, 22, 0, 0),
  ('p_Carlson_WSH',    'Carlson',    'WSH', 'D', 14, 52, 24, 0, 0),
  ('p_Ekblad_FLA',     'Ekblad',     'FLA', 'D', 12, 36, 34, 0, 0),

  -- Goalies
  ('p_Hellebuyck_WPG', 'Hellebuyck', 'WPG', 'G', 0, 0, 0, 38, 8),
  ('p_Shesterkin_NYR', 'Shesterkin', 'NYR', 'G', 0, 0, 0, 32, 6),
  ('p_Bobrovsky_FLA',  'Bobrovsky',  'FLA', 'G', 0, 0, 0, 35, 5),
  ('p_Sorokin_NYI',    'Sorokin',    'NYI', 'G', 0, 0, 0, 30, 4),
  ('p_Oettinger_DAL',  'Oettinger',  'DAL', 'G', 0, 0, 0, 34, 4),
  ('p_Saros_NSH',      'Saros',      'NSH', 'G', 0, 0, 0, 28, 3),
  ('p_Hill_VGK',       'Hill',       'VGK', 'G', 0, 0, 0, 27, 3),
  ('p_Skinner_EDM',    'Skinner',    'EDM', 'G', 0, 0, 0, 29, 2),
  ('p_Swayman_BOS',    'Swayman',    'BOS', 'G', 0, 0, 0, 26, 4),
  ('p_Kuemper_LAK',    'Kuemper',    'LAK', 'G', 0, 0, 0, 24, 2)
on conflict (id) do update set
  name       = excluded.name,
  team       = excluded.team,
  position   = excluded.position,
  goals      = excluded.goals,
  assists    = excluded.assists,
  pim        = excluded.pim,
  wins       = excluded.wins,
  shutouts   = excluded.shutouts,
  updated_at = now();

-- Verify with:  select count(*) from public.nhl_players;   -- should return 52
