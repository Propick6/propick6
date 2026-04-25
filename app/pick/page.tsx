"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchEspnGames,
  isEspnSupported,
  type EspnGame,
} from "@/lib/espnGames";

const sports = ["NFL", "NBA", "NHL", "MLB", "NCAAF", "NCAAB", "UFC", "Soccer"];
const types = ["Spread", "ML", "O/U", "Prop", "Parlay", "Futures"] as const;

const MIN_PICKS = 6;
const MAX_PICKS = 10;

export default function PickPage() {
  const supabase = createClient();

  // Auth + DB state
  const [authState, setAuthState] = useState<"checking" | "out" | "in">(
    "checking"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [submittedToday, setSubmittedToday] = useState(0);

  // Form state
  const [sport, setSport] = useState("NBA");
  const [type, setType] = useState<(typeof types)[number]>("Spread");
  const [matchup, setMatchup] = useState("");
  const [selection, setSelection] = useState("");

  // Game picker state
  const [games, setGames] = useState<EspnGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);

  // 1. Auth + today's submitted count on mount
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthState("out");
        return;
      }
      setUserId(user.id);
      setAuthState("in");

      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase
        .from("picks")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("pick_date", today);
      setSubmittedToday(count ?? 0);
    }
    init();
  }, []);

  // 2. Fetch games whenever league changes (only for ESPN-supported leagues)
  useEffect(() => {
    setSelectedGameId(null);
    if (!isEspnSupported(sport)) {
      setGames([]);
      setGamesLoading(false);
      return;
    }

    let cancelled = false;
    setGamesLoading(true);
    fetchEspnGames(sport, 4)
      .then((g) => {
        if (cancelled) return;
        setGames(g);
        setGamesLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGames([]);
        setGamesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sport]);

  function selectGame(g: EspnGame) {
    setSelectedGameId(g.id);
    setMatchup(g.matchup);
  }

  async function submit() {
    if (!userId) return;
    if (!matchup.trim() || !selection.trim()) return;
    if (submittedToday >= MAX_PICKS) return;

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("picks").insert({
      seller_id: userId,
      sport,
      pick_type: type,
      matchup: matchup.trim(),
      selection: selection.trim(),
      // pick_date defaults to current_date in Postgres; result defaults to 'pending'.
    });

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    setSubmittedToday((n) => n + 1);
    setMatchup("");
    setSelection("");
    setSelectedGameId(null);
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 2000);
    setSubmitting(false);
  }

  const hitMinimum = submittedToday >= MIN_PICKS;
  const atMax = submittedToday >= MAX_PICKS;

  // ---------- Auth-gated render ----------
  if (authState === "checking") {
    return (
      <div className="text-center text-sm text-muted py-10">Loading…</div>
    );
  }

  if (authState === "out") {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-4 text-center">
        <h1 className="font-display text-3xl">+ NEW PICK</h1>
        <p className="text-sm text-muted">
          Sign in to post picks. Your card needs 6 picks to go live in the
          feed.
        </p>
        <Link
          href="/signin?next=/pick"
          className="inline-block bg-green text-bg font-semibold px-5 py-2.5 rounded-full text-sm shadow-glow"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ---------- Signed-in form ----------
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl">+ NEW PICK</h1>
        <div className="text-sm text-muted">
          Post 6 picks to go live in today&apos;s feed. Picks expire at midnight.
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-panel p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted">Today&apos;s progress</span>
          <span className={hitMinimum ? "text-green font-semibold" : ""}>
            {submittedToday}/{MIN_PICKS} {hitMinimum && "· LIVE in feed"}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: MAX_PICKS }).map((_, i) => {
            const filled = i < submittedToday;
            const beyondMin = i >= MIN_PICKS && filled;
            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  beyondMin
                    ? "bg-gold"
                    : filled
                    ? "bg-green"
                    : i === MIN_PICKS - 1
                    ? "bg-green/20"
                    : "bg-panel2"
                }`}
              />
            );
          })}
        </div>
        <div className="text-[11px] text-muted mt-2">
          Green = required picks (1–{MIN_PICKS}). Gold = bonus picks up to{" "}
          {MAX_PICKS} max.
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-panel p-4 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            League
          </label>
          <div className="flex flex-wrap gap-1 mt-2">
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`px-3 py-1 rounded-full text-sm ${
                  sport === s
                    ? "bg-green text-bg font-semibold"
                    : "bg-panel2 text-muted hover:text-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Pick type
          </label>
          <div className="flex flex-wrap gap-1 mt-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1 rounded-full text-sm ${
                  type === t
                    ? "bg-green text-bg font-semibold"
                    : "bg-panel2 text-muted hover:text-text"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Game picker — visible only for ESPN-supported leagues */}
        {isEspnSupported(sport) && (
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">
              Upcoming {sport} games — tap one to fill the matchup
            </label>
            <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-border bg-panel2">
              {gamesLoading ? (
                <div className="p-4 text-center text-xs text-muted">
                  Loading {sport} schedule…
                </div>
              ) : games.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted">
                  No {sport} games in the next 5 days. Type the matchup
                  manually below.
                </div>
              ) : (
                groupGamesByDate(games).map(([dateLabel, dayGames]) => (
                  <div key={dateLabel}>
                    <div className="px-3 py-1.5 bg-panel border-b border-border text-[10px] uppercase tracking-wider text-muted sticky top-0">
                      {dateLabel}
                    </div>
                    {dayGames.map((g) => {
                      const isSelected = selectedGameId === g.id;
                      const isLive = g.state === "in";
                      const isFinal = g.state === "post";
                      return (
                        <button
                          key={g.id}
                          onClick={() => selectGame(g)}
                          disabled={isFinal}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm border-b border-border last:border-0 transition ${
                            isSelected
                              ? "bg-green/15 text-green"
                              : isFinal
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-panel"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">
                              {g.matchup}
                            </div>
                            <div className="text-[10px] text-muted">
                              {g.awayTeam} @ {g.homeTeam}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted whitespace-nowrap">
                            {isLive ? (
                              <span className="text-hot font-semibold">
                                LIVE
                              </span>
                            ) : isFinal ? (
                              <span>FINAL</span>
                            ) : (
                              formatTime(g.startsAt)
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Matchup
          </label>
          <input
            value={matchup}
            onChange={(e) => {
              setMatchup(e.target.value);
              setSelectedGameId(null); // typing breaks the link to a selected game
            }}
            placeholder="e.g. Lakers @ Celtics"
            className="mt-2 w-full bg-panel2 border border-border rounded-lg px-3 py-2 text-sm focus:border-green outline-none"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Your pick
          </label>
          <input
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            placeholder="e.g. Celtics -4.5"
            className="mt-2 w-full bg-panel2 border border-border rounded-lg px-3 py-2 text-sm focus:border-green outline-none"
          />
        </div>

        {submitError && (
          <div className="rounded-md border border-hot/40 bg-hot/10 p-2 text-xs text-hot">
            {submitError}
          </div>
        )}

        {justPosted && (
          <div className="rounded-md border border-green/40 bg-green/10 p-2 text-xs text-green">
            ✓ Pick posted. Keep going — you&apos;re at {submittedToday}/
            {MIN_PICKS}.
          </div>
        )}

        <button
          onClick={submit}
          disabled={
            submitting || !matchup.trim() || !selection.trim() || atMax
          }
          className="w-full bg-green text-bg font-semibold py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {atMax
            ? `Max ${MAX_PICKS} picks reached`
            : submitting
            ? "Posting…"
            : "Post pick"}
        </button>
      </div>

      {/* Earn info */}
      <div className="rounded-xl border border-blue/30 bg-blue/5 p-4 text-sm">
        <div className="text-blue font-semibold flex items-center gap-2 mb-1">
          🔵 Redeem Token
        </div>
        <div className="text-muted">
          Every time a buyer unlocks your card, you earn 1 🔵 Redeem Token ($3
          cash value). Cash out anytime via Stripe or convert 5 🔵 into 3 🟡
          Unlock Tokens.
        </div>
      </div>
    </div>
  );
}

// Group games by their local date and label as Today / Tomorrow / Wed Apr 29.
function groupGamesByDate(games: EspnGame[]): [string, EspnGame[]][] {
  const map = new Map<string, EspnGame[]>();
  for (const g of games) {
    const d = new Date(g.startsAt);
    const key = d.toDateString(); // e.g. "Sat Apr 25 2026"
    const list = map.get(key) ?? [];
    list.push(g);
    map.set(key, list);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from(map.entries()).map(([key, list]) => {
    const d = new Date(key);
    const diffDays = Math.round(
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    let label: string;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Tomorrow";
    else
      label = d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    return [label, list] as [string, EspnGame[]];
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
