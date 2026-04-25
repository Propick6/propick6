"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  samplePools,
  nhlPlayers,
  scorePlayer,
  DEFAULT_SCORING,
  type NhlPlayer,
  type Position,
} from "@/lib/poolMockData";
import { playoffPlayers } from "@/lib/playoffRosters";

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

  // Pull the live pool row from Supabase so we know if this pool has the
  // optional NHL Playoff Bracket module enabled and whether it's a playoff
  // pool (which restricts the player pool to the 16 playoff teams).
  // Fail-soft: if the fetch errors we just fall back to defaults.
  const [hasBracket, setHasBracket] = useState<boolean>(false);
  const [dbDuration, setDbDuration] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase
      .from("pools")
      .select("has_bracket, duration")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.has_bracket) setHasBracket(true);
        if (data.duration) setDbDuration(data.duration);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Restrict the player list to the 16 playoff teams when this is a playoff
  // pool OR when the bracket module is enabled. Otherwise, regular-season
  // pools draw from the full league pool.
  const samplePool = samplePools.find((p) => p.id === id);
  const isPlayoffContext =
    hasBracket ||
    dbDuration === "playoffs" ||
    samplePool?.duration === "playoffs";
  const playerSource: NhlPlayer[] = isPlayoffContext
    ? playoffPlayers
    : nhlPlayers;

  const slotCounts = {
    F: pool.roster.forwards,
    D: pool.roster.defense,
    G: pool.roster.goalies,
  };

  const pickedBy: Record<Position, NhlPlayer[]> = useMemo(() => {
    const acc: Record<Position, NhlPlayer[]> = { F: [], D: [], G: [] };
    for (const p of playerSource) {
      if (picks.has(p.id)) acc[p.position].push(p);
    }
    return acc;
  }, [picks, playerSource]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return playerSource
      .filter((p) => (filter === "all" ? true : p.position === filter))
      .filter(
        (p) =>
          q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q)
      )
      .map((p) => ({ ...p, fantasyPoints: scorePlayer(p, pool.scoring) }))
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  }, [filter, query, pool, playerSource]);

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

  // Reusable bracket CTA — shown above the team builder AND below the save bar.
  const bracketCard = hasBracket ? (
    <Link
      href="/pools/stanley-cup"
      className="block rounded border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent px-2 py-1.5 hover:from-gold/15 transition"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-xs">
          🏆
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[9px] uppercase tracking-wider text-gold">
            Bracket Module
          </div>
          <div className="text-[11px]">
            This pool also has a playoff bracket — predict it for bonus points
          </div>
        </div>
        <span className="text-gold text-xs">→</span>
      </div>
    </Link>
  ) : null;

  return (
    <div className="space-y-2 text-[12px]">
      <div>
        <Link href={`/pools/${id}`} className="text-[10px] text-muted hover:text-text">
          ← Back to pool
        </Link>
        <h1 className="font-display text-lg mt-0.5 leading-none">BUILD YOUR TEAM</h1>
        <p className="text-[10px] text-muted mt-0.5">
          Name your team, then fill every roster slot.
        </p>
      </div>

      {bracketCard}

      {/* Team name + slot summary side-by-side on desktop, stacked on mobile */}
      <div className="rounded border border-border bg-panel p-2 grid sm:grid-cols-[1fr_auto] gap-1.5 items-end">
        <div>
          <div className="text-[9px] text-muted mb-0.5 uppercase tracking-wider">Team name</div>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Puck Dynasty"
            className="w-full bg-bg border border-border rounded px-2 py-0.5 text-[11px]"
            maxLength={40}
          />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <SlotBox label="F" have={pickedBy.F.length} need={slotCounts.F} />
          <SlotBox label="D" have={pickedBy.D.length} need={slotCounts.D} />
          <SlotBox label="G" have={pickedBy.G.length} need={slotCounts.G} />
        </div>
      </div>

      {/* Your roster so far — shown only when you've started picking */}
      {totalPicked > 0 && (
        <div className="rounded border border-green/30 bg-green/5 p-1.5">
          <div className="text-[9px] uppercase tracking-wider text-green">
            Your Roster ({totalPicked}/{totalNeeded})
          </div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {[...pickedBy.F, ...pickedBy.D, ...pickedBy.G].map((p) => (
              <button
                key={p.id}
                onClick={() => togglePick(p)}
                className="inline-flex items-center gap-0.5 bg-bg border border-border rounded-full px-1.5 py-0 text-[10px] hover:border-green/40"
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
      <div className="rounded border border-border bg-panel px-2 py-1 text-[10px] flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] uppercase tracking-wider text-muted">
          Scoring
        </span>
        <span className="inline-flex items-center gap-0.5">
          <span className="font-semibold text-green">+{pool.scoring.goal}</span>
          <span className="text-muted">goal</span>
        </span>
        <span className="inline-flex items-center gap-0.5">
          <span className="font-semibold text-green">+{pool.scoring.assist}</span>
          <span className="text-muted">ast</span>
        </span>
        <span className="inline-flex items-center gap-0.5">
          <span className="font-semibold text-green">+{pool.scoring.goalieWin}</span>
          <span className="text-muted">G-win</span>
        </span>
        <span className="inline-flex items-center gap-0.5">
          <span className="font-semibold text-green">+{pool.scoring.goalieShutout}</span>
          <span className="text-muted">SO</span>
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
      <div className="flex items-center gap-1 flex-wrap">
        {(["all", "F", "D", "G"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded-full border text-[10px] transition ${
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
          placeholder={
            isPlayoffContext
              ? "Search playoff teams only…"
              : "Search name or team…"
          }
          className="flex-1 min-w-[120px] bg-panel border border-border rounded px-2 py-0.5 text-[10px]"
        />
      </div>
      {isPlayoffContext && (
        <p className="text-[9px] text-muted -mt-1.5 ml-1">
          Playoff pool — only players on the 16 playoff teams are eligible
        </p>
      )}

      {/* Player list — denser rows */}
      <div className="rounded border border-border bg-panel overflow-hidden">
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
                className={`w-full flex items-center gap-1.5 px-2 py-1 text-left transition ${
                  isPicked
                    ? "bg-green/10"
                    : posFull
                    ? "opacity-40"
                    : "hover:bg-panel2"
                }`}
              >
                <PosPill pos={p.position} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold truncate leading-tight">
                    {p.name}{" "}
                    <span className="text-muted text-[9px]">· {p.team}</span>
                  </div>
                  <div className="text-[9px] text-muted leading-tight">
                    {p.position === "G"
                      ? `${p.wins} W · ${p.shutouts} SO`
                      : `${p.goals} G · ${p.assists} A · ${p.pim} PIM`}
                  </div>
                </div>
                <div className="font-display text-sm text-green leading-none">
                  {p.fantasyPoints}
                </div>
                <div
                  className={`ml-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
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
            <div className="p-3 text-center text-muted text-[10px]">
              No players match that filter.
            </div>
          )}
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-2 z-10">
        <div className="rounded border border-border bg-panel px-2 py-1 flex items-center gap-1.5 shadow-lg">
          <div className="text-[10px] text-muted flex-1 leading-tight">
            {rosterFull
              ? "Roster complete — save to lock it in."
              : `${totalPicked}/${totalNeeded} picks · fill every slot to save.`}
          </div>
          <button
            disabled={!rosterFull || !teamName.trim() || saved}
            onClick={onSave}
            className="bg-green text-bg font-semibold px-2.5 py-0.5 rounded-full text-[10px] shadow-glow disabled:opacity-40"
          >
            {saved ? "Saved ✓" : "Save team"}
          </button>
        </div>
      </div>

      {/* Duplicate bracket CTA below the save bar so it's visible after picks */}
      {bracketCard}

      {saved && (
        <div className="rounded border border-green/40 bg-green/10 p-1.5 text-[10px]">
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
      className={`rounded border px-1.5 py-0.5 flex items-center gap-0.5 ${
        full ? "border-green/40 bg-green/5" : "border-border bg-bg"
      }`}
    >
      <span className="text-[9px] uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className={`font-display text-[11px] leading-none ${full ? "text-green" : ""}`}>
        {have}/{need}
      </span>
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
      className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold ${styles[pos]}`}
    >
      {pos}
    </span>
  );
}
