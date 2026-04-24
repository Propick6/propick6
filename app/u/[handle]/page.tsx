"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  handle: string;
  display_name: string | null;
  sport: string | null;
  wins: number;
  losses: number;
  pushes: number;
  roi: number;
  created_at: string | null;
};

type OwnedPool = {
  id: string;
  name: string;
  kind: "official" | "private";
  duration: string;
};

type Pick = {
  id: string;
  sport: string;
  pick_type: string;
  matchup: string;
  selection: string;
  pick_date: string;   // yyyy-mm-dd
  result: "pending" | "win" | "loss" | "push";
};

export default function ProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const handleParam = decodeURIComponent(params.handle);
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pools, setPools] = useState<OwnedPool[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [isSelf, setIsSelf] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1. Look up the profile by handle
      const { data: p } = await supabase
        .from("profiles")
        .select("id, handle, display_name, sport, wins, losses, pushes, roi, created_at")
        .eq("handle", handleParam)
        .maybeSingle();

      if (p) {
        setProfile(p as Profile);

        // 2. Pools they own
        const { data: ownedPools } = await supabase
          .from("pools")
          .select("id, name, kind, duration")
          .eq("owner_id", p.id)
          .order("created_at", { ascending: false });
        setPools((ownedPools as OwnedPool[]) ?? []);

        // 3. Recent picks (last 30 days, most recent first)
        const { data: recentPicks } = await supabase
          .from("picks")
          .select("id, sport, pick_type, matchup, selection, pick_date, result")
          .eq("seller_id", p.id)
          .order("pick_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(30);
        setPicks((recentPicks as Pick[]) ?? []);
      }

      // 4. Am I looking at my own profile?
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && p && user.id === p.id) setIsSelf(true);

      setLoading(false);
    }
    load();
  }, [handleParam]);

  if (loading) {
    return (
      <div className="text-center text-sm text-muted mt-10">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-3 text-center">
        <h1 className="font-display text-3xl">NOT FOUND</h1>
        <p className="text-sm text-muted">
          No user with the handle @{handleParam}.
        </p>
        <Link
          href="/leaderboard"
          className="inline-block border border-border rounded-full px-4 py-2 text-sm text-muted hover:text-text"
        >
          Browse leaderboard →
        </Link>
      </div>
    );
  }

  const totalPicks = profile.wins + profile.losses + profile.pushes;
  const winPct =
    profile.wins + profile.losses > 0
      ? (profile.wins / (profile.wins + profile.losses)) * 100
      : 0;

  // Hot/cold heuristic — matches the badge logic used elsewhere.
  const status: "hot" | "cold" | "neutral" =
    profile.roi >= 10 || winPct >= 65
      ? "hot"
      : profile.roi <= -10 || (totalPicks > 0 && winPct <= 40)
      ? "cold"
      : "neutral";

  async function onShare() {
    const url = `${window.location.origin}/u/${profile!.handle}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — fall back to prompt.
      window.prompt("Copy this link:", url);
    }
  }

  function onFollow() {
    alert("Following isn't wired up yet — coming in a future round.");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-border bg-panel p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-3xl text-green">
            {profile.handle[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl leading-none">
                @{profile.handle}
              </h1>
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
            {profile.display_name && (
              <div className="text-sm mt-1">{profile.display_name}</div>
            )}
            <div className="text-xs text-muted mt-1">
              {profile.sport ? `${profile.sport} capper` : "Capper"}
              {profile.created_at &&
                ` · joined ${new Date(profile.created_at).toLocaleDateString(
                  undefined,
                  { month: "short", year: "numeric" }
                )}`}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {isSelf ? (
            <Link
              href="/account"
              className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow"
            >
              Edit profile
            </Link>
          ) : (
            <button
              onClick={onFollow}
              className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow"
            >
              Follow
            </button>
          )}
          <button
            onClick={onShare}
            className="border border-border text-muted hover:text-text px-4 py-2 rounded-full text-sm"
          >
            {copied ? "Link copied ✓" : "Share profile"}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Record"
          value={
            profile.pushes > 0
              ? `${profile.wins}-${profile.losses}-${profile.pushes}`
              : `${profile.wins}-${profile.losses}`
          }
        />
        <StatCard
          label="Win rate"
          value={totalPicks > 0 ? `${winPct.toFixed(1)}%` : "—"}
          accent={totalPicks > 0 && winPct >= 60}
        />
        <StatCard
          label="ROI"
          value={
            totalPicks > 0
              ? `${profile.roi > 0 ? "+" : ""}${profile.roi.toFixed(1)}%`
              : "—"
          }
          tone={
            totalPicks === 0
              ? "neutral"
              : profile.roi > 0
              ? "good"
              : profile.roi < 0
              ? "bad"
              : "neutral"
          }
        />
      </div>

      {/* Pools owned */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Pools hosted
          </div>
          <div className="font-display text-xl">
            {pools.length === 0
              ? "None yet"
              : `${pools.length} pool${pools.length === 1 ? "" : "s"}`}
          </div>
        </div>
        {pools.length > 0 && (
          <div className="divide-y divide-border">
            {pools.map((p) => (
              <Link
                key={p.id}
                href={`/pools/${p.id}`}
                className="flex items-center gap-3 p-3 hover:bg-panel2 transition"
              >
                <div className="text-lg">🏒</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted capitalize">
                    {p.kind} · {p.duration}
                  </div>
                </div>
                <span className="text-muted">▸</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent picks */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Recent picks
          </div>
          <div className="font-display text-xl">
            {picks.length === 0
              ? "None yet"
              : `Last ${picks.length} pick${picks.length === 1 ? "" : "s"}`}
          </div>
        </div>

        {picks.length > 0 && (
          <div className="divide-y divide-border">
            {groupPicksByDate(picks).map(([date, group]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-panel2 text-[11px] uppercase tracking-wider text-muted">
                  {formatDate(date)}
                </div>
                {group.map((p) => (
                  <PickRow key={p.id} pick={p} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Options (report etc.) — only shown to others */}
      {!isSelf && (
        <div className="text-center">
          <button
            onClick={() =>
              alert(
                "Reporting isn't wired up yet — coming in a future round."
              )
            }
            className="text-xs text-muted hover:text-text underline"
          >
            Report this user
          </button>
        </div>
      )}
    </div>
  );
}

function PickRow({ pick }: { pick: Pick }) {
  const resultStyles: Record<Pick["result"], string> = {
    pending: "bg-panel2 text-muted border-border",
    win: "bg-green/15 text-green border-green/40",
    loss: "bg-hot/15 text-hot border-hot/40",
    push: "bg-blue/15 text-blue border-blue/40",
  };
  const resultLabel: Record<Pick["result"], string> = {
    pending: "• PENDING",
    win: "✓ WIN",
    loss: "✗ LOSS",
    push: "= PUSH",
  };
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-panel2 transition">
      <div className="text-[10px] font-semibold text-muted w-10 pt-1">
        {pick.sport}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-muted">{pick.pick_type}</div>
        <div className="font-semibold truncate">{pick.matchup}</div>
        <div className="text-sm text-green">{pick.selection}</div>
      </div>
      <span
        className={`text-[10px] font-semibold px-2 py-1 rounded border whitespace-nowrap ${resultStyles[pick.result]}`}
      >
        {resultLabel[pick.result]}
      </span>
    </div>
  );
}

// Group picks by pick_date, preserving the incoming (desc) order.
function groupPicksByDate(picks: Pick[]): [string, Pick[]][] {
  const map = new Map<string, Pick[]>();
  for (const p of picks) {
    const list = map.get(p.pick_date) ?? [];
    list.push(p);
    map.set(p.pick_date, list);
  }
  return Array.from(map.entries());
}

// "2026-04-23" -> "Today" / "Yesterday" / "Apr 21"
function formatDate(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(isoDate + "T00:00:00");
  const diffDays = Math.round(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatCard({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "good" | "bad" | "neutral";
}) {
  const valueColor =
    tone === "good"
      ? "text-green"
      : tone === "bad"
      ? "text-hot"
      : accent
      ? "text-green"
      : "";
  return (
    <div className="rounded-xl border border-border bg-panel p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`font-display text-2xl mt-0.5 ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}
