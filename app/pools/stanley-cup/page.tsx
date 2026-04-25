"use client";

// =============================================================================
// /pools/stanley-cup — Stanley Cup Playoff Pool prototype
// -----------------------------------------------------------------------------
// Two halves:
//   1) Bracket prediction (clickable, auto-advance, games-per-series 4/5/6/7)
//   2) 20-player playoff roster (search + team filter + +/✓ to add/remove)
//
// Pure local state for now — no Supabase persistence yet. The shape mirrors
// what we'll save once a Stanley Cup pool table exists.
// =============================================================================

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PLAYOFF_TEAMS,
  SERIES,
  emptyPicks,
  resolveSeriesTeams,
  setWinner,
  setGames,
  pointsForRound,
  BRACKET_SCORING,
  maxBracketBonus,
  type Picks,
  type Series,
  type RoundNum,
} from "@/lib/playoffBracket";
import {
  playoffPlayers,
  PLAYOFF_TEAM_COUNT,
  PLAYOFF_PLAYER_COUNT,
} from "@/lib/playoffRosters";
import type { NhlPlayer, Position } from "@/lib/poolMockData";

const ROSTER_LIMIT = 20;

export default function StanleyCupPoolPage() {
  // ---- Bracket state ----
  const [picks, setPicks] = useState<Picks>(emptyPicks);

  function pickWinner(seriesId: string, teamId: string) {
    setPicks((prev) => {
      const current = prev[seriesId]?.winnerId;
      // Clicking the already-picked team clears it.
      if (current === teamId) {
        return { ...prev, [seriesId]: { winnerId: null, games: null } };
      }
      return setWinner(prev, seriesId, teamId);
    });
  }

  function pickGames(seriesId: string, games: 4 | 5 | 6 | 7) {
    setPicks((prev) => {
      const current = prev[seriesId]?.games;
      // Clicking the already-picked games count clears it.
      return setGames(prev, seriesId, current === games ? null : games);
    });
  }

  // Bracket completion stats
  const winnersPicked = SERIES.reduce(
    (acc, s) => acc + (picks[s.id]?.winnerId ? 1 : 0),
    0
  );
  const gamesPicked = SERIES.reduce(
    (acc, s) => acc + (picks[s.id]?.games ? 1 : 0),
    0
  );
  const cupWinnerId = picks["scf"]?.winnerId ?? null;
  const champion = cupWinnerId ? PLAYOFF_TEAMS[cupWinnerId] : null;

  // ---- Roster state ----
  const [teamName, setTeamName] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState<"all" | Position>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [saved, setSaved] = useState(false);

  function togglePlayer(p: NhlPlayer) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) {
        next.delete(p.id);
      } else {
        if (next.size >= ROSTER_LIMIT) return prev;
        next.add(p.id);
      }
      return next;
    });
  }

  const visiblePlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return playoffPlayers
      .filter((p) => (posFilter === "all" ? true : p.position === posFilter))
      .filter((p) => (teamFilter === "all" ? true : p.team === teamFilter))
      .filter(
        (p) =>
          q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q)
      )
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  }, [query, posFilter, teamFilter]);

  const pickedPlayers = useMemo(
    () => playoffPlayers.filter((p) => picked.has(p.id)),
    [picked]
  );
  const rosterPoints = pickedPlayers.reduce(
    (acc, p) => acc + p.fantasyPoints,
    0
  );

  const rosterFull = picked.size >= ROSTER_LIMIT;
  const allWinnersPicked = winnersPicked === SERIES.length;
  const allGamesPicked = gamesPicked === SERIES.length;
  const bracketComplete = allWinnersPicked && allGamesPicked;
  const canSave =
    rosterFull && bracketComplete && teamName.trim().length > 0;

  function onSave() {
    setSaved(true);
    // Scroll to top so the recap is visible immediately.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ---- Saved → show the recap instead of the editor ----
  if (saved) {
    return (
      <Recap
        teamName={teamName}
        picks={picks}
        pickedPlayers={pickedPlayers}
        champion={champion}
        onEdit={() => setSaved(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/pools" className="text-xs text-muted hover:text-text">
          ← Back to Pools
        </Link>
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted mt-2">
          Official Pool · Playoffs 2026
        </div>
        <h1 className="font-display text-3xl mt-1">STANLEY CUP NHL PLAYOFF POOL</h1>
        <p className="text-sm text-muted mt-1">
          Pick a winner <span className="text-text">and</span> the number of
          games (4–7) for all {SERIES.length} series, then draft any 20 playoff
          players — forwards, defense, goalies, mix however you want. Score =
          bracket bonus + your players' fantasy points.
        </p>
      </div>

      {/* ── Score legend ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-panel p-3 text-xs flex items-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted">
          Bracket Bonus
        </span>
        <Legend label="R1 winner" pts={`+${BRACKET_SCORING.round1Winner}`} />
        <Legend label="R2 winner" pts={`+${BRACKET_SCORING.round2Winner}`} />
        <Legend label="Conf Final" pts={`+${BRACKET_SCORING.round3Winner}`} />
        <Legend label="Cup winner" pts={`+${BRACKET_SCORING.round4Winner}`} />
        <Legend
          label="Exact games"
          pts={`+${BRACKET_SCORING.exactGames}`}
        />
        <span className="flex-1" />
        <span className="text-muted">
          Max bracket: <span className="text-green">{maxBracketBonus()}</span>
        </span>
      </div>

      {/* ── BRACKET ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">
              Section 1
            </div>
            <h2 className="font-display text-xl">PLAYOFF BRACKET</h2>
          </div>
          <div className="text-[11px] text-muted">
            <span className="text-green">{winnersPicked}</span>/{SERIES.length} winners ·{" "}
            <span className="text-green">{gamesPicked}</span>/{SERIES.length} games
          </div>
        </div>

        {/* Conference + Final blocks */}
        <BracketColumn
          conference="East"
          picks={picks}
          pickWinner={pickWinner}
          pickGames={pickGames}
        />
        <BracketColumn
          conference="West"
          picks={picks}
          pickWinner={pickWinner}
          pickGames={pickGames}
        />
        <FinalColumn
          picks={picks}
          pickWinner={pickWinner}
          pickGames={pickGames}
        />

        {champion && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
              Predicted Champion
            </div>
            <div className="font-display text-2xl text-gold mt-1">
              {champion.name.toUpperCase()}
            </div>
          </div>
        )}
      </section>

      {/* ── ROSTER ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">
              Section 2
            </div>
            <h2 className="font-display text-xl">YOUR 20-PLAYER ROSTER</h2>
          </div>
          <div className="text-[11px] text-muted">
            <span className={picked.size === ROSTER_LIMIT ? "text-green" : ""}>
              {picked.size}
            </span>
            /{ROSTER_LIMIT} picks · pool{" "}
            <span className="text-text">
              {PLAYOFF_PLAYER_COUNT}
            </span>{" "}
            players · {PLAYOFF_TEAM_COUNT} teams
          </div>
        </div>

        {/* Team name */}
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-xs text-muted mb-1">Team name</div>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Mike's Magic Misfits"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
            maxLength={40}
          />
        </div>

        {/* Selected roster chips */}
        {pickedPlayers.length > 0 && (
          <div className="rounded-xl border border-green/30 bg-green/5 p-4">
            <div className="text-[11px] uppercase tracking-wider text-green flex items-center gap-2">
              <span>Your Roster ({pickedPlayers.length}/{ROSTER_LIMIT})</span>
              <span className="text-muted">·</span>
              <span className="text-muted">
                {rosterPoints} fantasy pts to date
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {pickedPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p)}
                  className="inline-flex items-center gap-1.5 bg-bg border border-border rounded-full px-2.5 py-1 text-xs hover:border-green/40"
                >
                  <PosPill pos={p.position} />
                  <span>{p.name}</span>
                  <span className="text-muted">{p.team}</span>
                  <span className="text-muted">×</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="rounded-xl border border-border bg-panel p-3 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any player or team…"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "F", "D", "G"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPosFilter(f)}
                className={`px-3 py-1.5 rounded-full border text-xs transition ${
                  posFilter === f
                    ? "bg-green/10 text-green border-green/40"
                    : "bg-bg border-border text-muted hover:text-text"
                }`}
              >
                {f === "all"
                  ? "All positions"
                  : f === "F"
                  ? "Forwards"
                  : f === "D"
                  ? "Defense"
                  : "Goalies"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setTeamFilter("all")}
              className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition ${
                teamFilter === "all"
                  ? "bg-green/10 text-green border-green/40"
                  : "bg-bg border-border text-muted hover:text-text"
              }`}
            >
              All teams
            </button>
            {Object.values(PLAYOFF_TEAMS).map((t) => (
              <button
                key={t.id}
                onClick={() => setTeamFilter(t.id)}
                className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition ${
                  teamFilter === t.id
                    ? "bg-green/10 text-green border-green/40"
                    : "bg-bg border-border text-muted hover:text-text"
                }`}
              >
                {t.id} · {t.short}
              </button>
            ))}
          </div>
        </div>

        {/* Player list */}
        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
            {visiblePlayers.map((p) => {
              const isPicked = picked.has(p.id);
              const limited = !isPicked && rosterFull;
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p)}
                  disabled={limited}
                  className={`w-full flex items-center gap-3 p-3 text-left transition ${
                    isPicked
                      ? "bg-green/10"
                      : limited
                      ? "opacity-40"
                      : "hover:bg-panel2"
                  }`}
                >
                  <PosPill pos={p.position} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {p.name}{" "}
                      <span className="text-muted text-xs">· {p.team}</span>
                    </div>
                    <div className="text-[11px] text-muted">
                      {p.position === "G"
                        ? `${p.wins} W · ${p.shutouts} SO`
                        : `${p.goals} G · ${p.assists} A · ${p.pim} PIM`}
                    </div>
                  </div>
                  <div className="font-display text-xl text-green">
                    {p.fantasyPoints}
                  </div>
                  <div
                    className={`ml-2 w-7 h-7 rounded-full border flex items-center justify-center text-sm ${
                      isPicked
                        ? "bg-green text-bg border-green"
                        : "border-border text-muted"
                    }`}
                  >
                    {isPicked ? "✓" : "+"}
                  </div>
                </button>
              );
            })}
            {visiblePlayers.length === 0 && (
              <div className="p-6 text-center text-muted text-sm">
                No players match that filter.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SAVE BAR ─────────────────────────────────────────── */}
      <div className="sticky bottom-3 z-10">
        <div className="rounded-xl border border-border bg-panel p-3 flex items-center gap-3 shadow-lg">
          <div className="text-xs text-muted flex-1 leading-tight">
            {!teamName.trim()
              ? "Name your team to enable Save."
              : !allWinnersPicked
              ? `Pick winners for all ${SERIES.length} series (${winnersPicked}/${SERIES.length}).`
              : !allGamesPicked
              ? `Pick # of games for every series (${gamesPicked}/${SERIES.length}).`
              : !rosterFull
              ? `${picked.size}/${ROSTER_LIMIT} players — fill the roster.`
              : "All set — lock it in."}
          </div>
          <button
            disabled={!canSave || saved}
            onClick={onSave}
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow disabled:opacity-40"
          >
            {saved ? "Saved ✓" : "Save entry"}
          </button>
        </div>
      </div>

    </div>
  );
}

// =============================================================================
// Recap — readable summary shown after Save
// =============================================================================

type PlayoffTeamLite = {
  id: string;
  name: string;
  short: string;
  conference: "East" | "West";
  division: string;
  seed: string;
  primary: string;
};

function Recap({
  teamName,
  picks,
  pickedPlayers,
  champion,
  onEdit,
}: {
  teamName: string;
  picks: Picks;
  pickedPlayers: NhlPlayer[];
  champion: PlayoffTeamLite | null;
  onEdit: () => void;
}) {
  // Once the entry locks in, the player tally resets to 0 — those are the
  // *active* (playoff) points for this entry, not the regular-season totals.
  // Season stats are kept on the row (G/A/PIM) for context only.
  // Order is the season-points order at draft time (proxy for "best players first").
  const forwards = pickedPlayers
    .filter((p) => p.position === "F")
    .sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  const defense = pickedPlayers
    .filter((p) => p.position === "D")
    .sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  const goalies = pickedPlayers
    .filter((p) => p.position === "G")
    .sort((a, b) => b.fantasyPoints - a.fantasyPoints);

  // Active tally — playoff points start at 0 for every locked entry.
  const liveRosterPoints = 0;

  // Group series by round for the bracket recap.
  const byRound: Record<RoundNum, Series[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const s of SERIES) byRound[s.round].push(s);

  const gamesPicked = SERIES.reduce(
    (acc, s) => acc + (picks[s.id]?.games ? 1 : 0),
    0
  );

  return (
    <div className="space-y-5">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-green/40 bg-gradient-to-br from-green/15 via-green/5 to-transparent p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.25em] text-green">
            ✓ Entry Locked In
          </div>
          <button
            onClick={onEdit}
            className="text-xs border border-border bg-panel hover:bg-panel2 text-muted hover:text-text px-3 py-1.5 rounded-full"
          >
            ← Edit picks
          </button>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">
            Team
          </div>
          <h1 className="font-display text-3xl sm:text-4xl leading-none mt-1 break-words">
            {teamName || "Unnamed Team"}
          </h1>
        </div>

        {/* Champion callout */}
        {champion && (
          <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
              style={{
                backgroundColor: `${champion.primary}30`,
                border: `2px solid ${champion.primary}`,
              }}
            >
              🏆
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
                Predicted Champion
              </div>
              <div className="font-display text-2xl sm:text-3xl leading-tight mt-0.5">
                {champion.name}
              </div>
              <div className="text-[11px] text-muted">
                {champion.conference} · {champion.division} · seed {champion.seed}
              </div>
            </div>
          </div>
        )}

        {/* Quick stats grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatBox
            label="Roster pts"
            value={liveRosterPoints.toLocaleString()}
            sub="updates as the playoffs play out"
          />
          <StatBox
            label="Max bracket"
            value={maxBracketBonus().toLocaleString()}
            sub={`${gamesPicked}/${SERIES.length} exact-games picked`}
          />
          <StatBox
            label="Champion"
            value={champion ? champion.short : "—"}
            sub={champion ? `+${BRACKET_SCORING.round4Winner} if correct` : ""}
          />
        </div>
      </div>

      {/* ── BRACKET RECAP ─────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-panel p-4 sm:p-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Your Bracket
            </div>
            <h2 className="font-display text-xl">PLAYOFF PREDICTIONS</h2>
          </div>
          <div className="text-[11px] text-muted">
            {SERIES.length} series
          </div>
        </div>

        {/* East Conference */}
        <BracketRecapGroup
          title="East Conference"
          tone="blue"
          rounds={[
            { label: "First Round", series: byRound[1].filter((s) => s.conference === "East") },
            { label: "Division Finals", series: byRound[2].filter((s) => s.conference === "East") },
            { label: "Conference Final", series: byRound[3].filter((s) => s.conference === "East") },
          ]}
          picks={picks}
        />

        {/* West Conference */}
        <BracketRecapGroup
          title="West Conference"
          tone="gold"
          rounds={[
            { label: "First Round", series: byRound[1].filter((s) => s.conference === "West") },
            { label: "Division Finals", series: byRound[2].filter((s) => s.conference === "West") },
            { label: "Conference Final", series: byRound[3].filter((s) => s.conference === "West") },
          ]}
          picks={picks}
        />

        {/* Stanley Cup Final */}
        <BracketRecapGroup
          title="Stanley Cup Final"
          tone="gold"
          rounds={[{ label: "", series: byRound[4] }]}
          picks={picks}
        />
      </section>

      {/* ── ROSTER RECAP ──────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-panel p-4 sm:p-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Your Roster
            </div>
            <h2 className="font-display text-xl">
              20-PLAYER LINEUP
            </h2>
          </div>
          <div className="text-[11px] text-muted">
            <span className="text-green">{liveRosterPoints}</span> playoff pts so far
          </div>
        </div>

        <RosterGroup title="Forwards" pos="F" players={forwards} />
        <RosterGroup title="Defense" pos="D" players={defense} />
        <RosterGroup title="Goalies" pos="G" players={goalies} />
      </section>

      {/* ── Footer actions ───────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onEdit}
          className="bg-panel border border-border text-text px-4 py-2 rounded-full text-sm hover:bg-panel2"
        >
          Edit picks
        </button>
        <Link
          href="/pools"
          className="text-muted hover:text-text text-sm px-3 py-2"
        >
          ← Back to Pools
        </Link>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="font-display text-2xl mt-0.5 text-green leading-none">
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-muted mt-1 leading-tight">{sub}</div>
      )}
    </div>
  );
}

function BracketRecapGroup({
  title,
  tone,
  rounds,
  picks,
}: {
  title: string;
  tone: "blue" | "gold";
  rounds: { label: string; series: Series[] }[];
  picks: Picks;
}) {
  const accent = tone === "blue" ? "text-blue" : "text-gold";
  return (
    <div className="space-y-3">
      <div className={`text-[10px] uppercase tracking-[0.25em] ${accent}`}>
        {title}
      </div>
      {rounds.map((r, i) => (
        <div key={i} className="space-y-1.5">
          {r.label && (
            <div className="text-[10px] uppercase tracking-wider text-muted">
              {r.label}{" "}
              <span className="text-muted">
                · +{pointsForRound(r.series[0]?.round ?? 1)} ea
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            {r.series.map((s) => (
              <SeriesRecapRow key={s.id} series={s} picks={picks} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SeriesRecapRow({
  series,
  picks,
}: {
  series: Series;
  picks: Picks;
}) {
  const { topId, bottomId } = resolveSeriesTeams(series, picks);
  const pick = picks[series.id];
  const winnerId = pick?.winnerId;
  const games = pick?.games;

  // Winner + loser IDs
  const loserId =
    winnerId && topId && bottomId
      ? winnerId === topId
        ? bottomId
        : topId
      : null;

  const winner = winnerId ? PLAYOFF_TEAMS[winnerId] : null;
  const loser = loserId ? PLAYOFF_TEAMS[loserId] : null;

  if (!winner || !loser) {
    return (
      <div className="rounded-lg border border-border bg-bg p-3 text-xs text-muted italic">
        Incomplete pick
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-bg p-3 flex items-center gap-3">
      {/* Winner badge */}
      <span
        className="w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{
          backgroundColor: `${winner.primary}33`,
          color: winner.primary,
          border: `1px solid ${winner.primary}88`,
        }}
      >
        {winner.id}
      </span>

      <div className="flex-1 min-w-0 text-sm leading-tight">
        <div className="truncate">
          <span className="font-semibold text-text">{winner.name}</span>
          <span className="text-muted"> over </span>
          <span className="text-muted line-through decoration-muted/40">
            {loser.name}
          </span>
        </div>
        <div className="text-[11px] text-muted mt-0.5">
          {games ? `in ${games} games` : "games not picked"}
        </div>
      </div>

      {games && (
        <span className="text-[11px] text-muted whitespace-nowrap">
          +{BRACKET_SCORING.exactGames} exact
        </span>
      )}
    </div>
  );
}

function RosterGroup({
  title,
  pos,
  players,
}: {
  title: string;
  pos: Position;
  players: NhlPlayer[];
}) {
  if (players.length === 0) {
    return (
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
          {title} (0)
        </div>
        <div className="text-xs text-muted italic py-1">
          No {title.toLowerCase()} drafted.
        </div>
      </div>
    );
  }
  // Active playoff points always start at 0 for every player on a locked entry.
  // Season G/A/PIM/W/SO are still shown as supporting context.
  const livePts = 0;
  const groupTotal = 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted">
          {title} ({players.length})
        </div>
        <div className="text-[11px] text-muted">
          <span className="text-green">{groupTotal}</span> pts
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-3 py-2 ${
                i % 2 === 0 ? "bg-bg" : "bg-panel"
              }`}
            >
              <span className="text-[10px] text-muted w-4 text-right">
                {i + 1}
              </span>
              <RecapPosPill pos={pos} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-[10px] text-muted">
                  {p.team} ·{" "}
                  {p.position === "G"
                    ? `${p.wins} W · ${p.shutouts} SO`
                    : `${p.goals} G · ${p.assists} A · ${p.pim} PIM`}
                </div>
              </div>
              <div className="font-display text-lg text-green">
                {livePts}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecapPosPill({ pos }: { pos: Position }) {
  const styles: Record<Position, string> = {
    F: "bg-green/15 text-green",
    D: "bg-blue/15 text-blue",
    G: "bg-gold/15 text-gold",
  };
  return (
    <span
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${styles[pos]}`}
    >
      {pos}
    </span>
  );
}

// =============================================================================
// Bracket subcomponents
// =============================================================================

function BracketColumn({
  conference,
  picks,
  pickWinner,
  pickGames,
}: {
  conference: "East" | "West";
  picks: Picks;
  pickWinner: (sid: string, tid: string) => void;
  pickGames: (sid: string, g: 4 | 5 | 6 | 7) => void;
}) {
  const round1 = SERIES.filter((s) => s.round === 1 && s.conference === conference);
  const round2 = SERIES.filter((s) => s.round === 2 && s.conference === conference);
  const round3 = SERIES.filter((s) => s.round === 3 && s.conference === conference);

  return (
    <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] uppercase tracking-[0.2em] ${
            conference === "East" ? "text-blue" : "text-gold"
          }`}
        >
          {conference} Conference
        </span>
      </div>

      <RoundBlock
        title="First Round"
        round={1}
        list={round1}
        picks={picks}
        pickWinner={pickWinner}
        pickGames={pickGames}
      />
      <RoundBlock
        title="Division Finals"
        round={2}
        list={round2}
        picks={picks}
        pickWinner={pickWinner}
        pickGames={pickGames}
      />
      <RoundBlock
        title="Conference Final"
        round={3}
        list={round3}
        picks={picks}
        pickWinner={pickWinner}
        pickGames={pickGames}
      />
    </div>
  );
}

function FinalColumn({
  picks,
  pickWinner,
  pickGames,
}: {
  picks: Picks;
  pickWinner: (sid: string, tid: string) => void;
  pickGames: (sid: string, g: 4 | 5 | 6 | 7) => void;
}) {
  const final = SERIES.filter((s) => s.round === 4);
  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">
        Stanley Cup Final
      </div>
      <RoundBlock
        title=""
        round={4}
        list={final}
        picks={picks}
        pickWinner={pickWinner}
        pickGames={pickGames}
      />
    </div>
  );
}

function RoundBlock({
  title,
  round,
  list,
  picks,
  pickWinner,
  pickGames,
}: {
  title: string;
  round: RoundNum;
  list: Series[];
  picks: Picks;
  pickWinner: (sid: string, tid: string) => void;
  pickGames: (sid: string, g: 4 | 5 | 6 | 7) => void;
}) {
  return (
    <div>
      {title && (
        <div className="text-[10px] uppercase tracking-wider text-muted mb-2">
          {title} <span className="text-muted">· +{pointsForRound(round)} ea</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map((s) => (
          <SeriesCard
            key={s.id}
            series={s}
            picks={picks}
            onPickWinner={(tid) => pickWinner(s.id, tid)}
            onPickGames={(g) => pickGames(s.id, g)}
          />
        ))}
      </div>
    </div>
  );
}

function SeriesCard({
  series,
  picks,
  onPickWinner,
  onPickGames,
}: {
  series: Series;
  picks: Picks;
  onPickWinner: (teamId: string) => void;
  onPickGames: (g: 4 | 5 | 6 | 7) => void;
}) {
  const { topId, bottomId } = resolveSeriesTeams(series, picks);
  const pick = picks[series.id];
  const isReady = topId && bottomId;
  const winnerId = pick?.winnerId;

  return (
    <div
      className={`rounded-lg border p-2.5 transition ${
        winnerId
          ? "border-green/40 bg-green/5"
          : isReady
          ? "border-border bg-bg"
          : "border-border bg-bg opacity-60"
      }`}
    >
      <TeamRow
        teamId={topId}
        isWinner={!!winnerId && winnerId === topId}
        canPick={!!isReady}
        onClick={() => topId && onPickWinner(topId)}
      />
      <TeamRow
        teamId={bottomId}
        isWinner={!!winnerId && winnerId === bottomId}
        canPick={!!isReady}
        onClick={() => bottomId && onPickWinner(bottomId)}
      />

      {/* Games selector — appears once a winner is chosen */}
      {winnerId && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
          <span className="text-[9px] uppercase tracking-wider text-muted mr-1">
            Games
          </span>
          {([4, 5, 6, 7] as const).map((n) => {
            const active = pick?.games === n;
            return (
              <button
                key={n}
                onClick={() => onPickGames(n)}
                className={`flex-1 text-[11px] py-0.5 rounded border transition ${
                  active
                    ? "bg-green/15 text-green border-green/40"
                    : "bg-panel border-border text-muted hover:text-text"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeamRow({
  teamId,
  isWinner,
  canPick,
  onClick,
}: {
  teamId: string | null;
  isWinner: boolean;
  canPick: boolean;
  onClick: () => void;
}) {
  if (!teamId) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-1 text-xs text-muted">
        <span className="w-7 h-7 rounded bg-panel2 border border-border flex items-center justify-center text-[10px]">
          —
        </span>
        <span className="italic">Awaiting winner…</span>
      </div>
    );
  }
  const team = PLAYOFF_TEAMS[teamId];
  return (
    <button
      onClick={onClick}
      disabled={!canPick}
      className={`w-full flex items-center gap-2 py-1.5 px-1 rounded transition text-left ${
        isWinner
          ? "bg-green/15"
          : canPick
          ? "hover:bg-panel2"
          : "opacity-60"
      }`}
    >
      <span
        className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold"
        style={{
          backgroundColor: `${team.primary}30`,
          color: team.primary,
          border: `1px solid ${team.primary}66`,
        }}
      >
        {team.id}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate">{team.short}</div>
        <div className="text-[9px] uppercase tracking-wider text-muted">
          {team.seed}
        </div>
      </div>
      <span
        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
          isWinner
            ? "bg-green text-bg border-green"
            : "border-border text-muted"
        }`}
      >
        {isWinner ? "✓" : ""}
      </span>
    </button>
  );
}

function PosPill({ pos }: { pos: Position }) {
  const styles: Record<Position, string> = {
    F: "bg-green/15 text-green",
    D: "bg-blue/15 text-blue",
    G: "bg-gold/15 text-gold",
  };
  return (
    <span
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${styles[pos]}`}
    >
      {pos}
    </span>
  );
}

function Legend({ label, pts }: { label: string; pts: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold text-green">{pts}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}
