"use client";

import Link from "next/link";
import { useState } from "react";
import { weeklyLeaders, monthlyLeaders, allTimeLeaders } from "@/lib/mockData";

const tabs = [
  { id: "week", label: "Weekly", data: weeklyLeaders },
  { id: "month", label: "Monthly", data: monthlyLeaders },
  { id: "all", label: "All-Time", data: allTimeLeaders },
];

const PAGE_SIZE = 10;

export default function LeaderboardPage() {
  const [active, setActive] = useState("week");
  const [page, setPage] = useState(1);
  const activeTab = tabs.find((t) => t.id === active)!;

  const totalPages = Math.max(1, Math.ceil(activeTab.data.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visible = activeTab.data.slice(startIdx, startIdx + PAGE_SIZE);

  // Simple pager: always show 1, 2, 3 then Next / Last (if applicable).
  const pageNumbers: number[] = [];
  for (let i = 1; i <= Math.min(3, totalPages); i++) pageNumbers.push(i);

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  function switchTab(id: string) {
    setActive(id);
    setPage(1);
  }

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

      {/* Tabs */}
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_70px_60px_60px_50px] gap-2 text-[11px] uppercase tracking-wider text-muted px-4 py-3 border-b border-border bg-panel2">
          <div>Place</div>
          <div>User</div>
          <div>Record</div>
          <div>Win%</div>
          <div>Last 6</div>
          <div className="text-center">Picks</div>
        </div>
        {visible.map((c) => {
          const hasPicksToday = c.picksPostedToday >= 6;
          return (
            <div
              key={c.id}
              className="grid grid-cols-[40px_1fr_70px_60px_60px_50px] gap-2 items-center px-4 py-3 border-b border-border last:border-0 text-sm"
            >
              <div className="font-display text-lg">{c.rank}</div>
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
          );
        })}
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
