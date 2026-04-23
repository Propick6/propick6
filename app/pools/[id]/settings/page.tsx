"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  samplePools,
  type EntryModel,
  type PoolDuration,
  type PoolKind,
  type Pool,
} from "@/lib/poolMockData";

export default function PoolSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const existing: Pool =
    samplePools.find((p) => p.id === id) ?? {
      id,
      name: "Your New Pool",
      kind: "private",
      sport: "NHL",
      ownerHandle: "you",
      entryModel: "free",
      entryTokens: 0,
      duration: "playoffs",
      startsOn: "—",
      endsOn: "—",
      maxEntries: 20,
      currentEntries: 0,
      roster: { forwards: 6, defense: 3, goalies: 1 },
      scoring: { goal: 2, assist: 1, pim: 0, goalieWin: 2, goalieShutout: 3 },
      uniqueDraft: false,
      prizePool: "",
      joinCode: id.slice(-6).toUpperCase(),
    };

  // Basic
  const [name, setName] = useState(existing.name);
  const [kind, setKind] = useState<PoolKind>(existing.kind);
  const [duration, setDuration] = useState<PoolDuration>(existing.duration);
  const [maxEntries, setMaxEntries] = useState<number>(existing.maxEntries);

  // Entry
  const [entryModel, setEntryModel] = useState<EntryModel>(existing.entryModel);
  const [entryTokens, setEntryTokens] = useState<number>(existing.entryTokens);

  // Roster
  const [forwards, setForwards] = useState(existing.roster.forwards);
  const [defense, setDefense] = useState(existing.roster.defense);
  const [goalies, setGoalies] = useState(existing.roster.goalies);

  // Scoring
  const [goalPts, setGoalPts] = useState(existing.scoring.goal);
  const [assistPts, setAssistPts] = useState(existing.scoring.assist);
  const [pimPts, setPimPts] = useState(existing.scoring.pim);
  const [winPts, setWinPts] = useState(existing.scoring.goalieWin);
  const [soPts, setSoPts] = useState(existing.scoring.goalieShutout);

  // Draft / prize
  const [uniqueDraft, setUniqueDraft] = useState(existing.uniqueDraft);
  const [prizePool, setPrizePool] = useState(existing.prizePool ?? "");

  const [saved, setSaved] = useState(false);

  const hasEntries = existing.currentEntries > 0;

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    // Foundation round: no backend yet — flip UI state.
    // Next round: PATCH /pools/:id via Supabase.
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function onDelete() {
    if (!confirm("Delete this pool? This can't be undone.")) return;
    router.push("/pools");
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/pools/${id}`} className="text-xs text-muted hover:text-text">
          ← Back to pool
        </Link>
        <div className="flex items-baseline gap-3 mt-2 flex-wrap">
          <h1 className="font-display text-3xl">POOL SETTINGS</h1>
          <span className="text-sm text-muted">{existing.name}</span>
        </div>
        <p className="text-sm text-muted mt-1">
          Owner-only. Auth will enforce this once Supabase is wired.
        </p>
      </div>

      {hasEntries && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm">
          <span className="text-gold font-semibold">Heads up:</span>{" "}
          {existing.currentEntries} team(s) have already joined. Changing
          scoring or roster now will affect their scores. Locking these fields
          post-start will be automatic in a future round.
        </div>
      )}

      <form onSubmit={onSave} className="space-y-5">
        {/* Basics */}
        <Section title="Basics">
          <Field label="Pool name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <span className="text-[11px] text-muted ml-2">(0 = unlimited)</span>
          </Field>
        </Section>

        {/* Entry + prize */}
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
            Roster size:{" "}
            <span className="text-text">{forwards + defense + goalies}</span>{" "}
            players per team
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <NumberField label="Goal" value={goalPts} onChange={setGoalPts} min={0} />
            <NumberField label="Assist" value={assistPts} onChange={setAssistPts} min={0} />
            <NumberField label="PIM" value={pimPts} onChange={setPimPts} min={0} />
            <NumberField label="Goalie Win" value={winPts} onChange={setWinPts} min={0} />
            <NumberField label="Shutout" value={soPts} onChange={setSoPts} min={0} />
          </div>
        </Section>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="submit"
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow"
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
          <Link
            href={`/pools/${id}`}
            className="px-4 py-2 rounded-full border border-border text-sm text-muted hover:text-text"
          >
            Cancel
          </Link>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 rounded-full border border-hot/40 text-sm text-hot hover:bg-hot/10"
          >
            Delete pool
          </button>
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
