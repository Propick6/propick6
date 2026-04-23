"use client";

import { useState } from "react";
import { weeklyLeaders, monthlyLeaders, allTimeLeaders } from "@/lib/mockData";

const tabs = [
  { id: "week", label: "Weekly", data: weeklyLeaders },
  { id: "month", label: "Monthly", data: monthlyLeaders },
  { id: "all", label: "All-Time", data: allTimeLeaders },
];

export default function LeaderboardPage() {
  const [active, setActive] = useState("week");
  const activeTab = tabs.find((t) => t.id === active)!;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">LEADERBOARD</h1>
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
            onClick={() => setActive(t.id)}
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
        <div className="grid grid-cols-[40px_1fr_80px_70px_70px] gap-2 text-[11px] uppercase tracking-wider text-muted px-4 py-3 border-b border-border bg-panel2">
          <div>#</div>
          <div>Capper</div>
          <div>Record</div>
          <div>Win%</div>
          <div>ROI</div>
        </div>
        {activeTab.data.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[40px_1fr_80px_70px_70px] gap-2 items-center px-4 py-3 border-b border-border last:border-0 text-sm"
          >
            <div className="font-display text-lg">{c.rank}</div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-semibold">@{c.handle}</span>
              {c.status === "hot" && (
                <span className="text-[10px] text-hot">🔥</span>
              )}
              {c.status === "cold" && (
                <span className="text-[10px] text-cold">❄️</span>
              )}
            </div>
            <div>{c.record}</div>
            <div>{c.winRate.toFixed(1)}%</div>
            <div className={c.roi >= 0 ? "text-green" : "text-hot"}>
              {c.roi > 0 ? "+" : ""}
              {c.roi.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
