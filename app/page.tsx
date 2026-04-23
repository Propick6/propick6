"use client";

import { useState } from "react";
import { cappers, tickerEvents } from "@/lib/mockData";

export default function FeedPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});

  const visibleCappers = cappers.filter((c) => c.picksPostedToday >= 6);

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
        <StatCard label="Cappers today" value={visibleCappers.length.toString()} />
        <StatCard
          label="Top win rate"
          value={`${Math.max(...cappers.map((c) => c.winRate)).toFixed(0)}%`}
          accent
        />
        <StatCard label="Per unlock" value="$5" />
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
      <div className="space-y-3">
        {visibleCappers.map((c) => {
          const isOpen = expanded === c.id;
          const isUnlocked = !!unlocked[c.id];
          const progressPct = Math.min(100, (c.picksPostedToday / 6) * 100);
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
                  {c.handle[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">@{c.handle}</span>
                    {c.status === "hot" && (
                      <span className="text-xs bg-hot/15 text-hot px-1.5 py-0.5 rounded">
                        🔥 HOT
                      </span>
                    )}
                    {c.status === "cold" && (
                      <span className="text-xs bg-cold/15 text-cold px-1.5 py-0.5 rounded">
                        ❄️ COLD
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {c.sport} · {c.record} · {c.winRate.toFixed(1)}% · ROI {c.roi > 0 ? "+" : ""}
                    {c.roi.toFixed(1)}%
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-panel2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    {c.picksPostedToday}/6+ picks posted today
                  </div>
                </div>
                <span className="text-muted text-lg">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-border bg-panel2 p-4 space-y-2">
                  {!isUnlocked && (
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-sm text-muted">
                        Unlock all {c.picksPostedToday} picks for today
                      </div>
                      <button
                        onClick={() => setUnlocked({ ...unlocked, [c.id]: true })}
                        className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-glow"
                      >
                        <span>🟡</span> 1 token · Unlock
                      </button>
                    </div>
                  )}
                  <ol className={`space-y-2 ${isUnlocked ? "" : "blur-picks"}`}>
                    {c.picks.map((p, i) => (
                      <li
                        key={p.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-bg border border-border"
                      >
                        <div className="text-xs font-display text-green w-6">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted">
                            {p.sport} · {p.type}
                          </div>
                          <div className="font-semibold">{p.matchup}</div>
                          <div className="text-sm text-green">{p.selection}</div>
                        </div>
                      </li>
                    ))}
                    {/* Placeholder slots for un-posted picks */}
                    {Array.from({
                      length: Math.max(0, 6 - c.picks.length),
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

      {/* Hidden cappers note */}
      {cappers.length > visibleCappers.length && (
        <div className="text-xs text-muted text-center pt-2">
          {cappers.length - visibleCappers.length} capper(s) hidden today —
          fewer than 6 picks posted.
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
