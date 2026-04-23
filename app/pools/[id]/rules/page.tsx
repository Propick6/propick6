"use client";

import Link from "next/link";
import {
  samplePools,
  nhlPlayers,
  scorePlayer,
  durationLabel,
  rosterSizeTotal,
  type Pool,
} from "@/lib/poolMockData";

export default function PoolRulesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const pool: Pool =
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
      maxEntries: 0,
      currentEntries: 0,
      roster: { forwards: 6, defense: 3, goalies: 1 },
      scoring: { goal: 2, assist: 1, pim: 0, goalieWin: 2, goalieShutout: 3 },
      uniqueDraft: false,
      prizePool: "TBD",
    };

  // Pick McDavid (if in dataset) as the worked example so users see exactly
  // how the green points total gets computed.
  const example =
    nhlPlayers.find((p) => p.name === "McDavid") ?? nhlPlayers[0];

  const exampleTotal = scorePlayer(example, pool.scoring);

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/pools/${id}`} className="text-xs text-muted hover:text-text">
          ← Back to pool
        </Link>
        <div className="flex items-baseline gap-3 mt-2 flex-wrap">
          <h1 className="font-display text-3xl">RULES & SCORING</h1>
          <span className="text-sm text-muted">{pool.name}</span>
        </div>
      </div>

      {/* Scoring breakdown */}
      <Section title="Scoring">
        <p className="text-sm text-muted">
          Every player on your roster earns points for you based on their
          real-world stats. Add them all up and that&apos;s your team&apos;s
          score on the leaderboard.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <ScoreTile label="Goal" value={pool.scoring.goal} />
          <ScoreTile label="Assist" value={pool.scoring.assist} />
          <ScoreTile label="Goalie Win" value={pool.scoring.goalieWin} />
          <ScoreTile label="Shutout" value={pool.scoring.goalieShutout} />
        </div>
        {pool.scoring.pim > 0 && (
          <div className="text-xs text-muted mt-2">
            + {pool.scoring.pim} per penalty minute
          </div>
        )}

        {/* Worked example */}
        <div className="mt-5 rounded-xl border border-green/30 bg-green/5 p-4">
          <div className="text-[11px] uppercase tracking-wider text-green">
            Worked Example
          </div>
          <div className="font-semibold mt-1">
            {example.name}{" "}
            <span className="text-muted font-normal">
              ({example.team}, {example.position})
            </span>
          </div>
          <div className="text-sm text-muted mt-2 space-y-1">
            {example.position === "G" ? (
              <>
                <div>
                  {example.wins} wins × {pool.scoring.goalieWin} ={" "}
                  <span className="text-text">
                    {example.wins * pool.scoring.goalieWin}
                  </span>
                </div>
                <div>
                  {example.shutouts} shutouts × {pool.scoring.goalieShutout} ={" "}
                  <span className="text-text">
                    {example.shutouts * pool.scoring.goalieShutout}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  {example.goals} goals × {pool.scoring.goal} ={" "}
                  <span className="text-text">
                    {example.goals * pool.scoring.goal}
                  </span>
                </div>
                <div>
                  {example.assists} assists × {pool.scoring.assist} ={" "}
                  <span className="text-text">
                    {example.assists * pool.scoring.assist}
                  </span>
                </div>
                {pool.scoring.pim > 0 && (
                  <div>
                    {example.pim} PIM × {pool.scoring.pim} ={" "}
                    <span className="text-text">
                      {example.pim * pool.scoring.pim}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-green/20 flex items-baseline justify-between">
            <div className="text-sm text-muted">Total fantasy points</div>
            <div className="font-display text-3xl text-green">
              {exampleTotal}
            </div>
          </div>
        </div>
      </Section>

      {/* Roster rules */}
      <Section title="Roster">
        <p className="text-sm text-muted">
          Each team must fill exactly{" "}
          <span className="text-text">{rosterSizeTotal(pool.roster)}</span>{" "}
          roster spots.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <RosterTile label="Forwards" value={pool.roster.forwards} />
          <RosterTile label="Defense" value={pool.roster.defense} />
          <RosterTile label="Goalies" value={pool.roster.goalies} />
        </div>
        <div className="mt-4 text-sm text-muted">
          <span className="text-text font-semibold">Draft mode: </span>
          {pool.uniqueDraft ? (
            <>
              <span className="text-gold">Unique</span> — once a player is
              drafted to a team, no other team in this pool can pick them.
              Draft order applies.
            </>
          ) : (
            <>
              <span className="text-green">Open</span> — every team picks
              independently. The same player can be on multiple teams.
            </>
          )}
        </div>
      </Section>

      {/* Duration / entry / prize */}
      <Section title="Schedule & Prize">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Meta label="Duration" value={durationLabel(pool.duration)} />
          <Meta label="Starts" value={pool.startsOn} />
          <Meta label="Ends" value={pool.endsOn} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Meta
            label="Entry"
            value={
              pool.entryModel === "free" ? "Free" : `🟡 ${pool.entryTokens}`
            }
          />
          <Meta
            label="Max entries"
            value={pool.maxEntries > 0 ? pool.maxEntries.toString() : "Unlimited"}
          />
        </div>
        {pool.prizePool && (
          <div className="mt-4 rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4">
            <div className="text-[11px] uppercase tracking-wider text-gold">
              Prize Pool
            </div>
            <div className="font-display text-xl mt-0.5">{pool.prizePool}</div>
          </div>
        )}
      </Section>

      <div className="flex items-center gap-2">
        <Link
          href={`/pools/${id}`}
          className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow"
        >
          Back to pool
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="font-display text-2xl mt-0.5 text-green">+{value}</div>
    </div>
  );
}

function RosterTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="font-display text-2xl mt-0.5">{value}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="font-semibold mt-0.5">{value}</div>
    </div>
  );
}
