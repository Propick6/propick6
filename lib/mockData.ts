// Mock data for the visual prototype.
// This will be replaced with real Supabase queries in a follow-up round.

export type Pick = {
  id: string;
  sport: string;
  type: "Spread" | "ML" | "O/U" | "Prop" | "Parlay" | "Futures";
  matchup: string;
  selection: string;
};

export type Capper = {
  id: string;
  handle: string;
  sport: string;
  record: string; // e.g. "12-4"
  winRate: number; // 0-100
  roi: number; // percentage
  status: "hot" | "cold" | "neutral";
  picksPostedToday: number; // 0-10
  picks: Pick[]; // only meaningful when unlocked in real app
};

export const currentUser = {
  handle: "you",
  unlockTokens: 4,
  earnTokens: 12,
  record: "8-5",
  winRate: 61.5,
  rank: 23,
};

export const cappers: Capper[] = [
  {
    id: "c1",
    handle: "SharpMike",
    sport: "NBA",
    record: "27-11",
    winRate: 71.0,
    roi: 18.4,
    status: "hot",
    picksPostedToday: 8,
    picks: [
      { id: "p1", sport: "NBA", type: "Spread", matchup: "LAL @ BOS", selection: "Celtics -4.5" },
      { id: "p2", sport: "NBA", type: "ML", matchup: "DEN @ PHX", selection: "Nuggets ML" },
      { id: "p3", sport: "NBA", type: "O/U", matchup: "MIA @ NYK", selection: "Over 214.5" },
      { id: "p4", sport: "NBA", type: "Prop", matchup: "Tatum Points", selection: "Over 28.5" },
      { id: "p5", sport: "NBA", type: "Spread", matchup: "GSW @ MEM", selection: "Grizzlies +2.5" },
      { id: "p6", sport: "NBA", type: "ML", matchup: "PHI @ MIL", selection: "Bucks ML" },
      { id: "p7", sport: "NBA", type: "Prop", matchup: "Giannis Reb", selection: "Over 11.5" },
      { id: "p8", sport: "NBA", type: "Parlay", matchup: "3-leg Parlay", selection: "BOS/DEN/BUCKS ML" },
    ],
  },
  {
    id: "c2",
    handle: "NFLNerd",
    sport: "NFL",
    record: "19-9",
    winRate: 67.9,
    roi: 14.2,
    status: "hot",
    picksPostedToday: 6,
    picks: [
      { id: "p1", sport: "NFL", type: "Spread", matchup: "KC @ BUF", selection: "Bills -2.5" },
      { id: "p2", sport: "NFL", type: "O/U", matchup: "DAL @ PHI", selection: "Under 48.5" },
      { id: "p3", sport: "NFL", type: "Prop", matchup: "Mahomes Pass Yds", selection: "Over 285.5" },
      { id: "p4", sport: "NFL", type: "ML", matchup: "BAL @ CIN", selection: "Ravens ML" },
      { id: "p5", sport: "NFL", type: "Spread", matchup: "SF @ SEA", selection: "49ers -5" },
      { id: "p6", sport: "NFL", type: "Prop", matchup: "CMC Rush Yds", selection: "Over 92.5" },
    ],
  },
  {
    id: "c3",
    handle: "PuckProphet",
    sport: "NHL",
    record: "14-7",
    winRate: 66.7,
    roi: 11.0,
    status: "neutral",
    picksPostedToday: 4,
    picks: [],
  },
  {
    id: "c4",
    handle: "DiamondDan",
    sport: "MLB",
    record: "22-18",
    winRate: 55.0,
    roi: 4.2,
    status: "neutral",
    picksPostedToday: 7,
    picks: [
      { id: "p1", sport: "MLB", type: "ML", matchup: "NYY @ BOS", selection: "Yankees ML" },
      { id: "p2", sport: "MLB", type: "O/U", matchup: "LAD @ SD", selection: "Over 8.5" },
      { id: "p3", sport: "MLB", type: "Spread", matchup: "HOU @ TEX", selection: "Astros -1.5" },
      { id: "p4", sport: "MLB", type: "Prop", matchup: "Judge HR", selection: "Yes +220" },
      { id: "p5", sport: "MLB", type: "ML", matchup: "ATL @ NYM", selection: "Braves ML" },
      { id: "p6", sport: "MLB", type: "O/U", matchup: "CHC @ MIL", selection: "Under 7" },
      { id: "p7", sport: "MLB", type: "Parlay", matchup: "3-team ML", selection: "NYY/ATL/HOU" },
    ],
  },
  {
    id: "c5",
    handle: "CoinFlipCarl",
    sport: "NBA",
    record: "9-16",
    winRate: 36.0,
    roi: -12.1,
    status: "cold",
    picksPostedToday: 6,
    picks: [
      { id: "p1", sport: "NBA", type: "Spread", matchup: "SAC @ POR", selection: "Kings -1.5" },
      { id: "p2", sport: "NBA", type: "ML", matchup: "CHA @ ATL", selection: "Hornets ML" },
      { id: "p3", sport: "NBA", type: "O/U", matchup: "ORL @ WAS", selection: "Over 221" },
      { id: "p4", sport: "NBA", type: "Prop", matchup: "LaMelo Ast", selection: "Over 7.5" },
      { id: "p5", sport: "NBA", type: "Spread", matchup: "DET @ IND", selection: "Pistons +8" },
      { id: "p6", sport: "NBA", type: "Parlay", matchup: "4-leg dog parlay", selection: "+1200" },
    ],
  },
];

export const tickerEvents = [
  "SharpMike hit Celtics -4.5 ✅",
  "NFLNerd +11.2 ROI this week 🔥",
  "New capper joined: SharpMike",
  "DiamondDan posted pick #7 of the day",
  "CoinFlipCarl dropped to 36% win rate ❄️",
  "Ad slot just unlocked on the Leaderboard",
  "PuckProphet hidden from feed (4/6 picks)",
];

export const tokenBundles = [
  { tokens: 1, price: 5, label: "Starter" },
  { tokens: 5, price: 25, label: "Most Popular", highlight: true },
  { tokens: 10, price: 50, label: "Pro" },
  { tokens: 20, price: 100, label: "Whale" },
];

export const transactions = [
  { id: "t1", date: "Apr 22", kind: "Bundle purchase", detail: "5 🟡 bundle", amount: "-$25.00" },
  { id: "t2", date: "Apr 22", kind: "Unlock", detail: "SharpMike's card", amount: "-1 🟡" },
  { id: "t3", date: "Apr 21", kind: "Earn token", detail: "Your card unlocked", amount: "+1 🔵" },
  { id: "t4", date: "Apr 21", kind: "Conversion", detail: "5 🔵 → 3 🟡", amount: "+3 🟡" },
  { id: "t5", date: "Apr 20", kind: "Withdrawal", detail: "To bank (Stripe)", amount: "-$9.00" },
];

export const weeklyLeaders = cappers
  .slice()
  .sort((a, b) => b.roi - a.roi)
  .map((c, i) => ({ ...c, rank: i + 1 }));

export const monthlyLeaders = weeklyLeaders;
export const allTimeLeaders = weeklyLeaders;

export const adTiers = [
  {
    id: "top",
    name: "Top Feed Banner",
    price: 499,
    period: "week",
    desc: "Full-width banner on the home Feed — first thing every visitor sees.",
  },
  {
    id: "lb",
    name: "Leaderboard Banner",
    price: 299,
    period: "week",
    desc: "Banner above the leaderboard — high-intent audience.",
  },
  {
    id: "native",
    name: "In-Feed Native Card",
    price: 199,
    period: "week",
    desc: "Sponsored card blended into the capper feed.",
  },
  {
    id: "monthly",
    name: "Monthly Sponsor Package",
    price: 1499,
    period: "month",
    desc: "All 3 placements + your logo on weekly payout emails. Best value.",
    highlight: true,
  },
];
