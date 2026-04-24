"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { tickerEvents } from "@/lib/mockData";

// Core rule: a capper must post at least 6 picks today to appear in the feed.
const MIN_PICKS_TO_APPEAR = 6;
const MAX_PICKS_PER_DAY = 10;

type FeedPick = {
  id: string;
  sport: string;
  pick_type: string;
  matchup: string;
  selection: string;
  result: "pending" | "win" | "loss" | "push";
};

type FeedCapper = {
  id: string;
  handle: string;
  sport: string | null;
  wins: number;
  losses: number;
  roi: number;
  picks_today: FeedPick[];
  picks_posted_today: number;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function cappersStatus(c: FeedCapper): "hot" | "cold" | "neutral" {
  const total = c.wins + c.losses;
  const winRate = total > 0 ? (c.wins / total) * 100 : 0;
  if (c.roi >= 10 || winRate >= 65) return "hot";
  if (c.roi <= -10 || (total > 0 && winRate <= 40)) return "cold";
  return "neutral";
}

export default function FeedPage() {
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<FeedCapper[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = todayIso();

      // 1. Pull today's picks + join the capper's profile.
      //    The inner join drops orphan picks (no seller), just in case.
      const { data: picksRaw, error } = await supabase
        .from("picks")
        .select(
          `
          id, seller_id, sport, pick_type, matchup, selection, result,
          seller:profiles!seller_id(id, handle, sport, wins, losses, roi)
        `
        )
        .eq("pick_date", today);

      if (error || !picksRaw) {
        setLoading(false);
        return;
      }

      // 2. Group picks by seller.
      const bySeller = new Map<string, FeedCapper>();
      for (const p of picksRaw as unknown as (FeedPick & {
        seller_id: string;
        seller: {
          id: string;
          handle: string;
          sport: string | null;
          wins: number;
          losses: number;
          roi: number;
        } | null;
      })[]) {
        if (!p.seller) continue;
        const cur = bySeller.get(p.seller_id);
        if (cur) {
          cur.picks_today.push({
            id: p.id,
            sport: p.sport,
            pick_type: p.pick_type,
            matchup: p.matchup,
            selection: p.selection,
            result: p.result,
          });
          cur.picks_posted_today += 1;
        } else {
          bySeller.set(p.seller_id, {
            id: p.seller.id,
            handle: p.seller.handle,
            sport: p.seller.sport,
            wins: p.seller.wins,
            losses: p.seller.losses,
            roi: p.seller.roi,
            picks_today: [
              {
                id: p.id,
                sport: p.sport,
                pick_type: p.pick_type,
                matchup: p.matchup,
                selection: p.selection,
                result: p.result,
              },
            ],
            picks_posted_today: 1,
          });
        }
      }

      const all = Array.from(bySeller.values());
      const visible = all
        .filter((c) => c.picks_posted_today >= MIN_PICKS_TO_APPEAR)
        .sort((a, b) => b.roi - a.roi);
      const hidden = all.length - visible.length;

      setFeed(visible);
      setHiddenCount(hidden);
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const cappersOut = feed.length;
    const topWin =
      feed.length > 0
        ? Math.max(
            ...feed.map((c) => {
              const total = c.wins + c.losses;
              return total > 0 ? (c.wins / total) * 100 : 0;
            })
          )
        : 0;
    return { cappersOut, topWin };
  }, [feed]);

  return (
    <div className="space-y-4">
      {/* Live ticker */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-panel py-2">
        <div className="ticker whitespace-nowrap flex gap-10 text-sm text-muted">
          {[...tickerEvents, ...tickerEvents].map((e, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Cappers today" value={stats.cappersOut.toString()} />
        <StatCard
          label="Top win rate"
          value={stats.cappersOut > 0 ? `${stats.topWin.toFixed(0)}%` : "—"}
          accent
        />
        <StatCard label="Per unlock" value="$5.00" />
      </div>

      {/* Sponsor banner */}
      <div className="rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gold font-semibold tracking-wider">
            FEATURED SPONSOR
          </div>
          <div className="font-display text-xl mt-1">
            Use code <span className="text-green">PROPICK6</span> for 20% off
          </div>
        </div>
        <div className="text-3xl">🏀</div>
      </div>

      <h2 className="font-display text-2xl pt-2">TODAY&apos;S LINEUP</h2>

      {/* Capper feed */}
      {loading ? (
        <div className="text-center text-muted text-sm py-10">
          Loading today&apos;s board…
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center text-muted text-sm py-10 border border-dashed border-border rounded-xl">
          No cappers have posted {MIN_PICKS_TO_APPEAR}+ picks today yet. Check
          back later.
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((c) => {
            const isOpen = expanded === c.id;
            const isUnlocked = !!unlocked[c.id];
            const status = cappersStatus(c);
            const total = c.wins + c.losses;
            const winRate = total > 0 ? (c.wins / total) * 100 : 0;
            const progressPct = Math.min(
              100,
              (c.picks_posted_today / MIN_PICKS_TO_APPEAR) * 100
            );

            return (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-panel overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-panel2 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-lg">
                    {c.handle[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">
                        @{c.handle}
                      </span>
                      {status === "hot" && (
                        <span className="text-xs bg-hot/15 text-hot px-1.5 py-0.5 rounded">
                          🔥 HOT
                        </span>
                      )}
                      {status === "cold" && (
                        <span className="text-xs bg-cold/15 text-cold px-1.5 py-0.5 rounded">
                          ❄️ COLD
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {c.sport ?? "Multi"} · {c.wins}-{c.losses} ·{" "}
                      {winRate.toFixed(1)}% · ROI {c.roi > 0 ? "+" : ""}
                      {Number(c.roi).toFixed(1)}%
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-panel2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {c.picks_posted_today}/{MIN_PICKS_TO_APPEAR}+ picks
                      posted today
                    </div>
                  </div>
                  <span className="text-muted text-lg">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-panel2 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <Link
                        href={`/u/${c.handle}`}
                        className="text-xs text-muted hover:text-text underline"
                      >
                        View full profile →
                      </Link>
                      {!isUnlocked && (
                        <button
                          onClick={() =>
                            setUnlocked({ ...unlocked, [c.id]: true })
                          }
                          className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-glow"
                        >
                          <span>🟡</span> 1 token · Unlock all{" "}
                          {c.picks_posted_today}
                        </button>
                      )}
                    </div>

                    <ol
                      className={`space-y-2 ${
                        isUnlocked ? "" : "blur-picks"
                      }`}
                    >
                      {c.picks_today.map((p, i) => (
                        <li
                          key={p.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-bg border border-border"
                        >
                          <div className="text-xs font-display text-green w-6">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted">
                              {p.sport} · {p.pick_type}
                            </div>
                            <div className="font-semibold">{p.matchup}</div>
                            <div className="text-sm text-green">
                              {p.selection}
                            </div>
                          </div>
                        </li>
                      ))}
                      {/* Placeholder slots for un-posted picks up to min */}
                      {Array.from({
                        length: Math.max(
                          0,
                          MIN_PICKS_TO_APPEAR - c.picks_today.length
                        ),
                      }).map((_, i) => (
                        <li
                          key={`slot-${i}`}
                          className="p-3 rounded-lg border border-dashed border-border text-xs text-muted"
                        >
                          Capper hasn&apos;t posted this pick yet…
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden cappers note */}
      {!loading && hiddenCount > 0 && (
        <div className="text-xs text-muted text-center pt-2">
          {hiddenCount} capper{hiddenCount === 1 ? "" : "s"} hidden today —
          fewer than {MIN_PICKS_TO_APPEAR} picks posted.
        </div>
      )}
    </div>
  );
}

function StatCard({
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
