"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_ROSTER,
  DEFAULT_SCORING,
  type EntryModel,
  type PoolDuration,
  type PoolKind,
} from "@/lib/poolMockData";

export default function CreatePoolPage() {
  const router = useRouter();
  const supabase = createClient();

  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Basic
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PoolKind>("private");
  const [duration, setDuration] = useState<PoolDuration>("playoffs");
  const [maxEntries, setMaxEntries] = useState<number>(20);
  const [prizePool, setPrizePool] = useState("");

  // Entry
  const [entryModel, setEntryModel] = useState<EntryModel>("free");
  const [entryTokens, setEntryTokens] = useState<number>(3);

  // Roster
  const [forwards, setForwards] = useState(DEFAULT_ROSTER.forwards);
  const [defense, setDefense] = useState(DEFAULT_ROSTER.defense);
  const [goalies, setGoalies] = useState(DEFAULT_ROSTER.goalies);

  // Scoring
  const [goalPts, setGoalPts] = useState(DEFAULT_SCORING.goal);
  const [assistPts, setAssistPts] = useState(DEFAULT_SCORING.assist);
  const [winPts, setWinPts] = useState(DEFAULT_SCORING.goalieWin);
  const [soPts, setSoPts] = useState(DEFAULT_SCORING.goalieShutout);

  // Draft
  const [uniqueDraft, setUniqueDraft] = useState(false);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
    });
  }, []);

  const totalRoster = forwards + defense + goalies;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("You need to be signed in to create a pool.");
      setSaving(false);
      return;
    }

    // Build a short join code for private pools.
    const joinCode =
      kind === "private"
        ? Math.random().toString(36).slice(2, 8).toUpperCase()
        : null;

    const { data, error } = await supabase
      .from("pools")
      .insert({
        name,
        kind,
        sport: "NHL",
        owner_id: user.id,
        entry_model: entryModel,
        entry_tokens: entryModel === "tokens" ? entryTokens : 0,
        duration,
        max_entries: maxEntries,
        roster_forwards: forwards,
        roster_defense: defense,
        roster_goalies: goalies,
        scoring_goal: goalPts,
        scoring_assist: assistPts,
        scoring_pim: 0,
        scoring_goalie_win: winPts,
        scoring_goalie_shutout: soPts,
        unique_draft: uniqueDraft,
        join_code: joinCode,
        prize_pool: prizePool || null,
      })
      .select("id")
      .single();

    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }
    if (data) router.push(`/pools/${data.id}`);
  }

  if (signedIn === false) {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-4">
        <h1 className="font-display text-3xl">CREATE A POOL</h1>
        <p className="text-sm text-muted">
          You need to be signed in to create a pool.
        </p>
        <Link
          href="/signin"
          className="inline-block bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/pools" className="text-xs text-muted hover:text-text">
          ← Back to Pools
        </Link>
        <h1 className="font-display text-3xl mt-2">CREATE A POOL</h1>
        <p className="text-sm text-muted mt-1">
          Pick a template or build a custom pool from scratch.
        </p>
      </div>

      {/* ── Templates ────────────────────────────────────────── */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted mb-2">
          Templates
        </div>
        <Link
          href="/pools/stanley-cup"
          className="block rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4 hover:from-gold/15 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-lg">
                  STANLEY CUP NHL PLAYOFF POOL
                </span>
                <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded tracking-wider">
                  NEW
                </span>
              </div>
              <div className="text-xs text-muted mt-0.5">
                Click your bracket + draft a 20-player playoff roster.
                Bracket bonus + fantasy points.
              </div>
            </div>
            <span className="text-gold text-lg">→</span>
          </div>
        </Link>
        <div className="text-[11px] text-muted mt-2 ml-1">
          Or build a custom pool ↓
        </div>
      </div>

      <form onSubmit={onCreate} className="space-y-5">
        {/* Basics */}
        <Section title="Basics">
          <Field label="Pool name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Rippers Pool"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
              required
            />
          </Field>

          <Field label="Type">
            <Segmented
              value={kind}
              onChange={(v) => setKind(v as PoolKind)}
              options={[
                { value: "private", label: "Private (invite only)" },
                { value: "official", label: "Official (public)" },
              ]}
            />
          </Field>

          <Field label="Duration">
            <Segmented
              value={duration}
              onChange={(v) => setDuration(v as PoolDuration)}
              options={[
                { value: "night", label: "Tonight" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "playoffs", label: "Playoffs" },
                { value: "season", label: "Season" },
              ]}
            />
          </Field>

          <Field label="Max entries">
            <input
              type="number"
              min={0}
              value={maxEntries}
              onChange={(e) => setMaxEntries(Number(e.target.value))}
              className="w-32 bg-bg border border-border rounded-md px-3 py-2 text-sm"
            />
            <span className="text-[11px] text-muted ml-2">
              (0 = unlimited)
            </span>
          </Field>
        </Section>

        {/* Entry / Prize */}
        <Section title="Entry & Prize">
          <Field label="Entry">
            <Segmented
              value={entryModel}
              onChange={(v) => setEntryModel(v as EntryModel)}
              options={[
                { value: "free", label: "Free" },
                { value: "tokens", label: "Pay with 🟡 tokens" },
              ]}
            />
          </Field>

          {entryModel === "tokens" && (
            <Field label="Entry cost (🟡)">
              <input
                type="number"
                min={1}
                value={entryTokens}
                onChange={(e) => setEntryTokens(Number(e.target.value))}
                className="w-32 bg-bg border border-border rounded-md px-3 py-2 text-sm"
              />
            </Field>
          )}

          <Field label="Prize description (free text)">
            <input
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. 60 🟡 winner-take-all"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>
        </Section>

        {/* Roster */}
        <Section title="Roster">
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Forwards" value={forwards} onChange={setForwards} min={1} max={10} />
            <NumberField label="Defense" value={defense} onChange={setDefense} min={0} max={6} />
            <NumberField label="Goalies" value={goalies} onChange={setGoalies} min={0} max={3} />
          </div>
          <p className="text-[11px] text-muted mt-2">
            Roster size: <span className="text-text">{totalRoster}</span> players per team
          </p>

          <Field label="Draft mode">
            <Segmented
              value={uniqueDraft ? "unique" : "independent"}
              onChange={(v) => setUniqueDraft(v === "unique")}
              options={[
                { value: "independent", label: "Independent" },
                { value: "unique", label: "Unique" },
              ]}
            />
          </Field>
        </Section>

        {/* Scoring */}
        <Section title="Scoring">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NumberField label="Goal" value={goalPts} onChange={setGoalPts} min={0} />
            <NumberField label="Assist" value={assistPts} onChange={setAssistPts} min={0} />
            <NumberField label="Goalie Win" value={winPts} onChange={setWinPts} min={0} />
            <NumberField label="Shutout" value={soPts} onChange={setSoPts} min={0} />
          </div>
        </Section>

        {err && (
          <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
            {err}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create pool"}
          </button>
          <Link
            href="/pools"
            className="px-4 py-2 rounded-full border border-border text-sm text-muted hover:text-text"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted mb-1">{label}</div>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-muted mb-1">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
      />
    </label>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-full border text-xs transition ${
              active
                ? "bg-green/10 text-green border-green/40"
                : "bg-bg text-muted border-border hover:text-text"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
