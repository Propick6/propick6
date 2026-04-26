"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  handle: string;
  display_name: string | null;
  wins: number;
  losses: number;
  pushes: number;
  roi: number;
  // DB column is still earn_tokens (UI labels it "Redeem Tokens" — see CONTEXT.md).
  earn_tokens: number;
};

type Pick = {
  id: string;
  sport: string;
  pick_type: string;
  matchup: string;
  selection: string;
  pick_date: string;
  result: "pending" | "win" | "loss" | "push";
};

const HISTORY_LIMIT = 50;

export default function StatsPage() {
  const supabase = createClient();
  const [authState, setAuthState] = useState<"checking" | "out" | "in">(
    "checking"
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [moreAvailable, setMoreAvailable] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthState("out");
        return;
      }
      setAuthState("in");

      // Profile basics
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, handle, display_name, wins, losses, pushes, roi, earn_tokens")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(prof as Profile | null);

      // Pick history — most recent first.
      // Grab one extra so we know if there are more beyond HISTORY_LIMIT.
      const { data: rows } = await supabase
        .from("picks")
        .select("id, sport, pick_type, matchup, selection, pick_date, result")
        .eq("seller_id", user.id)
        .order("pick_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT + 1);

      // Filter out stale pending picks (>3 days old). These are picks that
      // were posted before structured grading existed (free-text matchup, no
      // external_game_id) — they'll never resolve, so don't clutter the view.
      const STALE_DAYS = 3;
      const staleCutoff = new Date();
      staleCutoff.setHours(0, 0, 0, 0);
      staleCutoff.setDate(staleCutoff.getDate() - STALE_DAYS);
      const cutoffStr = staleCutoff.toISOString().slice(0, 10);

      const filtered = ((rows as Pick[] | null) ?? []).filter(
        (p) => !(p.result === "pending" && p.pick_date < cutoffStr)
      );

      setMoreAvailable(filtered.length > HISTORY_LIMIT);
      setPicks(filtered.slice(0, HISTORY_LIMIT));
    }
    load();
  }, []);

  // ---------- Auth-gated render ----------
  if (authState === "checking") {
    return <div className="text-center text-sm text-muted py-10">Loading…</div>;
  }

  if (authState === "out") {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-4 text-center">
        <h1 className="font-display text-3xl">MY STATS</h1>
        <p className="text-sm text-muted">
          Sign in to see your stats and pick history.
        </p>
        <Link
          href="/signin?next=/stats"
          className="inline-block bg-green text-bg font-semibold px-5 py-2.5 rounded-full text-sm shadow-glow"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ---------- Derived numbers ----------
  const wins = profile?.wins ?? 0;
  const losses = profile?.losses ?? 0;
  const pushes = profile?.pushes ?? 0;
  const totalGraded = wins + losses;
  const recordStr =
    pushes > 0 ? `${wins}-${losses}-${pushes}` : `${wins}-${losses}`;
  const winRate = totalGraded > 0 ? (wins / totalGraded) * 100 : 0;
  const roi = Number(profile?.roi ?? 0);
  const redeemTokens = profile?.earn_tokens ?? 0;

  const pendingCount = picks.filter((p) => p.result === "pending").length;
  const winCount = picks.filter((p) => p.result === "win").length;
  const lossCount = picks.filter((p) => p.result === "loss").length;
  const pushCount = picks.filter((p) => p.result === "push").length;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">MY STATS</h1>

      {/* Profile top card */}
      <div className="rounded-xl border border-border bg-panel p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-2xl text-green">
          {profile?.handle?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1">
          <div className="font-display text-2xl">
            @{profile?.handle ?? "you"}
          </div>
          <div className="text-sm text-muted">
            Record {recordStr} ·{" "}
            {totalGraded > 0 ? `${winRate.toFixed(1)}% win rate` : "no graded picks yet"}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Record" value={recordStr} />
        <Kpi
          label="Win Rate"
          value={totalGraded > 0 ? `${winRate.toFixed(1)}%` : "—"}
          accent={totalGraded > 0 && winRate >= 60}
        />
        <Kpi
          label="ROI"
          value={
            totalGraded > 0
              ? `${roi > 0 ? "+" : ""}${roi.toFixed(1)}%`
              : "—"
          }
        />
        <Kpi label="Redeem 🔵" value={redeemTokens.toString()} />
      </div>

      {/* ---------- Pick History ---------- */}
      <section className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Pick History
          </div>
          <div className="font-display text-xl mt-0.5">
            {picks.length === 0
              ? "No picks yet"
              : `${picks.length} pick${picks.length === 1 ? "" : "s"}${
                  moreAvailable ? "+" : ""
                }`}
          </div>
          {picks.length > 0 && (
            <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                <span className="text-green font-semibold">{winCount} W</span> ·{" "}
                <span className="text-hot font-semibold">{lossCount} L</span>
                {pushCount > 0 && (
                  <>
                    {" "}
                    · <span className="text-blue font-semibold">{pushCount} P</span>
                  </>
                )}
              </span>
              {pendingCount > 0 && (
                <span>
                  <span className="text-muted font-semibold">
                    {pendingCount} pending
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {picks.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            You haven&apos;t posted any picks yet.{" "}
            <Link href="/pick" className="text-green underline">
              Post your first pick →
            </Link>
          </div>
        ) : (
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
            {moreAvailable && (
              <div className="p-3 text-center text-[11px] text-muted">
                Showing your most recent {HISTORY_LIMIT} picks.
              </div>
            )}
          </div>
        )}
      </section>

      {/* April Earnings — placeholder demo data until earnings are computed
          from the unlocks/transactions tables in a follow-up round. */}
      <section className="rounded-xl border border-border bg-panel p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display text-xl">APRIL EARNINGS</h2>
          <span className="text-[10px] uppercase tracking-wider text-muted bg-panel2 border border-border rounded-full px-2 py-0.5">
            Demo data
          </span>
        </div>
        <Row k="Cards unlocked by buyers" v="42" />
        <Row k="🔵 Redeem Tokens earned" v="42 (126 cash value)" />
        <Row k="Cash withdrawn via Stripe" v="$90.00" />
        <Row k="Converted 🔵 → 🟡" v="15 🔵" />
        <Row
          k="Remaining 🔵 Redeem Tokens"
          v={`${redeemTokens} 🔵 ($${redeemTokens * 3})`}
        />
        <div className="border-t border-border my-3" />
        <Row
          k="Platform rake on your unlocks (info)"
          v="$84.00 (Pro Pick 6's cut)"
          subtle
        />
      </section>

      {/* How earnings work */}
      <div className="rounded-xl border border-border bg-panel2 p-4 text-sm space-y-2">
        <div className="font-display text-lg">HOW YOU GET PAID</div>
        <div className="text-muted">
          Every unlock of your card: buyer pays 1 🟡 ($5), you earn 1 🔵 ($3
          cash), Pro Pick 6 keeps $2. Cash out your 🔵 anytime via Stripe, or
          convert 5 🔵 → 3 🟡 to unlock other cappers.
        </div>
      </div>
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

// "2026-04-23" → "Today" / "Yesterday" / "Apr 21"
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

function Kpi({
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

function Row({
  k,
  v,
  subtle,
}: {
  k: string;
  v: string;
  subtle?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 text-sm ${
        subtle ? "text-muted" : ""
      }`}
    >
      <span>{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
