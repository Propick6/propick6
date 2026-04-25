// =============================================================================
// 2026 NHL Stanley Cup Playoff bracket — structure + helpers
// -----------------------------------------------------------------------------
// Static seed data sourced from NHL.com / ESPN bracket as of 2026-04-24.
// Round 1 matchups are fixed; later rounds are derived from picks.
// =============================================================================

export type Conference = "East" | "West";
export type Division = "Atlantic" | "Metropolitan" | "Pacific" | "Central";
export type RoundNum = 1 | 2 | 3 | 4;

export type PlayoffTeam = {
  id: string;            // 3-letter abbr — also used as roster key
  name: string;          // "Buffalo Sabres"
  short: string;         // "Sabres"
  conference: Conference;
  division: Division | "Final";
  seed: string;          // "A1", "WC1", etc.
  primary: string;       // CSS color
};

export type SeriesRef = { fromSeriesId: string };
export type SeriesSlot = { teamId: string } | SeriesRef;

export type Series = {
  id: string;
  round: RoundNum;
  conference: Conference | "Final";
  // Either a fixed team (round 1) or a reference to the winner of an earlier series.
  top: SeriesSlot;
  bottom: SeriesSlot;
  label: string;         // pretty round name e.g. "First Round"
};

export type Pick = {
  winnerId: string | null;
  games: 4 | 5 | 6 | 7 | null;
};

// -----------------------------------------------------------------------------
// Teams — 16 in the playoffs
// -----------------------------------------------------------------------------

export const PLAYOFF_TEAMS: Record<string, PlayoffTeam> = {
  // ---- East / Atlantic ----
  BUF: { id: "BUF", name: "Buffalo Sabres",       short: "Sabres",     conference: "East", division: "Atlantic",     seed: "A1",  primary: "#003087" },
  TBL: { id: "TBL", name: "Tampa Bay Lightning",  short: "Lightning",  conference: "East", division: "Atlantic",     seed: "A2",  primary: "#00205B" },
  MTL: { id: "MTL", name: "Montreal Canadiens",   short: "Canadiens",  conference: "East", division: "Atlantic",     seed: "A3",  primary: "#AF1E2D" },
  BOS: { id: "BOS", name: "Boston Bruins",        short: "Bruins",     conference: "East", division: "Atlantic",     seed: "WC1", primary: "#FFB81C" },
  // ---- East / Metro ----
  CAR: { id: "CAR", name: "Carolina Hurricanes",  short: "Hurricanes", conference: "East", division: "Metropolitan", seed: "M1",  primary: "#CC0000" },
  PIT: { id: "PIT", name: "Pittsburgh Penguins",  short: "Penguins",   conference: "East", division: "Metropolitan", seed: "M2",  primary: "#FCB514" },
  PHI: { id: "PHI", name: "Philadelphia Flyers",  short: "Flyers",     conference: "East", division: "Metropolitan", seed: "M3",  primary: "#F74902" },
  OTT: { id: "OTT", name: "Ottawa Senators",      short: "Senators",   conference: "East", division: "Metropolitan", seed: "WC2", primary: "#C8102E" },
  // ---- West / Pacific ----
  VGK: { id: "VGK", name: "Vegas Golden Knights", short: "Knights",    conference: "West", division: "Pacific",      seed: "P1",  primary: "#B4975A" },
  EDM: { id: "EDM", name: "Edmonton Oilers",      short: "Oilers",     conference: "West", division: "Pacific",      seed: "P2",  primary: "#FF4C00" },
  ANA: { id: "ANA", name: "Anaheim Ducks",        short: "Ducks",      conference: "West", division: "Pacific",      seed: "P3",  primary: "#F47A38" },
  UTA: { id: "UTA", name: "Utah Mammoth",         short: "Mammoth",    conference: "West", division: "Pacific",      seed: "WC1", primary: "#71AFE5" },
  // ---- West / Central ----
  COL: { id: "COL", name: "Colorado Avalanche",   short: "Avalanche",  conference: "West", division: "Central",      seed: "C1",  primary: "#6F263D" },
  DAL: { id: "DAL", name: "Dallas Stars",         short: "Stars",      conference: "West", division: "Central",      seed: "C2",  primary: "#006847" },
  MIN: { id: "MIN", name: "Minnesota Wild",       short: "Wild",       conference: "West", division: "Central",      seed: "C3",  primary: "#154734" },
  LAK: { id: "LAK", name: "Los Angeles Kings",    short: "Kings",      conference: "West", division: "Central",      seed: "WC2", primary: "#A2AAAD" },
};

export const PLAYOFF_TEAM_IDS = Object.keys(PLAYOFF_TEAMS);

// -----------------------------------------------------------------------------
// Series — 8 first-round, 4 division finals, 2 conference finals, 1 final
// -----------------------------------------------------------------------------

export const SERIES: Series[] = [
  // ---- East / Atlantic side ----
  { id: "e_a1", round: 1, conference: "East", label: "First Round", top: { teamId: "BUF" }, bottom: { teamId: "BOS" } },
  { id: "e_a2", round: 1, conference: "East", label: "First Round", top: { teamId: "TBL" }, bottom: { teamId: "MTL" } },
  // ---- East / Metro side ----
  { id: "e_m1", round: 1, conference: "East", label: "First Round", top: { teamId: "CAR" }, bottom: { teamId: "OTT" } },
  { id: "e_m2", round: 1, conference: "East", label: "First Round", top: { teamId: "PIT" }, bottom: { teamId: "PHI" } },
  // ---- West / Pacific side ----
  { id: "w_p1", round: 1, conference: "West", label: "First Round", top: { teamId: "VGK" }, bottom: { teamId: "UTA" } },
  { id: "w_p2", round: 1, conference: "West", label: "First Round", top: { teamId: "EDM" }, bottom: { teamId: "ANA" } },
  // ---- West / Central side ----
  { id: "w_c1", round: 1, conference: "West", label: "First Round", top: { teamId: "COL" }, bottom: { teamId: "LAK" } },
  { id: "w_c2", round: 1, conference: "West", label: "First Round", top: { teamId: "DAL" }, bottom: { teamId: "MIN" } },

  // ---- Round 2: Division Finals ----
  { id: "e_atl", round: 2, conference: "East", label: "Division Final", top: { fromSeriesId: "e_a1" }, bottom: { fromSeriesId: "e_a2" } },
  { id: "e_met", round: 2, conference: "East", label: "Division Final", top: { fromSeriesId: "e_m1" }, bottom: { fromSeriesId: "e_m2" } },
  { id: "w_pac", round: 2, conference: "West", label: "Division Final", top: { fromSeriesId: "w_p1" }, bottom: { fromSeriesId: "w_p2" } },
  { id: "w_cen", round: 2, conference: "West", label: "Division Final", top: { fromSeriesId: "w_c1" }, bottom: { fromSeriesId: "w_c2" } },

  // ---- Round 3: Conference Finals ----
  { id: "e_cf", round: 3, conference: "East", label: "Conference Final", top: { fromSeriesId: "e_atl" }, bottom: { fromSeriesId: "e_met" } },
  { id: "w_cf", round: 3, conference: "West", label: "Conference Final", top: { fromSeriesId: "w_pac" }, bottom: { fromSeriesId: "w_cen" } },

  // ---- Round 4: Stanley Cup Final ----
  { id: "scf",  round: 4, conference: "Final", label: "Stanley Cup Final", top: { fromSeriesId: "e_cf" }, bottom: { fromSeriesId: "w_cf" } },
];

// -----------------------------------------------------------------------------
// Helpers — resolve which teams are in a series given current picks
// -----------------------------------------------------------------------------

export type Picks = Record<string, Pick>;

export function emptyPicks(): Picks {
  const p: Picks = {};
  for (const s of SERIES) p[s.id] = { winnerId: null, games: null };
  return p;
}

/** Resolve which team currently fills a slot. Returns null if upstream isn't decided. */
export function resolveSlot(slot: SeriesSlot, picks: Picks): string | null {
  if ("teamId" in slot) return slot.teamId;
  return picks[slot.fromSeriesId]?.winnerId ?? null;
}

/** Get the two team IDs that should appear in a series — null if not yet known. */
export function resolveSeriesTeams(s: Series, picks: Picks): { topId: string | null; bottomId: string | null } {
  return {
    topId: resolveSlot(s.top, picks),
    bottomId: resolveSlot(s.bottom, picks),
  };
}

/** When a round 1 winner changes, downstream picks become stale. Clear them. */
export function clearDownstream(picks: Picks, seriesId: string): Picks {
  const next: Picks = { ...picks };
  // Find every series whose slot references seriesId, recursively clear those.
  const queue = [seriesId];
  while (queue.length) {
    const current = queue.shift()!;
    for (const s of SERIES) {
      const refs =
        ("fromSeriesId" in s.top && s.top.fromSeriesId === current) ||
        ("fromSeriesId" in s.bottom && s.bottom.fromSeriesId === current);
      if (!refs) continue;
      // If the previously-picked winner is no longer in this matchup, clear it.
      const { topId, bottomId } = resolveSeriesTeams(s, next);
      const w = next[s.id]?.winnerId ?? null;
      if (w && w !== topId && w !== bottomId) {
        next[s.id] = { winnerId: null, games: null };
        queue.push(s.id);
      }
    }
  }
  return next;
}

/** Set a winner. Auto-clears any downstream picks that are now invalid. */
export function setWinner(picks: Picks, seriesId: string, winnerId: string): Picks {
  const next: Picks = { ...picks, [seriesId]: { ...picks[seriesId], winnerId } };
  return clearDownstream(next, seriesId);
}

export function setGames(picks: Picks, seriesId: string, games: Pick["games"]): Picks {
  return { ...picks, [seriesId]: { ...picks[seriesId], games } };
}

// -----------------------------------------------------------------------------
// Bracket-pick scoring (bonus on top of player roster fantasy points)
// -----------------------------------------------------------------------------

export const BRACKET_SCORING = {
  round1Winner: 5,
  round2Winner: 10,
  round3Winner: 15,
  round4Winner: 25,
  exactGames: 3,         // bonus per series for nailing # of games
};

export function pointsForRound(round: RoundNum): number {
  switch (round) {
    case 1: return BRACKET_SCORING.round1Winner;
    case 2: return BRACKET_SCORING.round2Winner;
    case 3: return BRACKET_SCORING.round3Winner;
    case 4: return BRACKET_SCORING.round4Winner;
  }
}

/** Best-case bracket bonus assuming every prediction is correct. */
export function maxBracketBonus(): number {
  let total = 0;
  for (const s of SERIES) {
    total += pointsForRound(s.round) + BRACKET_SCORING.exactGames;
  }
  return total;
}
