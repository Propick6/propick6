"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  samplePools,
  nhlPlayers,
  scorePlayer,
  DEFAULT_SCORING,
  type NhlPlayer,
  type Position,
} from "@/lib/poolMockData";

export default function BuildTeamPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const pool =
    samplePools.find((p) => p.id === id) ?? {
      id,
      name: "Your New Pool",
      roster: { forwards: 6, defense: 3, goalies: 1 },
      scoring: DEFAULT_SCORING,
    };

  const [teamName, setTeamName] = useState("");
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | Position>("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);

  const slotCounts = {
    F: pool.roster.forwards,
    D: pool.roster.defense,
    G: pool.roster.goalies,
  };

  const pickedBy: Record<Position, NhlPlayer[]> = useMemo(() => {
    const acc: Record<Position, NhlPlayer[]> = { F: [], D: [], G: [] };
    for (const p of nhlPlayers) {
      if (picks.has(p.id)) acc[p.position].push(p);
    }
    return acc;
  }, [picks]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nhlPlayers
      .filter((p) => (filter === "all" ? true : p.position === filter))
      .filter(
        (p) =>
          q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q)
      )
      .map((p) => ({ ...p, fantasyPoints: scorePlayer(p, pool.scoring) }))
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  }, [filter, query, pool]);

  function togglePick(p: NhlPlayer) {
    const next = new Set(picks);
    if (next.has(p.id)) {
      next.delete(p.id);
    } else {
      // Only allow if slot for this position isn't full.
      if (pickedBy[p.position].length >= slotCounts[p.position]) return;
      next.add(p.id);
    }
    setPicks(next);
  }

  const totalNeeded =
    slotCounts.F + slotCounts.D + slotCounts.G;
  const totalPicked =
    pickedBy.F.length + pickedBy.D.length + pickedBy.G.length;
  const rosterFull = totalPicked === totalNeeded;

  function onSave() {
    // Foundation round — no backend yet. We just flip a UI state.
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/pools/${id}`} className="text-xs text-muted hover:text-text">
          ← Back to pool
        </Link>
        <h1 className="font-display text-3xl mt-2">BUILD YOUR TEAM</h1>
        <p className="text-sm text-muted mt-1">
          Name your team, then fill every roster slot.
        </p>
      </div>

      {/* Team name */}
      <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
        <div>
          <div className="text-xs text-muted mb-1">Team name</div>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Puck Dynasty"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
            maxLength={40}
          />
        </div>

        {/* Slot summary */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <SlotBox label="Forwards" have={pickedBy.F.length} need={slotCounts.F} />
          <SlotBox label="Defense" have={pickedBy.D.length} need={slotCounts.D} />
          <SlotBox label="Goalies" have={pickedBy.G.length} need={slotCounts.G} />
        </div>
      </div>

      {/* Your roster so far */}
      {totalPicked > 0 && (
        <div className="rounded-xl border border-green/30 bg-green/5 p-4">
          <div className="text-[11px] uppercase tracking-wider text-green">
            Your Roster ({totalPicked}/{totalNeeded})
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {[...pickedBy.F, ...pickedBy.D, ...pickedBy.G].map((p) => (
              <button
                key={p.id}
                onClick={() => togglePick(p)}
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

      {/* Scoring legend — explains the green fantasy point number */}
      <div className="rounded-xl border border-border bg-panel p-3 text-xs flex items-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted">
          How we score
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold text-green">+{pool.scoring.goal}</span>
          <span className="text-muted">goal</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold text-green">+{pool.scoring.assist}</span>
          <span className="text-muted">assist</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold text-green">+{pool.scoring.goalieWin}</span>
          <span className="text-muted">goalie win</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="font-semibold text-green">+{pool.scoring.goalieShutout}</span>
          <span className="text-muted">shutout</span>
        </span>
        <span className="flex-1" />
        <Link
          href={`/pools/${id}/rules`}
          className="text-muted hover:text-text underline"
        >
          Full rules →
        </Link>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "F", "D", "G"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full border text-xs transition ${
              filter === f
                ? "bg-green/10 text-green border-green/40"
                : "bg-panel border-border text-muted hover:text-text"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "F"
              ? "Forwards"
              : f === "D"
              ? "Defense"
              : "Goalies"}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or team…"
          className="flex-1 min-w-[160px] bg-panel border border-border rounded-md px-3 py-1.5 text-xs"
        />
      </div>

      {/* Player list */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="divide-y divide-border">
          {visible.map((p) => {
            const isPicked = picks.has(p.id);
            const posFull =
              !isPicked && pickedBy[p.position].length >= slotCounts[p.position];
            return (
              <button
                key={p.id}
                onClick={() => togglePick(p)}
                disabled={posFull}
                className={`w-full flex items-center gap-3 p-3 text-left transition ${
                  isPicked
                    ? "bg-green/10"
                    : posFull
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
                  className={`ml-2 w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
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
          {visible.length === 0 && (
            <div className="p-6 text-center text-muted text-sm">
              No players match that filter.
            </div>
          )}
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-3 z-10">
        <div className="rounded-xl border border-border bg-panel p-3 flex items-center gap-3 shadow-lg">
          <div className="text-xs text-muted flex-1">
            {rosterFull
              ? "Roster complete — save to lock it in."
              : `${totalPicked}/${totalNeeded} picks made · fill every slot to save.`}
          </div>
          <button
            disabled={!rosterFull || !teamName.trim() || saved}
            onClick={onSave}
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow disabled:opacity-40"
          >
            {saved ? "Saved ✓" : "Save team"}
          </button>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-green/40 bg-green/10 p-4 text-sm">
          <span className="font-semibold text-green">{teamName}</span> saved.
          Head back to{" "}
          <Link href={`/pools/${id}`} className="underline">
            the pool
          </Link>{" "}
          to watch the leaderboard.
        </div>
      )}
    </div>
  );
}

function SlotBox({
  label,
  have,
  need,
}: {
  label: string;
  have: number;
  need: number;
}) {
  const full = have >= need && need > 0;
  return (
    <div
      className={`rounded-lg border p-2 text-center ${
        full ? "border-green/40 bg-green/5" : "border-border bg-bg"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`font-display text-xl ${full ? "text-green" : ""}`}>
        {have}/{need}
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
