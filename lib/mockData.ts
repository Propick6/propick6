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
  last6: string; // last 6 graded picks, e.g. "5-1"
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
    last6: "6-0",
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
    last6: "5-1",
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
    last6: "4-2",
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
    last6: "3-3",
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
    last6: "1-5",
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

// Extra mock leaders used ONLY by the leaderboard page so pagination has
// enough rows to demo (3 pages of 10). The Feed and other pages still use
// the 5-entry `cappers` array above.
export const extraLeaders: Capper[] = [
  { id: "x1", handle: "ParlayKing", sport: "NBA", record: "26-12", winRate: 68.4, roi: 16.1, last6: "5-1", status: "hot", picksPostedToday: 8, picks: [] },
  { id: "x2", handle: "OverUnderOscar", sport: "NFL", record: "24-13", winRate: 64.9, roi: 12.8, last6: "4-2", status: "hot", picksPostedToday: 6, picks: [] },
  { id: "x3", handle: "PuckLuckPete", sport: "NHL", record: "23-12", winRate: 65.7, roi: 11.4, last6: "5-1", status: "neutral", picksPostedToday: 7, picks: [] },
  { id: "x4", handle: "GridironGuru", sport: "NFL", record: "22-13", winRate: 62.9, roi: 10.2, last6: "4-2", status: "neutral", picksPostedToday: 0, picks: [] },
  { id: "x5", handle: "HoopsHarry", sport: "NBA", record: "21-14", winRate: 60.0, roi: 9.0, last6: "3-3", status: "neutral", picksPostedToday: 6, picks: [] },
  { id: "x6", handle: "BetSlipBetty", sport: "MLB", record: "20-15", winRate: 57.1, roi: 7.5, last6: "4-2", status: "neutral", picksPostedToday: 0, picks: [] },
  { id: "x7", handle: "DimeLineDrew", sport: "MLB", record: "19-15", winRate: 55.9, roi: 6.8, last6: "3-3", status: "neutral", picksPostedToday: 6, picks: [] },
  { id: "x8", handle: "PropPlayPaul", sport: "NBA", record: "18-15", winRate: 54.5, roi: 5.9, last6: "3-3", status: "neutral", picksPostedToday: 0, picks: [] },
  { id: "x9", handle: "SpreadShark", sport: "NFL", record: "17-15", winRate: 53.1, roi: 4.3, last6: "3-3", status: "neutral", picksPostedToday: 6, picks: [] },
  { id: "x10", handle: "MoneylineMo", sport: "NBA", record: "16-15", winRate: 51.6, roi: 3.5, last6: "3-3", status: "neutral", picksPostedToday: 0, picks: [] },
  { id: "x11", handle: "CourtsideKev", sport: "NBA", record: "15-15", winRate: 50.0, roi: 2.4, last6: "2-4", status: "neutral", picksPostedToday: 7, picks: [] },
  { id: "x12", handle: "FaceOffFrank", sport: "NHL", record: "15-16", winRate: 48.4, roi: 1.8, last6: "3-3", status: "neutral", picksPostedToday: 0, picks: [] },
  { id: "x13", handle: "DugoutDave", sport: "MLB", record: "14-16", winRate: 46.7, roi: 0.7, last6: "2-4", status: "neutral", picksPostedToday: 6, picks: [] },
  { id: "x14", handle: "BlitzBilly", sport: "NFL", record: "14-17", winRate: 45.2, roi: -0.6, last6: "2-4", status: "neutral", picksPostedToday: 0, picks: [] },
  { id: "x15", handle: "TipOffTom", sport: "NBA", record: "13-17", winRate: 43.3, roi: -2.1, last6: "2-4", status: "cold", picksPostedToday: 6, picks: [] },
  { id: "x16", handle: "PowerPlayPat", sport: "NHL", record: "13-18", winRate: 41.9, roi: -3.4, last6: "1-5", status: "cold", picksPostedToday: 0, picks: [] },
  { id: "x17", handle: "BullpenBen", sport: "MLB", record: "12-18", winRate: 40.0, roi: -4.2, last6: "2-4", status: "cold", picksPostedToday: 6, picks: [] },
  { id: "x18", handle: "RedZoneRick", sport: "NFL", record: "12-19", winRate: 38.7, roi: -5.5, last6: "1-5", status: "cold", picksPostedToday: 0, picks: [] },
  { id: "x19", handle: "BoxScoreBob", sport: "NBA", record: "11-19", winRate: 36.7, roi: -6.8, last6: "1-5", status: "cold", picksPostedToday: 7, picks: [] },
  { id: "x20", handle: "SlapShotSam", sport: "NHL", record: "11-20", winRate: 35.5, roi: -8.0, last6: "1-5", status: "cold", picksPostedToday: 0, picks: [] },
  { id: "x21", handle: "BrickBobby", sport: "NBA", record: "10-20", winRate: 33.3, roi: -9.2, last6: "0-6", status: "cold", picksPostedToday: 6, picks: [] },
  { id: "x22", handle: "SwingMissSteve", sport: "MLB", record: "10-21", winRate: 32.3, roi: -10.4, last6: "1-5", status: "cold", picksPostedToday: 0, picks: [] },
  { id: "x23", handle: "FumbleFred", sport: "NFL", record: "9-21", winRate: 30.0, roi: -11.5, last6: "0-6", status: "cold", picksPostedToday: 0, picks: [] },
  { id: "x24", handle: "AirballAlex", sport: "NBA", record: "9-22", winRate: 29.0, roi: -13.2, last6: "0-6", status: "cold", picksPostedToday: 0, picks: [] },
  { id: "x25", handle: "OffsidesOlly", sport: "NHL", record: "8-22", winRate: 26.7, roi: -14.8, last6: "0-6", status: "cold", picksPostedToday: 0, picks: [] },
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

export const weeklyLeaders = [...cappers, ...extraLeaders]
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
