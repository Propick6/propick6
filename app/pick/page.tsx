"use client";

import { useState } from "react";

const sports = ["NFL", "NBA", "NHL", "MLB", "NCAAF", "NCAAB", "UFC", "Soccer"];
const types = ["Spread", "ML", "O/U", "Prop", "Parlay", "Futures"] as const;

export default function PickPage() {
  const [sport, setSport] = useState("NBA");
  const [type, setType] = useState<(typeof types)[number]>("Spread");
  const [matchup, setMatchup] = useState("");
  const [selection, setSelection] = useState("");
  const [submitted, setSubmitted] = useState<number>(2); // mock: already posted 2 today

  const submit = () => {
    if (!matchup.trim() || !selection.trim()) return;
    setSubmitted((s) => Math.min(10, s + 1));
    setMatchup("");
    setSelection("");
  };

  const hitMinimum = submitted >= 6;

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
            {submitted}/6 {hitMinimum && "· LIVE in feed"}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < submitted;
            const beyondMin = i >= 6 && filled;
            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  beyondMin
                    ? "bg-gold"
                    : filled
                    ? "bg-green"
                    : i === 5
                    ? "bg-green/20"
                    : "bg-panel2"
                }`}
              />
            );
          })}
        </div>
        <div className="text-[11px] text-muted mt-2">
          Green = required picks (1–6). Gold = bonus picks up to 10 max.
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-panel p-4 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Sport
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

        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Matchup
          </label>
          <input
            value={matchup}
            onChange={(e) => setMatchup(e.target.value)}
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

        <button
          onClick={submit}
          disabled={!matchup.trim() || !selection.trim() || submitted >= 10}
          className="w-full bg-green text-bg font-semibold py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitted >= 10 ? "Max 10 picks reached" : "Post pick"}
        </button>
      </div>

      {/* Earn info */}
      <div className="rounded-xl border border-blue/30 bg-blue/5 p-4 text-sm">
        <div className="text-blue font-semibold flex items-center gap-2 mb-1">
          🔵 Earn Token
        </div>
        <div className="text-muted">
          Every time a buyer unlocks your card, you earn 1 🔵 Earn Token ($3
          cash value). Cash out anytime via Stripe or convert 5 🔵 into 3 🟡
          Unlock Tokens.
        </div>
      </div>
    </div>
  );
}
