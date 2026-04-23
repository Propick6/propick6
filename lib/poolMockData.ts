// =============================================================================
// Pool module mock data — NHL fantasy pools
// Replaces with Supabase queries once pools_schema.sql is applied.
// =============================================================================

export type Position = "F" | "D" | "G";

export type NhlPlayer = {
  id: string;
  name: string;
  team: string;          // NHL team abbr (TOR, EDM, ...)
  position: Position;    // F = Forward, D = Defenseman, G = Goalie
  // Season-to-date stats (mock). Real build pulls from NHL API.
  goals: number;
  assists: number;
  pim: number;           // Penalty minutes
  // Goalie-specific (0 for skaters)
  wins: number;
  shutouts: number;
  // Computed field used for leaderboard pricing/ranking
  fantasyPoints: number;
};

// Scoring rules — configurable per pool. These are the defaults.
export type ScoringRules = {
  goal: number;
  assist: number;
  pim: number;           // points per penalty minute (usually 0 or small)
  goalieWin: number;
  goalieShutout: number;
};

export const DEFAULT_SCORING: ScoringRules = {
  goal: 2,
  assist: 1,
  pim: 0,
  goalieWin: 2,
  goalieShutout: 3,
};

export type RosterRules = {
  forwards: number;
  defense: number;
  goalies: number;
};

export const DEFAULT_ROSTER: RosterRules = {
  forwards: 6,
  defense: 3,
  goalies: 1,
};

export type PoolKind = "official" | "private";
export type EntryModel = "free" | "tokens";
export type PoolDuration = "night" | "week" | "month" | "playoffs" | "season";

export type Pool = {
  id: string;
  name: string;
  kind: PoolKind;            // official = run by Pro Pick 6, private = user-created
  sport: "NHL";              // locked for now — pools module starts NHL-first
  ownerHandle: string;       // handle of the creator (or "propick6" for official)
  entryModel: EntryModel;    // free or tokens
  entryTokens: number;       // 🟡 cost if entryModel=tokens, else 0
  duration: PoolDuration;
  startsOn: string;          // display string (e.g. "Tonight 7pm", "Apr 28")
  endsOn: string;            // display string
  maxEntries: number;        // 0 = unlimited
  currentEntries: number;    // how many teams have joined
  roster: RosterRules;
  scoring: ScoringRules;
  // Unique-player draft means a player can only be on one team in the pool.
  // False = independent picks (same player can be on many teams) — simpler.
  uniqueDraft: boolean;
  joinCode?: string;         // for private pools
  prizePool?: string;        // display string (e.g. "50 🟡", "Bragging rights")
};

export type PoolEntry = {
  id: string;
  poolId: string;
  ownerHandle: string;
  teamName: string;
  playerIds: string[];       // players on the roster
  totalPoints: number;       // computed from players + scoring rules
};

// -----------------------------------------------------------------------------
// NHL player list — mock, intentionally a cross-section of real stars by team.
// -----------------------------------------------------------------------------
// Keep names/teams realistic so the UI looks legit even before real data.
export const nhlPlayers: NhlPlayer[] = [
  // Forwards
  mkF("McDavid",     "EDM", 62, 92, 18),
  mkF("Draisaitl",   "EDM", 55, 70, 22),
  mkF("Matthews",    "TOR", 68, 45, 30),
  mkF("Marner",      "TOR", 30, 72, 16),
  mkF("Nylander",    "TOR", 42, 58, 12),
  mkF("Pastrnak",    "BOS", 48, 60, 24),
  mkF("MacKinnon",   "COL", 50, 78, 20),
  mkF("Rantanen",    "COL", 44, 66, 18),
  mkF("Kucherov",    "TBL", 46, 82, 30),
  mkF("Point",       "TBL", 38, 50, 14),
  mkF("Panarin",     "NYR", 42, 68, 22),
  mkF("Zibanejad",   "NYR", 30, 48, 26),
  mkF("Reinhart",    "FLA", 50, 45, 14),
  mkF("Tkachuk",     "FLA", 36, 58, 88),
  mkF("Crosby",      "PIT", 34, 60, 18),
  mkF("Malkin",      "PIT", 28, 50, 40),
  mkF("Eichel",      "VGK", 32, 58, 22),
  mkF("Stone",       "VGK", 28, 42, 20),
  mkF("Hughes_J",    "NJD", 36, 62, 20),
  mkF("Bratt",       "NJD", 28, 50, 16),
  mkF("Peterka",     "BUF", 24, 38, 18),
  mkF("Thompson",    "BUF", 32, 40, 22),
  mkF("Robertson",   "DAL", 34, 48, 10),
  mkF("Hintz",       "DAL", 30, 45, 14),
  mkF("Bedard",      "CHI", 28, 44, 16),
  mkF("Kaprizov",    "MIN", 44, 52, 24),
  mkF("Suzuki",      "MTL", 26, 50, 14),
  mkF("Caufield",    "MTL", 30, 34, 12),
  mkF("Hischier",    "NJD", 24, 42, 20),
  mkF("DeBrincat",   "DET", 30, 40, 22),

  // Defense
  mkD("Makar",       "COL", 22, 68, 30),
  mkD("Hughes_Q",    "VAN", 18, 72, 20),
  mkD("Fox",         "NYR", 16, 60, 18),
  mkD("Werenski",    "CBJ", 18, 52, 30),
  mkD("Heiskanen",   "DAL", 14, 58, 24),
  mkD("Josi",        "NSH", 20, 55, 28),
  mkD("Sergachev",   "UTA", 12, 40, 36),
  mkD("McAvoy",      "BOS", 10, 45, 40),
  mkD("Dahlin",      "BUF", 18, 50, 30),
  mkD("Rielly",      "TOR", 10, 48, 22),
  mkD("Carlson",     "WSH", 14, 52, 24),
  mkD("Ekblad",      "FLA", 12, 36, 34),

  // Goalies
  mkG("Hellebuyck",  "WPG", 38, 8),
  mkG("Shesterkin",  "NYR", 32, 6),
  mkG("Bobrovsky",   "FLA", 35, 5),
  mkG("Sorokin",     "NYI", 30, 4),
  mkG("Oettinger",   "DAL", 34, 4),
  mkG("Saros",       "NSH", 28, 3),
  mkG("Hill",        "VGK", 27, 3),
  mkG("Skinner",     "EDM", 29, 2),
  mkG("Swayman",     "BOS", 26, 4),
  mkG("Kuemper",     "LAK", 24, 2),
];

function mkF(name: string, team: string, g: number, a: number, pim: number): NhlPlayer {
  return finalize({
    id: `p_${name}_${team}`,
    name,
    team,
    position: "F",
    goals: g, assists: a, pim,
    wins: 0, shutouts: 0,
    fantasyPoints: 0,
  });
}
function mkD(name: string, team: string, g: number, a: number, pim: number): NhlPlayer {
  return finalize({
    id: `p_${name}_${team}`,
    name, team, position: "D",
    goals: g, assists: a, pim,
    wins: 0, shutouts: 0,
    fantasyPoints: 0,
  });
}
function mkG(name: string, team: string, wins: number, so: number): NhlPlayer {
  return finalize({
    id: `p_${name}_${team}`,
    name, team, position: "G",
    goals: 0, assists: 0, pim: 0,
    wins, shutouts: so,
    fantasyPoints: 0,
  });
}
function finalize(p: NhlPlayer): NhlPlayer {
  return { ...p, fantasyPoints: scorePlayer(p, DEFAULT_SCORING) };
}

export function scorePlayer(p: NhlPlayer, rules: ScoringRules): number {
  return (
    p.goals * rules.goal +
    p.assists * rules.assist +
    p.pim * rules.pim +
    p.wins * rules.goalieWin +
    p.shutouts * rules.goalieShutout
  );
}

// -----------------------------------------------------------------------------
// Sample pools — one official, a couple private
// -----------------------------------------------------------------------------
export const samplePools: Pool[] = [
  {
    id: "pool_official_playoffs26",
    name: "Pro Pick 6 Playoff Pool 2026",
    kind: "official",
    sport: "NHL",
    ownerHandle: "propick6",
    entryModel: "tokens",
    entryTokens: 3,
    duration: "playoffs",
    startsOn: "Apr 21",
    endsOn: "Jun 22",
    maxEntries: 500,
    currentEntries: 147,
    roster: { forwards: 6, defense: 3, goalies: 1 },
    scoring: DEFAULT_SCORING,
    uniqueDraft: false,
    prizePool: "400 🟡 to 1st · 100 🟡 to 2nd · 50 🟡 to 3rd",
  },
  {
    id: "pool_official_weekly",
    name: "Weekly NHL Skate-Off",
    kind: "official",
    sport: "NHL",
    ownerHandle: "propick6",
    entryModel: "free",
    entryTokens: 0,
    duration: "week",
    startsOn: "Mon",
    endsOn: "Sun",
    maxEntries: 0,
    currentEntries: 312,
    roster: { forwards: 4, defense: 2, goalies: 1 },
    scoring: DEFAULT_SCORING,
    uniqueDraft: false,
    prizePool: "Bragging rights + weekly badge",
  },
  {
    id: "pool_private_rippers",
    name: "The Rippers Pool",
    kind: "private",
    sport: "NHL",
    ownerHandle: "SharpMike",
    entryModel: "tokens",
    entryTokens: 5,
    duration: "playoffs",
    startsOn: "Apr 21",
    endsOn: "Jun 22",
    maxEntries: 20,
    currentEntries: 12,
    roster: { forwards: 6, defense: 3, goalies: 1 },
    scoring: DEFAULT_SCORING,
    uniqueDraft: true,
    joinCode: "RIPPERS26",
    prizePool: "60 🟡 winner-take-all",
  },
];

export const sampleEntries: PoolEntry[] = [
  {
    id: "entry_1",
    poolId: "pool_official_playoffs26",
    ownerHandle: "SharpMike",
    teamName: "Mike's Magic Misfits",
    playerIds: ["p_McDavid_EDM","p_Matthews_TOR","p_Kucherov_TBL","p_Reinhart_FLA","p_Panarin_NYR","p_Point_TBL","p_Makar_COL","p_Hughes_Q_VAN","p_Josi_NSH","p_Hellebuyck_WPG"],
    totalPoints: 0,
  },
  {
    id: "entry_2",
    poolId: "pool_official_playoffs26",
    ownerHandle: "NFLNerd",
    teamName: "Pucks Over Pigskins",
    playerIds: ["p_Draisaitl_EDM","p_MacKinnon_COL","p_Tkachuk_FLA","p_Nylander_TOR","p_Eichel_VGK","p_Hintz_DAL","p_Fox_NYR","p_Heiskanen_DAL","p_McAvoy_BOS","p_Shesterkin_NYR"],
    totalPoints: 0,
  },
  {
    id: "entry_3",
    poolId: "pool_official_playoffs26",
    ownerHandle: "PuckProphet",
    teamName: "Prophet's Pucks",
    playerIds: ["p_McDavid_EDM","p_Pastrnak_BOS","p_Marner_TOR","p_Robertson_DAL","p_Kaprizov_MIN","p_Bedard_CHI","p_Makar_COL","p_Werenski_CBJ","p_Dahlin_BUF","p_Bobrovsky_FLA"],
    totalPoints: 0,
  },
];

// Compute total points for an entry given the pool's scoring rules.
export function scoreEntry(
  entry: PoolEntry,
  pool: Pool,
  players: NhlPlayer[] = nhlPlayers
): number {
  const playersById = new Map(players.map((p) => [p.id, p]));
  let total = 0;
  for (const pid of entry.playerIds) {
    const p = playersById.get(pid);
    if (p) total += scorePlayer(p, pool.scoring);
  }
  return total;
}

// Pretty-print helpers used in multiple pages.
export function durationLabel(d: PoolDuration): string {
  switch (d) {
    case "night":    return "Tonight";
    case "week":     return "This Week";
    case "month":    return "This Month";
    case "playoffs": return "Playoffs";
    case "season":   return "Full Season";
  }
}

export function rosterSizeTotal(r: RosterRules): number {
  return r.forwards + r.defense + r.goalies;
}
