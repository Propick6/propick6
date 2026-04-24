"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  samplePools,
  sampleEntries,
  nhlPlayers,
  scoreEntry,
  durationLabel,
  rosterSizeTotal,
  type Pool,
} from "@/lib/poolMockData";

export default function PoolDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // If this is a brand-new pool (created from the form with a temp id), we
  // render a friendly placeholder. Once Supabase is wired, the pool row will
  // exist and we'll fetch it here instead.
  const pool: Pool =
    samplePools.find((p) => p.id === id) ?? {
      id,
      name: "Your New Pool",
      kind: "private",
      sport: "NHL",
      ownerHandle: "you",
      entryModel: "free",
      entryTokens: 0,
      duration: "playoffs",
      startsOn: "—",
      endsOn: "—",
      maxEntries: 0,
      currentEntries: 0,
      roster: { forwards: 6, defense: 3, goalies: 1 },
      scoring: { goal: 2, assist: 1, pim: 0, goalieWin: 2, goalieShutout: 3 },
      uniqueDraft: false,
      prizePool: "TBD",
      joinCode: id.slice(-6).toUpperCase(),
    };

  const [joined, setJoined] = useState(false);

  const entries = useMemo(() => {
    const list = sampleEntries.filter((e) => e.poolId === pool.id);
    return list
      .map((e) => ({ ...e, totalPoints: scoreEntry(e, pool, nhlPlayers) }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [pool]);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/pools" className="text-xs text-muted hover:text-text">
          ← Back to Pools
        </Link>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <h1 className="font-display text-3xl">{pool.name}</h1>
          {pool.kind === "official" ? (
            <span className="text-[10px] bg-green/15 text-green px-1.5 py-0.5 rounded tracking-wider">
              OFFICIAL
            </span>
          ) : (
            <span className="text-[10px] bg-panel2 border border-border text-muted px-1.5 py-0.5 rounded tracking-wider">
              PRIVATE
            </span>
          )}
        </div>
        <div className="text-xs text-muted mt-1">
          <Link href={`/u/${pool.ownerHandle}`} className="hover:text-text">
            @{pool.ownerHandle}
          </Link>{" "}
          · {durationLabel(pool.duration)} · {pool.startsOn}
          {" → "}
          {pool.endsOn}
        </div>

        {/* Quick-access rules + settings links */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <Link
            href={`/pools/${pool.id}/rules`}
            className="border border-border text-muted hover:text-text px-3 py-1.5 rounded-full"
          >
            📋 Rules & Scoring
          </Link>
          <Link
            href={`/pools/${pool.id}/settings`}
            className="border border-border text-muted hover:text-text px-3 py-1.5 rounded-full"
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Entry"
          value={pool.entryModel === "free" ? "Free" : `🟡 ${pool.entryTokens}`}
          accent={pool.entryModel === "free"}
        />
        <Stat
          label="Roster"
          value={`${rosterSizeTotal(pool.roster)} (${pool.roster.forwards}F/${pool.roster.defense}D/${pool.roster.goalies}G)`}
        />
        <Stat
          label="Entries"
          value={
            pool.maxEntries > 0
              ? `${pool.currentEntries} / ${pool.maxEntries}`
              : `${pool.currentEntries}`
          }
        />
        <Stat label="Draft" value={pool.uniqueDraft ? "Unique" : "Open"} />
      </div>

      {/* Prize */}
      {pool.prizePool && (
        <div className="rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4">
          <div className="text-[11px] uppercase tracking-wider text-gold">
            Prize Pool
          </div>
          <div className="font-display text-xl mt-0.5">{pool.prizePool}</div>
        </div>
      )}

      {/* Join code (private) */}
      {pool.kind === "private" && pool.joinCode && (
        <div className="rounded-xl border border-border bg-panel p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">
              Join Code
            </div>
            <div className="font-display text-2xl tracking-widest">
              {pool.joinCode}
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(pool.joinCode!)}
            className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-panel2"
          >
            Copy
          </button>
        </div>
      )}

      {/* Join / draft CTAs */}
      <div className="flex items-center gap-2 flex-wrap">
        {!joined ? (
          <button
            onClick={() => setJoined(true)}
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow"
          >
            {pool.entryModel === "free"
              ? "Join pool"
              : `Join · 🟡 ${pool.entryTokens}`}
          </button>
        ) : (
          <Link
            href={`/pools/${pool.id}/team`}
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow"
          >
            Draft my team →
          </Link>
        )}
        <button className="px-4 py-2 rounded-full border border-border text-sm text-muted hover:text-text">
          Share
        </button>
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Standings
            </div>
            <div className="font-display text-xl">Leaderboard</div>
          </div>
          <div className="text-[11px] text-muted">
            Scoring: G {pool.scoring.goal} · A {pool.scoring.assist} · W{" "}
            {pool.scoring.goalieWin} · SO {pool.scoring.goalieShutout}
          </div>
        </div>
        <div className="divide-y divide-border">
          {entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              No teams yet. Be the first — draft your roster.
            </div>
          ) : (
            entries.map((e, i) => (
              <div
                key={e.id}
                className="p-3 flex items-center gap-3 hover:bg-panel2 transition"
              >
                <div className="font-display text-2xl w-8 text-center text-muted">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{e.teamName}</div>
                  <Link
                    href={`/u/${e.ownerHandle}`}
                    className="text-xs text-muted hover:text-text"
                  >
                    @{e.ownerHandle}
                  </Link>
                </div>
                <div className="font-display text-2xl text-green">
                  {e.totalPoints}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full rules live on /pools/[id]/rules — tile links there. */}
      <Link
        href={`/pools/${pool.id}/rules`}
        className="block rounded-xl border border-border bg-panel p-4 hover:bg-panel2 transition"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">
              Want the full breakdown?
            </div>
            <div className="font-display text-xl mt-0.5">
              See rules &amp; scoring →
            </div>
          </div>
          <div className="text-2xl">📋</div>
        </div>
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div
        className={`font-display text-2xl mt-0.5 ${accent ? "text-green" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
