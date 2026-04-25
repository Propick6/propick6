"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { durationLabel, rosterSizeTotal } from "@/lib/poolMockData";

// Shape of a pool row as returned by the Supabase query below.
type PoolRow = {
  id: string;
  name: string;
  kind: "official" | "private";
  owner_id: string;
  entry_model: "free" | "tokens";
  entry_tokens: number;
  duration: "night" | "week" | "month" | "playoffs" | "season";
  max_entries: number;
  roster_forwards: number;
  roster_defense: number;
  roster_goalies: number;
  prize_pool: string | null;
  owner: { handle: string | null } | null;
  entries: { count: number }[]; // comes back as an array with one count row
};

type Filter = "all" | "official" | "private";

export default function PoolsIndexPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [joinCode, setJoinCode] = useState("");
  const [pools, setPools] = useState<PoolRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("pools")
        .select(
          `
          id, name, kind, owner_id, entry_model, entry_tokens, duration,
          max_entries, roster_forwards, roster_defense, roster_goalies,
          prize_pool,
          owner:profiles!owner_id(handle),
          entries:pool_entries(count)
        `
        )
        .order("created_at", { ascending: false });

      if (!error && data) setPools(data as unknown as PoolRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const visible = pools.filter((p) =>
    filter === "all" ? true : p.kind === filter
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
            NHL
          </div>
          <h1 className="font-display text-3xl mt-0.5">POOLS</h1>
          <p className="text-sm text-muted mt-1">
            Build a team, pick your players, climb the board.
          </p>
        </div>
        <Link
          href="/pools/create"
          className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow"
        >
          + Create Pool
        </Link>
      </div>

      {/* Featured Stanley Cup pool card */}
      <Link
        href="/pools/stanley-cup"
        className="block rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4 hover:from-gold/15 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-lg">
                STANLEY CUP NHL PLAYOFF POOL
              </span>
              <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded tracking-wider">
                FEATURED · 2026
              </span>
            </div>
            <div className="text-xs text-muted mt-0.5">
              Pick the bracket + draft 20 playoff players.
            </div>
          </div>
          <span className="text-gold text-lg">→</span>
        </div>
      </Link>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 text-sm">
        {(["all", "official", "private"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full border transition capitalize ${
              filter === f
                ? "bg-green/10 text-green border-green/40"
                : "bg-panel border-border text-muted hover:text-text"
            }`}
          >
            {f === "all" ? "All pools" : f}
          </button>
        ))}
      </div>

      {/* Join by code */}
      <div className="rounded-xl border border-border bg-panel p-4 flex items-center gap-3">
        <div className="text-sm text-muted flex-1">
          Have a join code from a friend?
        </div>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="JOIN CODE"
          className="bg-bg border border-border rounded-md px-3 py-1.5 text-sm w-36 tracking-widest"
        />
        <button
          disabled={!joinCode}
          className="bg-panel2 border border-border disabled:opacity-40 px-3 py-1.5 rounded-md text-sm"
        >
          Join
        </button>
      </div>

      {/* Pools list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-muted text-sm py-10">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center text-muted text-sm py-10 border border-dashed border-border rounded-xl">
            No pools here yet. Be the first to create one.
          </div>
        ) : (
          visible.map((p) => <PoolCard key={p.id} pool={p} />)
        )}
      </div>
    </div>
  );
}

function PoolCard({ pool }: { pool: PoolRow }) {
  const currentEntries = pool.entries?.[0]?.count ?? 0;
  const pct =
    pool.max_entries > 0
      ? Math.min(100, (currentEntries / pool.max_entries) * 100)
      : 100;

  return (
    <div className="rounded-xl border border-border bg-panel hover:bg-panel2 transition overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-panel2 border border-border flex items-center justify-center text-lg">
          🏒
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/pools/${pool.id}`}
              className="font-display text-lg leading-none hover:text-green"
            >
              {pool.name}
            </Link>
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
            {pool.owner?.handle ? (
              <Link
                href={`/u/${pool.owner.handle}`}
                className="hover:text-text"
              >
                @{pool.owner.handle}
              </Link>
            ) : (
              "@unknown"
            )}{" "}
            · {durationLabel(pool.duration)} · roster{" "}
            {rosterSizeTotal({
              forwards: pool.roster_forwards,
              defense: pool.roster_defense,
              goalies: pool.roster_goalies,
            })}{" "}
            ({pool.roster_forwards}F/{pool.roster_defense}D/
            {pool.roster_goalies}G)
          </div>

          {/* Entry + prize row */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {pool.entry_model === "tokens" ? (
              <span className="inline-flex items-center gap-1 text-gold">
                🟡 {pool.entry_tokens} entry
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-green">
                Free entry
              </span>
            )}
            {pool.prize_pool && (
              <>
                <span className="text-muted">·</span>
                <span className="text-muted truncate">{pool.prize_pool}</span>
              </>
            )}
          </div>

          {/* Capacity bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-panel2 rounded-full overflow-hidden">
              <div className="h-full bg-green" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[11px] text-muted whitespace-nowrap">
              {currentEntries}
              {pool.max_entries > 0 ? ` / ${pool.max_entries}` : ""} entries
            </div>
          </div>

          {/* Action row */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Link
              href={`/pools/${pool.id}`}
              className="bg-green text-bg font-semibold px-3 py-1.5 rounded-full text-xs"
            >
              View pool
            </Link>
            <Link
              href={`/pools/${pool.id}/rules`}
              className="border border-border text-muted hover:text-text px-3 py-1.5 rounded-full text-xs"
            >
              Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
