// Fetches upcoming games from ESPN's free public scoreboard API.
//
// Used by the +Pick page so cappers can click an actual upcoming game
// instead of typing the matchup by hand. ESPN's API is undocumented but
// stable and CORS-friendly; no API key required.
//
// Supported leagues: NBA / NFL / NHL / MLB (the 4 majors). Other sports
// in the +Pick form (NCAAF, NCAAB, UFC, Soccer) just continue using the
// manual matchup text input.

export type EspnGame = {
  id: string;
  matchup: string; // e.g. "LAL @ BOS" — pre-formatted by ESPN
  startsAt: string; // ISO datetime
  homeTeam: string; // full display name
  awayTeam: string;
  state: "pre" | "in" | "post"; // pre = scheduled, in = live, post = final
};

const ESPN_LEAGUES: Record<string, { sport: string; league: string }> = {
  NBA: { sport: "basketball", league: "nba" },
  NFL: { sport: "football", league: "nfl" },
  NHL: { sport: "hockey", league: "nhl" },
  MLB: { sport: "baseball", league: "mlb" },
};

export function isEspnSupported(leagueKey: string): boolean {
  return leagueKey in ESPN_LEAGUES;
}

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Fetches upcoming games for the given league across today + the next
 * `daysAhead` days. Returns a flat array sorted by start time.
 *
 * Defaults to 4 days ahead → 5 days total (today + 4). Returns [] for
 * unsupported leagues, network failures, or empty schedules. Never throws.
 */
export async function fetchEspnGames(
  leagueKey: string,
  daysAhead: number = 4
): Promise<EspnGame[]> {
  const config = ESPN_LEAGUES[leagueKey];
  if (!config) return [];

  const today = new Date();
  const dayPromises = Array.from({ length: daysAhead + 1 }).map(async (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = ymd(d);
    try {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${config.sport}/${config.league}/scoreboard?dates=${dateStr}`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return (json.events ?? []) as unknown[];
    } catch {
      return [];
    }
  });

  const allDays = await Promise.all(dayPromises);
  const events = allDays.flat() as Array<{
    id: string;
    date: string;
    shortName?: string;
    competitions?: Array<{
      competitors?: Array<{
        homeAway: "home" | "away";
        team: { abbreviation?: string; displayName?: string };
      }>;
    }>;
    status?: { type?: { state?: string } };
  }>;

  const games: EspnGame[] = [];
  const seen = new Set<string>(); // ESPN sometimes returns the same event on adjacent dates near boundaries

  for (const ev of events) {
    if (!ev.id || seen.has(ev.id)) continue;
    seen.add(ev.id);

    const comp = ev.competitions?.[0];
    const home = comp?.competitors?.find((c) => c.homeAway === "home");
    const away = comp?.competitors?.find((c) => c.homeAway === "away");
    if (!home || !away) continue;

    const homeAbbr = home.team.abbreviation ?? "HOME";
    const awayAbbr = away.team.abbreviation ?? "AWAY";

    games.push({
      id: ev.id,
      matchup: ev.shortName ?? `${awayAbbr} @ ${homeAbbr}`,
      startsAt: ev.date,
      homeTeam: home.team.displayName ?? homeAbbr,
      awayTeam: away.team.displayName ?? awayAbbr,
      state:
        (ev.status?.type?.state as "pre" | "in" | "post" | undefined) ?? "pre",
    });
  }

  // Sort by start time ascending so the soonest game is at the top.
  games.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return games;
}
