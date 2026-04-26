// =========================================================================
// Pro Pick 6 — grade-picks Edge Function
// =========================================================================
// Runs every 15 minutes via pg_cron (see supabase/2026-04-25_pick_grading_cron.sql).
//
// Job: find any pick whose game started 3+ hours ago, ask ESPN for the final
// score, and mark the pick as 'win' / 'loss' / 'push' based on which side won.
//
// Grades only ML (moneyline) picks for now — pick_side ∈ {home, away} is the
// signal we compare to the actual winner. Picks made via free-text matchup
// (no external_game_id) are skipped.
//
// Deployed with verify_jwt = false because pg_cron calls it without an auth
// header. The function is idempotent and only acts on rows in the `pending`
// state, so a malicious external trigger can do at most "grade picks now",
// which is exactly what it's supposed to do anyway.
// =========================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type PendingPick = {
  id: string;
  seller_id: string;
  sport: string;
  external_game_id: string;
  pick_side: "home" | "away" | null;
};

type EspnSummary = {
  header?: {
    competitions?: Array<{
      status?: { type?: { state?: string; completed?: boolean } };
      competitors?: Array<{
        homeAway: "home" | "away";
        score?: string;
        winner?: boolean;
      }>;
    }>;
  };
};

const ESPN_LEAGUES: Record<string, { sport: string; league: string }> = {
  NBA: { sport: "basketball", league: "nba" },
  NFL: { sport: "football", league: "nfl" },
  NHL: { sport: "hockey", league: "nhl" },
  MLB: { sport: "baseball", league: "mlb" },
};

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Pending ML-eligible picks whose game started 3+ hours ago.
  //    Most pro games finish well inside 3 hours; the buffer prevents grading
  //    a game that's still in OT.
  const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  const { data: pending, error } = await supabase
    .from("picks")
    .select("id, seller_id, sport, external_game_id, pick_side")
    .eq("result", "pending")
    .not("external_game_id", "is", null)
    .not("pick_side", "is", null)
    .lt("commences_at", cutoff);

  if (error) {
    return json({ ok: false, error: error.message }, 500);
  }
  const picks = (pending ?? []) as PendingPick[];
  if (picks.length === 0) {
    return json({ ok: true, graded: 0, games_checked: 0, message: "no pending picks ready" });
  }

  // 2. Group picks by (sport, game) so we hit ESPN once per game, not per pick.
  type Group = { sport: string; gameId: string; picks: PendingPick[] };
  const groups = new Map<string, Group>();
  for (const p of picks) {
    const key = `${p.sport}:${p.external_game_id}`;
    let g = groups.get(key);
    if (!g) {
      g = { sport: p.sport, gameId: p.external_game_id, picks: [] };
      groups.set(key, g);
    }
    g.picks.push(p);
  }

  let graded = 0;
  let errors = 0;

  for (const g of groups.values()) {
    const cfg = ESPN_LEAGUES[g.sport];
    if (!cfg) continue;

    let summary: EspnSummary | null = null;
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/summary?event=${g.gameId}`;
      const res = await fetch(url);
      if (!res.ok) {
        errors++;
        continue;
      }
      summary = (await res.json()) as EspnSummary;
    } catch {
      errors++;
      continue;
    }

    const comp = summary?.header?.competitions?.[0];
    const state = comp?.status?.type?.state;
    if (state !== "post" || !comp?.status?.type?.completed) {
      // Not final yet — leave these picks pending; we'll retry next cron tick.
      continue;
    }

    const home = comp.competitors?.find((c) => c.homeAway === "home");
    const away = comp.competitors?.find((c) => c.homeAway === "away");
    if (!home || !away) {
      errors++;
      continue;
    }

    const homeScore = parseInt(home.score ?? "0", 10);
    const awayScore = parseInt(away.score ?? "0", 10);

    // Prefer ESPN's `winner: true` flag (more reliable for OT/shootouts/etc.)
    // and fall back to score comparison.
    let winningSide: "home" | "away" | "push";
    if (home.winner === true && away.winner !== true) winningSide = "home";
    else if (away.winner === true && home.winner !== true) winningSide = "away";
    else if (homeScore > awayScore) winningSide = "home";
    else if (awayScore > homeScore) winningSide = "away";
    else winningSide = "push";

    for (const p of g.picks) {
      const result =
        winningSide === "push"
          ? "push"
          : p.pick_side === winningSide
          ? "win"
          : "loss";

      const { error: updErr } = await supabase
        .from("picks")
        .update({ result })
        .eq("id", p.id)
        .eq("result", "pending"); // belt-and-suspenders: don't double-grade

      if (updErr) errors++;
      else graded++;
    }
  }

  return json({
    ok: true,
    games_checked: groups.size,
    graded,
    errors,
  });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
