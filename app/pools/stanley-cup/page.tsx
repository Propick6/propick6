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

        {/* Visual bracket — true NHL-style left-to-right with the Cup at center */}
        <BracketView picks={picks} pickWinner={pickWinner} />

        {/* Mini games-per-series picker — centered under the bracket */}
        <GamesPickerPanel picks={picks} pickGames={pickGames} />

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

        {/* Player list — horizontally scrollable on narrow screens */}
        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          <div className="max-h-[60vh] overflow-auto">
            <div className="min-w-[560px]">
              {/* Column headers */}
              <div className="sticky top-0 z-10 bg-panel2 border-b border-border flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted">
                <div className="w-6 shrink-0" />
                <div className="flex-1 min-w-[140px]">Player</div>
                <StatHead w="w-10">GP</StatHead>
                <StatHead w="w-10">G</StatHead>
                <StatHead w="w-10">A</StatHead>
                <StatHead w="w-10">P</StatHead>
                <StatHead w="w-14">TOI</StatHead>
                <StatHead w="w-12">S</StatHead>
                <StatHead w="w-12">PIM</StatHead>
                <StatHead w="w-12">FPTS</StatHead>
                <div className="w-7 shrink-0" />
              </div>

              <div className="divide-y divide-border">
                {visiblePlayers.map((p) => {
                  const isPicked = picked.has(p.id);
                  const limited = !isPicked && rosterFull;
                  const points = p.goals + p.assists;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer(p)}
                      disabled={limited}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition ${
                        isPicked
                          ? "bg-green/10"
                          : limited
                          ? "opacity-40"
                          : "hover:bg-panel2"
                      }`}
                    >
                      <div className="w-6 shrink-0">
                        <PosPill pos={p.position} />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <div className="text-sm font-semibold truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-muted">
                          {p.team}
                          {p.position === "G" &&
                            ` · ${p.wins} W · ${p.shutouts} SO`}
                        </div>
                      </div>
                      <StatCell w="w-10">{p.gp}</StatCell>
                      <StatCell w="w-10">{p.goals}</StatCell>
                      <StatCell w="w-10">{p.assists}</StatCell>
                      <StatCell w="w-10">{points}</StatCell>
                      <StatCell w="w-14">{p.toi}</StatCell>
                      <StatCell w="w-12">{p.shots}</StatCell>
                      <StatCell w="w-12">{p.pim}</StatCell>
                      <div className="w-12 font-display text-lg text-green text-center shrink-0">
                        {p.fantasyPoints}
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm shrink-0 ${
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
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Column headers */}
            <div className="bg-panel2 border-b border-border flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted">
              <div className="w-4 shrink-0" />
              <div className="w-6 shrink-0" />
              <div className="flex-1 min-w-[140px]">Player</div>
              <StatHead w="w-10">GP</StatHead>
              <StatHead w="w-10">G</StatHead>
              <StatHead w="w-10">A</StatHead>
              <StatHead w="w-10">P</StatHead>
              <StatHead w="w-14">TOI</StatHead>
              <StatHead w="w-12">S</StatHead>
              <StatHead w="w-12">PIM</StatHead>
              <StatHead w="w-12">FPTS</StatHead>
            </div>
            <div className="divide-y divide-border">
              {players.map((p, i) => {
                const pts = p.goals + p.assists;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 ${
                      i % 2 === 0 ? "bg-bg" : "bg-panel"
                    }`}
                  >
                    <span className="text-[10px] text-muted w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <div className="w-6 shrink-0">
                      <RecapPosPill pos={pos} />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <div className="text-sm font-semibold truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-muted">
                        {p.team}
                        {p.position === "G" &&
                          ` · ${p.wins} W · ${p.shutouts} SO`}
                      </div>
                    </div>
                    <StatCell w="w-10">{p.gp}</StatCell>
                    <StatCell w="w-10">{p.goals}</StatCell>
                    <StatCell w="w-10">{p.assists}</StatCell>
                    <StatCell w="w-10">{pts}</StatCell>
                    <StatCell w="w-14">{p.toi}</StatCell>
                    <StatCell w="w-12">{p.shots}</StatCell>
                    <StatCell w="w-12">{p.pim}</StatCell>
                    <div className="w-12 font-display text-lg text-green text-center shrink-0">
                      {livePts}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helpers for the stat table layout (header + cell).
function StatHead({
  w,
  children,
}: {
  w: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${w} text-center shrink-0`}>{children}</div>
  );
}

function StatCell({
  w,
  children,
}: {
  w: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${w} text-center text-sm shrink-0 tabular-nums`}>
      {children}
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

const seriesById = (id: string): Series =>
  SERIES.find((s) => s.id === id) as Series;

/**
 * Visual NHL-style bracket. Seven columns, left to right:
 *
 *   East R1 (4) | East R2 (2) | East CF (1) | Cup (1) | West CF (1) | West R2 (2) | West R1 (4)
 *
 * Each column is a flex column with `justify-around`, which naturally vertically
 * centers each later round between its parent pair (no manual offsets needed).
 * Wrapped in a horizontal scroller so the bracket survives narrow screens.
 */
function BracketView({
  picks,
  pickWinner,
}: {
  picks: Picks;
  pickWinner: (sid: string, tid: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-3">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Column headers */}
          <div className="grid grid-cols-7 gap-2 text-[9px] uppercase tracking-wider text-muted text-center mb-2">
            <div>
              <span className="text-blue">East</span> · First Round
            </div>
            <div>
              <span className="text-blue">East</span> · Div Final
            </div>
            <div>
              <span className="text-blue">East</span> · Conf Final
            </div>
            <div className="text-gold">Stanley Cup</div>
            <div>
              <span className="text-gold">West</span> · Conf Final
            </div>
            <div>
              <span className="text-gold">West</span> · Div Final
            </div>
            <div>
              <span className="text-gold">West</span> · First Round
            </div>
          </div>

          {/* The bracket grid — 7 columns, equal-height, evenly spaced cards */}
          <div className="grid grid-cols-7 gap-2 min-h-[420px]">
            <BracketCol
              series={[
                seriesById("e_a1"),
                seriesById("e_a2"),
                seriesById("e_m1"),
                seriesById("e_m2"),
              ]}
              picks={picks}
              pickWinner={pickWinner}
            />
            <BracketCol
              series={[seriesById("e_atl"), seriesById("e_met")]}
              picks={picks}
              pickWinner={pickWinner}
            />
            <BracketCol
              series={[seriesById("e_cf")]}
              picks={picks}
              pickWinner={pickWinner}
            />
            <BracketCol
              series={[seriesById("scf")]}
              picks={picks}
              pickWinner={pickWinner}
              isFinal
            />
            <BracketCol
              series={[seriesById("w_cf")]}
              picks={picks}
              pickWinner={pickWinner}
            />
            <BracketCol
              series={[seriesById("w_pac"), seriesById("w_cen")]}
              picks={picks}
              pickWinner={pickWinner}
            />
            <BracketCol
              series={[
                seriesById("w_p1"),
                seriesById("w_p2"),
                seriesById("w_c1"),
                seriesById("w_c2"),
              ]}
              picks={picks}
              pickWinner={pickWinner}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketCol({
  series,
  picks,
  pickWinner,
  isFinal,
}: {
  series: Series[];
  picks: Picks;
  pickWinner: (sid: string, tid: string) => void;
  isFinal?: boolean;
}) {
  return (
    <div className="flex flex-col justify-around gap-1.5">
      {series.map((s) => (
        <MiniSeriesCard
          key={s.id}
          series={s}
          picks={picks}
          onPickWinner={(tid) => pickWinner(s.id, tid)}
          isFinal={isFinal}
        />
      ))}
    </div>
  );
}

/** Compact card — just the matchup. Games picker lives in the panel below. */
function MiniSeriesCard({
  series,
  picks,
  onPickWinner,
  isFinal,
}: {
  series: Series;
  picks: Picks;
  onPickWinner: (teamId: string) => void;
  isFinal?: boolean;
}) {
  const { topId, bottomId } = resolveSeriesTeams(series, picks);
  const pick = picks[series.id];
  const isReady = !!topId && !!bottomId;
  const winnerId = pick?.winnerId;
  const games = pick?.games;

  const borderClass = isFinal
    ? winnerId
      ? "border-gold/60 bg-gold/10"
      : "border-gold/40 bg-gold/5"
    : winnerId
    ? "border-green/40 bg-green/5"
    : isReady
    ? "border-border bg-bg"
    : "border-border bg-bg opacity-60";

  return (
    <div className={`rounded border ${borderClass} p-1`}>
      <MiniTeamRow
        teamId={topId}
        isWinner={!!winnerId && winnerId === topId}
        canPick={isReady}
        onClick={() => topId && onPickWinner(topId)}
      />
      <MiniTeamRow
        teamId={bottomId}
        isWinner={!!winnerId && winnerId === bottomId}
        canPick={isReady}
        onClick={() => bottomId && onPickWinner(bottomId)}
      />
      {/* Games badge — read-only here. Picker is below. */}
      {winnerId && (
        <div className="text-center text-[9px] text-muted mt-0.5">
          {games ? `in ${games}` : "set games ↓"}
        </div>
      )}
    </div>
  );
}

function MiniTeamRow({
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
      <div className="flex items-center gap-1 px-1 py-0.5 text-[10px] text-muted">
        <span className="w-5 h-5 rounded bg-panel2 border border-border flex items-center justify-center text-[8px] shrink-0">
          —
        </span>
        <span className="italic truncate">TBD</span>
      </div>
    );
  }
  const team = PLAYOFF_TEAMS[teamId];
  return (
    <button
      onClick={onClick}
      disabled={!canPick}
      className={`w-full flex items-center gap-1 px-1 py-0.5 rounded transition text-left ${
        isWinner
          ? "bg-green/20 ring-1 ring-green/40"
          : canPick
          ? "hover:bg-panel2"
          : "opacity-60"
      }`}
    >
      <span
        className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold shrink-0"
        style={{
          backgroundColor: `${team.primary}33`,
          color: team.primary,
          border: `1px solid ${team.primary}66`,
        }}
      >
        {team.id}
      </span>
      <span className="flex-1 min-w-0 text-[11px] font-semibold truncate leading-tight">
        {team.short}
      </span>
      <span className="text-[8px] uppercase tracking-wider text-muted shrink-0">
        {team.seed}
      </span>
      {isWinner && (
        <span className="text-green text-[10px] shrink-0">✓</span>
      )}
    </button>
  );
}

/**
 * Mini games-per-series module sitting under the bracket. Shows one compact
 * row for every series with a picked winner — pick 4/5/6/7 inline. Hidden
 * series (no winner picked yet) just don't show up.
 */
function GamesPickerPanel({
  picks,
  pickGames,
}: {
  picks: Picks;
  pickGames: (sid: string, g: 4 | 5 | 6 | 7) => void;
}) {
  const open = SERIES.filter((s) => picks[s.id]?.winnerId);
  const filled = open.filter((s) => picks[s.id]?.games).length;

  if (open.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-panel/40 p-3 text-center text-[11px] text-muted">
        Pick a winner above and the games selector for that series will appear here.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Games per series
        </div>
        <div className="text-[10px] text-muted">
          <span className={filled === open.length ? "text-green" : ""}>
            {filled}
          </span>
          /{open.length} set ·{" "}
          <span className="text-green">+{BRACKET_SCORING.exactGames}</span> exact
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {open.map((s) => {
          const winnerId = picks[s.id]!.winnerId!;
          const winner = PLAYOFF_TEAMS[winnerId];
          const { topId, bottomId } = resolveSeriesTeams(s, picks);
          const loserId = winnerId === topId ? bottomId : topId;
          const loser = loserId ? PLAYOFF_TEAMS[loserId] : null;
          const games = picks[s.id]?.games;
          return (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded border border-border bg-bg px-2 py-1.5"
            >
              <div className="flex-1 min-w-0 text-[11px] leading-tight">
                <div className="truncate">
                  <span className="font-semibold">{winner.short}</span>
                  <span className="text-muted"> over </span>
                  {loser ? (
                    <span className="text-muted line-through decoration-muted/40">
                      {loser.short}
                    </span>
                  ) : (
                    <span className="text-muted italic">tbd</span>
                  )}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-muted">
                  {s.label}
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {([4, 5, 6, 7] as const).map((n) => {
                  const active = games === n;
                  return (
                    <button
                      key={n}
                      onClick={() => pickGames(s.id, n)}
                      className={`w-7 h-7 rounded text-[11px] border transition tabular-nums ${
                        active
                          ? "bg-green/20 text-green border-green/50"
                          : "bg-panel border-border text-muted hover:text-text hover:bg-panel2"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
