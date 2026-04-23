import { currentUser } from "@/lib/mockData";

export default function StatsPage() {
  // Mock monthly earnings
  const unlocks = 42;
  const earnTokensAwarded = 42;
  const cashWithdrawn = 90;
  const conversions = 15; // earn tokens converted
  const grossRake = unlocks * 2;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">MY STATS</h1>

      {/* Profile top card */}
      <div className="rounded-xl border border-border bg-panel p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-2xl">
          Y
        </div>
        <div className="flex-1">
          <div className="font-display text-2xl">@{currentUser.handle}</div>
          <div className="text-sm text-muted">
            Rank #{currentUser.rank} · Record {currentUser.record} ·{" "}
            {currentUser.winRate.toFixed(1)}% win rate
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Record" value={currentUser.record} />
        <Kpi label="Win Rate" value={`${currentUser.winRate.toFixed(1)}%`} accent />
        <Kpi label="Rank" value={`#${currentUser.rank}`} />
        <Kpi label="Earn 🔵" value={currentUser.earnTokens.toString()} />
      </div>

      {/* Monthly earnings breakdown */}
      <section className="rounded-xl border border-border bg-panel p-4">
        <h2 className="font-display text-xl mb-3">APRIL EARNINGS</h2>
        <Row k="Cards unlocked by buyers" v={`${unlocks}`} />
        <Row k="🔵 Earn Tokens awarded" v={`${earnTokensAwarded} (${earnTokensAwarded * 3} cash value)`} />
        <Row k="Cash withdrawn via Stripe" v={`$${cashWithdrawn}.00`} />
        <Row k="Converted 🔵 → 🟡" v={`${conversions} 🔵`} />
        <Row
          k="Remaining 🔵 balance"
          v={`${currentUser.earnTokens} 🔵 ($${currentUser.earnTokens * 3})`}
        />
        <div className="border-t border-border my-3" />
        <Row
          k="Platform rake on your unlocks (info)"
          v={`$${grossRake}.00 (Pro Pick 6's cut)`}
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
