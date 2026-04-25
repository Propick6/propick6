"use client";

import Link from "next/link";
import { useState } from "react";
import { weeklyLeaders, monthlyLeaders, allTimeLeaders } from "@/lib/mockData";

const tabs = [
  { id: "week", label: "Weekly", data: weeklyLeaders },
  { id: "month", label: "Monthly", data: monthlyLeaders },
  { id: "all", label: "All-Time", data: allTimeLeaders },
];

const sportFilters = [
  { id: "ALL", label: "All" },
  { id: "NBA", label: "NBA" },
  { id: "NFL", label: "NFL" },
  { id: "NHL", label: "NHL" },
  { id: "MLB", label: "MLB" },
];

const PAGE_SIZE = 10;

export default function LeaderboardPage() {
  const [active, setActive] = useState("week");
  const [sport, setSport] = useState("ALL");
  const [page, setPage] = useState(1);
  const activeTab = tabs.find((t) => t.id === active)!;

  // Strict rule: a capper appears under a sport filter only if 100% of their
  // picks are that sport (pureSport === sport). Mixed-sport cappers (pureSport === null)
  // appear ONLY under "All".
  const filtered =
    sport === "ALL"
      ? activeTab.data
      : activeTab.data.filter((c) => c.pureSport === sport);

  // Reassign visible ranks so the top of the filtered list is "1".
  const ranked = filtered.map((c, i) => ({ ...c, displayRank: i + 1 }));

  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visible = ranked.slice(startIdx, startIdx + PAGE_SIZE);

  const pageNumbers: number[] = [];
  for (let i = 1; i <= Math.min(3, totalPages); i++) pageNumbers.push(i);

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  function switchTab(id: string) {
    setActive(id);
    setPage(1);
  }

  function switchSport(id: string) {
    setSport(id);
    setPage(1);
  }

  const activeSportLabel = sportFilters.find((s) => s.id === sport)!.label;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">
          LEADERBOARD <span className="text-muted">— {activeTab.label}</span>
        </h1>
        <div className="text-sm text-muted">Who&apos;s hot, who&apos;s cold.</div>
      </div>

      {/* Ad slot above leaderboard */}
      <div className="rounded-xl border border-border bg-panel p-4 text-center text-sm text-muted">
        Your ad here — <a href="/advertise" className="text-green underline">Leaderboard Banner $299/week</a>
      </div>

      {/* Time-window tabs */}
      <div className="flex gap-1 bg-panel p-1 rounded-full border border-border w-full max-w-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex-1 px-3 py-1.5 rounded-full text-sm transition ${
              active === t.id
                ? "bg-green text-bg font-semibold"
                : "text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sport filter pills */}
      <div className="flex gap-1 bg-panel p-1 rounded-full border border-border w-full max-w-md">
        {sportFilters.map((s) => (
          <button
            key={s.id}
            onClick={() => switchSport(s.id)}
            className={`flex-1 px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition ${
              sport === s.id
                ? "bg-green text-bg font-semibold"
                : "text-muted hover:text-text"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sport !== "ALL" && (
        <div className="text-xs text-muted">
          Showing {ranked.length} pure {activeSportLabel} cappers — mixed-sport cappers
          only appear under <button onClick={() => switchSport("ALL")} className="underline hover:text-text">All</button>.
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        {/* Column header — desktop only; on mobile each row carries inline labels */}
        <div className="hidden md:grid grid-cols-[40px_1fr_80px_70px_70px_60px] gap-2 text-[11px] uppercase tracking-wider text-muted px-4 py-3 border-b border-border bg-panel2">
          <div>Place</div>
          <div>User</div>
          <div>Record</div>
          <div>Win%</div>
          <div>Last 6</div>
          <div className="text-center">Picks</div>
        </div>
        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted">
            No pure {activeSportLabel} cappers yet — try another sport or{" "}
            <button onClick={() => switchSport("ALL")} className="text-green underline">
              view all
            </button>
            .
          </div>
        ) : (
          visible.map((c) => {
            const hasPicksToday = c.picksPostedToday >= 6;
            return (
              <div
                key={c.id}
                className="px-4 py-3 border-b border-border last:border-0"
              >
                {/* MOBILE: two-row layout. Top row = place + emoji + handle + eyeball.
                    Bottom row = stats (record · win% · L6) under the handle. */}
                <div className="md:hidden">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-lg w-6 shrink-0">
                      {c.displayRank}
                    </span>
                    {c.status === "hot" && (
                      <span className="text-[14px] shrink-0" aria-label="hot">🔥</span>
                    )}
                    {c.status === "cold" && (
                      <span className="text-[14px] shrink-0" aria-label="cold">❄️</span>
                    )}
                    <Link
                      href={`/u/${c.handle}`}
                      className="flex-1 min-w-0 truncate font-semibold hover:text-green"
                    >
                      @{c.handle}
                    </Link>
                    <div className="shrink-0 w-7 text-center">
                      {hasPicksToday ? (
                        <Link
                          href={`/u/${c.handle}`}
                          title="Picks in for today — view profile"
                          aria-label={`${c.handle} has picks in for today`}
                          className="inline-block text-base hover:scale-110 transition-transform"
                        >
                          👁
                        </Link>
                      ) : (
                        <span className="text-muted opacity-30" aria-label="no picks yet">—</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 pl-9 flex items-center gap-2.5 text-xs text-muted">
                    <span>{c.record}</span>
                    <span className="opacity-30">·</span>
                    <span>{c.winRate.toFixed(1)}%</span>
                    <span className="opacity-30">·</span>
                    <span>L6: <span className="text-text">{c.last6}</span></span>
                  </div>
                </div>

                {/* DESKTOP: single-row grid matching the column header above */}
                <div className="hidden md:grid grid-cols-[40px_1fr_80px_70px_70px_60px] gap-2 items-center text-sm">
                  <div className="font-display text-lg">{c.displayRank}</div>
                  <div className="flex items-center gap-2 min-w-0">
                    {c.status === "hot" && (
                      <span className="text-[12px]" aria-label="hot">🔥</span>
                    )}
                    {c.status === "cold" && (
                      <span className="text-[12px]" aria-label="cold">❄️</span>
                    )}
                    <Link
                      href={`/u/${c.handle}`}
                      className="truncate font-semibold hover:text-green"
                    >
                      @{c.handle}
                    </Link>
                  </div>
                  <div>{c.record}</div>
                  <div>{c.winRate.toFixed(1)}%</div>
                  <div>{c.last6}</div>
                  <div className="text-center">
                    {hasPicksToday ? (
                      <Link
                        href={`/u/${c.handle}`}
                        title="Picks in for today — view profile"
                        aria-label={`${c.handle} has picks in for today`}
                        className="inline-block text-base hover:scale-110 transition-transform"
                      >
                        👁
                      </Link>
                    ) : (
                      <span className="text-muted opacity-30" aria-label="no picks yet">—</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2 text-sm">
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`min-w-9 px-3 py-1.5 rounded-md border transition ${
                safePage === n
                  ? "bg-green text-bg border-green font-semibold"
                  : "bg-panel border-border text-muted hover:text-text"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage >= totalPages}
            className="px-3 py-1.5 rounded-md border border-border bg-panel text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={() => goTo(totalPages)}
            disabled={safePage >= totalPages}
            className="px-3 py-1.5 rounded-md border border-border bg-panel text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
