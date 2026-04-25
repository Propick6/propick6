"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  follower_count: number;
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
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pools, setPools] = useState<OwnedPool[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [activeTodayCount, setActiveTodayCount] = useState(0);
  const [isSelf, setIsSelf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>("spam");
  const [reportNotes, setReportNotes] = useState("");
  const [reportStatus, setReportStatus] = useState<
    "idle" | "submitting" | "success" | "already" | "signin"
  >("idle");
  const [reportErr, setReportErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1. Look up the profile by handle
      const { data: p } = await supabase
        .from("profiles")
        .select(
          "id, handle, display_name, sport, wins, losses, pushes, roi, created_at, follower_count"
        )
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

        // 3. Resolved picks only — the track record. Pending picks are
        //    the paid product and live on the Feed behind the unlock button.
        const { data: recentPicks } = await supabase
          .from("picks")
          .select("id, sport, pick_type, matchup, selection, pick_date, result")
          .eq("seller_id", p.id)
          .neq("result", "pending")
          .order("pick_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(30);
        setPicks((recentPicks as Pick[]) ?? []);

        // 4. Count of today's pending picks so we can show a CTA to the Feed.
        const today = new Date().toISOString().slice(0, 10);
        const { count: activeCount } = await supabase
          .from("picks")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", p.id)
          .eq("pick_date", today)
          .eq("result", "pending");
        setActiveTodayCount(activeCount ?? 0);
      }

      // 5. Am I signed in? Looking at my own profile? Already following them?
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);
      if (user && p && user.id === p.id) setIsSelf(true);

      // RLS only returns my own follow rows, so this query simply checks if a
      // (me, them) row exists. If signed out, RLS returns nothing → not following.
      if (user && p && user.id !== p.id) {
        const { data: existing } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("followed_id", p.id)
          .maybeSingle();
        setIsFollowing(!!existing);
      }

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

  async function onFollow() {
    if (!profile) return;

    // Bounce signed-out users to sign-in, with redirect-back so they land
    // on the same profile after authenticating.
    if (!signedIn) {
      router.push(`/signin?next=/u/${profile.handle}`);
      return;
    }

    if (followBusy) return;
    setFollowBusy(true);

    const wasFollowing = isFollowing;
    const originalProfile = profile;

    // Optimistic UI update — flip immediately so the button feels snappy.
    setIsFollowing(!wasFollowing);
    setProfile({
      ...originalProfile,
      follower_count: Math.max(
        0,
        originalProfile.follower_count + (wasFollowing ? -1 : 1)
      ),
    });

    const rollback = () => {
      setIsFollowing(wasFollowing);
      setProfile(originalProfile);
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Edge case: session expired between mount and click.
      rollback();
      setFollowBusy(false);
      router.push(`/signin?next=/u/${originalProfile.handle}`);
      return;
    }

    const { error } = wasFollowing
      ? await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("followed_id", originalProfile.id)
      : await supabase.from("follows").insert({
          follower_id: user.id,
          followed_id: originalProfile.id,
        });

    if (error) {
      rollback();
      // For now log to console; next click can retry.
      console.error("Follow toggle failed:", error);
    }

    setFollowBusy(false);
  }

  async function openReport() {
    // Must be signed in to report.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReportStatus("signin");
      setReportOpen(true);
      return;
    }
    setReportReason("spam");
    setReportNotes("");
    setReportErr("");
    setReportStatus("idle");
    setReportOpen(true);
  }

  async function submitReport() {
    if (!profile) return;
    setReportErr("");
    setReportStatus("submitting");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setReportStatus("signin");
      return;
    }

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: profile.id,
      reason: reportReason,
      notes: reportNotes.trim() || null,
    });

    if (error) {
      // 23505 = unique violation (user already reported this profile)
      if (error.code === "23505") {
        setReportStatus("already");
      } else {
        setReportErr(error.message);
        setReportStatus("idle");
      }
      return;
    }

    setReportStatus("success");
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
            <div className="text-xs text-muted mt-1">
              <span className="font-semibold text-text">
                {profile.follower_count.toLocaleString()}
              </span>{" "}
              follower{profile.follower_count === 1 ? "" : "s"}
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
              Edit account
            </Link>
          ) : isFollowing ? (
            <button
              onClick={onFollow}
              disabled={followBusy}
              className="group border border-green text-green hover:bg-hot/10 hover:border-hot hover:text-hot font-semibold px-4 py-2 rounded-full text-sm transition disabled:opacity-60"
            >
              <span className="group-hover:hidden">✓ Following</span>
              <span className="hidden group-hover:inline">Unfollow</span>
            </button>
          ) : (
            <button
              onClick={onFollow}
              disabled={followBusy}
              className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow disabled:opacity-60"
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

      {/* Active today — locked behind Feed unlock */}
      {activeTodayCount > 0 && (
        <Link
          href="/"
          className="block rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4 hover:bg-gold/15 transition"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gold">
                Active Today
              </div>
              <div className="font-display text-xl mt-0.5">
                {activeTodayCount} pick{activeTodayCount === 1 ? "" : "s"}{" "}
                posted — unlock on the Feed
              </div>
              <div className="text-[11px] text-muted mt-1">
                🟡 1 token unlocks all of today&apos;s picks
              </div>
            </div>
            <div className="text-gold text-2xl">→</div>
          </div>
        </Link>
      )}

      {/* Track record — resolved picks only */}
      <div className="rounded-xl border border-border bg-panel overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Track Record
          </div>
          <div className="font-display text-xl">
            {picks.length === 0
              ? "No resolved picks yet"
              : `Last ${picks.length} settled pick${picks.length === 1 ? "" : "s"}`}
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
            onClick={openReport}
            className="text-xs text-muted hover:text-text underline"
          >
            Report this user
          </button>
        </div>
      )}

      {/* Report modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="bg-panel border border-border rounded-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Report
              </div>
              <div className="font-display text-2xl mt-0.5">
                @{profile.handle}
              </div>
              <p className="text-xs text-muted mt-1">
                Help keep Pro Pick 6 fair. Reports are reviewed by our team.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {reportStatus === "signin" && (
                <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
                  You need to be signed in to report a user.{" "}
                  <Link
                    href={`/signin?next=/u/${profile.handle}`}
                    className="underline"
                  >
                    Sign in →
                  </Link>
                </div>
              )}

              {reportStatus === "success" && (
                <div className="rounded-md border border-green/40 bg-green/10 p-3 text-sm">
                  <span className="font-semibold text-green">
                    Report filed.
                  </span>{" "}
                  Thanks — we&apos;ll review it and take action if needed.
                </div>
              )}

              {reportStatus === "already" && (
                <div className="rounded-md border border-gold/40 bg-gold/10 p-3 text-sm">
                  <span className="font-semibold text-gold">
                    Already reported.
                  </span>{" "}
                  You&apos;ve filed a report on this user before — our team
                  has it.
                </div>
              )}

              {(reportStatus === "idle" || reportStatus === "submitting") && (
                <>
                  <div>
                    <div className="text-xs text-muted mb-1">Reason</div>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="spam">Spam or promotional</option>
                      <option value="fake_picks">
                        Fake or fabricated picks
                      </option>
                      <option value="abusive">Abusive behavior</option>
                      <option value="cheating">
                        Cheating / manipulating results
                      </option>
                      <option value="impersonation">Impersonating someone</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-muted mb-1">
                      Notes (optional)
                    </div>
                    <textarea
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Add any specifics that would help our review."
                      className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm resize-none"
                    />
                    <div className="text-[10px] text-muted text-right mt-1">
                      {reportNotes.length}/500
                    </div>
                  </div>

                  {reportErr && (
                    <div className="rounded-md border border-hot/40 bg-hot/10 p-2 text-xs text-hot">
                      {reportErr}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 bg-panel2 border-t border-border flex items-center gap-2 justify-end">
              <button
                onClick={() => setReportOpen(false)}
                className="px-4 py-2 rounded-full border border-border text-sm text-muted hover:text-text"
              >
                {reportStatus === "success" || reportStatus === "already"
                  ? "Close"
                  : "Cancel"}
              </button>
              {reportStatus !== "success" &&
                reportStatus !== "already" &&
                reportStatus !== "signin" && (
                  <button
                    onClick={submitReport}
                    disabled={reportStatus === "submitting"}
                    className="bg-hot text-bg font-semibold px-5 py-2 rounded-full text-sm disabled:opacity-60"
                  >
                    {reportStatus === "submitting" ? "Submitting…" : "Submit report"}
                  </button>
                )}
            </div>
          </div>
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
