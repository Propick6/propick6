# Pro Pick 6 — Project Context File
*Last updated: April 25, 2026 (Token rename, leaderboard wireframe + sport filter, PWA install, Follow feature, +Pick wired to DB with ESPN game picker)*

---

## What We're Building
A sports picks marketplace called **Pro Pick 6** where cappers (sellers) post daily pick cards, buyers unlock them using tokens, and a leaderboard tracks who's hot and cold.

---

## App Name & Branding
- **Name:** Pro Pick 6
- **Logo style:** "PRO" small above "PICK 6" — the 6 is highlighted in green
- **Color scheme:** Dark background (#07090D), green accent (#00E676), gold for unlock tokens (#FFD700), blue for redeem tokens (#00C2FF). A third token color is planned: green 🟢 for the upcoming Free Tokens (matches brand accent).
- **Fonts:** Bebas Neue (display/headings) + DM Sans (body)
- **Promo code for ad banner:** PROPICK6

---

## Core Rules
- Sellers must post a **minimum of 6 picks per day** to appear in the feed (max 10)
- Sellers with fewer than 6 picks are **hidden from the feed** that day — no penalty, no warning
- **$5 (1 Unlock Token)** unlocks ALL of a seller's picks for that day
- Picks **expire at midnight** — no back-catalogue, today only
- Buyers see picks roll in throughout the day as the seller posts them
- **Leaderboard:** Weekly / Monthly / All-Time with hot and cold badges

---

## Token Economy

### Unlock Tokens (yellow)
- Cost: **$5 each** (purchased with real money via Stripe)
- Purpose: Spend 1 to unlock a capper's full day card
- Never expire
- Bundle sizes available: 1/$5, 5/$25 (most popular), 10/$50, 20/$100

### Redeem Tokens (blue) — formerly "Earn Tokens", renamed 2026-04-25
- Value: **$3 cash each**
- How earned: Sellers receive 1 Redeem Token every time someone unlocks their day card
- Never expire
- Two options for sellers:
  1. Cash out at $3 per token via Stripe (anytime, no minimum)
  2. Convert to Unlock Tokens — only in increments of 5

### Conversion Rate (Redeem → Unlock)
- **5 Redeem Tokens → 3 Unlock Tokens** (even $15-for-$15 exchange, $0 rake on conversion)
- Steps: 10 → 6, 15 → 9, 20 → 12, etc.
- Only moves in steps of 5 — no partial conversions

### Free Tokens (green) — designed 2026-04-25, NOT YET BUILT
- Value: **$0** (non-monetized, can't be purchased, can't be redeemed for cash)
- How earned: Visit `/consensus`, watch a sponsored ad, vote on at least 1 game on today's slate. Daily cap: 1 free token per user per day.
- Usage: Same as Unlock Tokens — spend 1 to unlock a capper's full day card
- **Expires at midnight daily** (unused = lost). This is the only token type that expires.
- Purpose: Drives daily engagement, ad views, and consensus-poll participation. Lets new/free users sample the marketplace without paying.
- Full spec lives in the auto-memory `project_consensus_picks.md`; build is queued under TODO.md → Up Next.

### Platform Rake
- **$2 per unlock** (buyer pays $5, seller gets $3 token, platform keeps $2)
- Stripe processing fee (~2.9%) comes out of the platform's $2
- $0 rake on token conversions
- Natural rake on cash withdrawals comes from the $2/unlock already taken

---

## Money Flow Per Transaction
```
Buyer spends:     1 Unlock Token   = $5.00
Seller receives:  1 Redeem Token   = $3.00 cash value
Platform keeps:   $2.00 rake
Stripe fee:       ~$0.15 (from platform's cut)
Platform nets:    ~$1.85 per unlock
```

---

## Project Accounts (Separate from any other accounts the owner has)

| Service | Account / Handle | Notes |
|---|---|---|
| GitHub | **Propick6** | Email: michaeltrichilo89@gmail.com. Repo: github.com/Propick6/propick6 |
| Vercel | personal (Propick6, tied to GitHub) | Live at propick6.vercel.app |
| Supabase | **Propick6's Org** / **Propick6's Project** | Project ID: `uwisbvqmrosygwdawomd`, region: ca-central-1 (Canada Central), Free NANO tier, status Healthy. Database password saved. |
| Stripe | Canadian account | In Test Mode (not activated for real money yet) |

**These are fully separate accounts from any other identities the owner uses** (different emails, different orgs, different billing). Intentional isolation of Pro Pick 6 from anything else.

**Consequence for Claude automation:** Claude's MCP connectors (Vercel + Supabase) are authorized against a *different* set of accounts, so Claude cannot directly push migrations, fetch API keys, or read build logs for the Pro Pick 6 accounts. All Phase 2+ work that touches the Supabase or Vercel dashboards is **generate-and-paste** — Claude produces SQL/code/env var values, and they get pasted into the Propick6 dashboards manually. Not a blocker, just a workflow note.

---

## Build Status (As of 2026-04-25)

### Phase 1 — Visual prototype deployed ✅
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- 6 pages working on mock data: Feed, Leaderboard, +Pick, Wallet, My Stats, Advertise
- Nav bar with always-visible token pills (🟡 and 🔵)
- Brand styling complete — dark + green + gold + blue, Bebas Neue + DM Sans
- Supabase SQL schema drafted in `supabase/schema.sql`
- Pushed to `github.com/Propick6/propick6`
- Deployed live at `propick6.vercel.app`
- Git installed locally; `git push` auto-deploys going forward

### Phase 1.5 — Pools module foundation ✅
- New NHL fantasy pools module plugged alongside the picks marketplace
- 6 pages: `/pools` (list), `/pools/create`, `/pools/[id]` (detail + leaderboard), `/pools/[id]/team` (roster builder), `/pools/[id]/rules`, `/pools/[id]/settings`
- Pool config: name, private/official, free vs 🟡 entry, duration, max entries, roster shape (F/D/G), scoring rules, draft mode (open vs unique)
- NHL player list seeded with 52 real stars (`supabase/seed_nhl_players.sql`)
- Pools nav tab added
- Rules page includes worked scoring example (shows exactly how green fantasy-point totals are calculated)
- All pool pages remain visual-first — details, rules, settings, team builder still on mock data until Phase 2.5 wires them

### Phase 2 — Supabase wired ✅ (partial)
- `supabase/schema.sql` applied in Supabase SQL Editor (creates `profiles`, `picks`, `unlocks`, `transactions`, `advertisers` + RLS + `handle_new_user` trigger that auto-creates a profile on sign-up)
- `supabase/pools_schema.sql` applied (creates `nhl_players`, `pools`, `pool_entries`, `pool_entry_players`, `pool_payouts` + `pool_leaderboard` view + RLS)
- `supabase/seed_nhl_players.sql` applied (52 players)
- Supabase URL Configuration set — site URL + redirect URLs for localhost + production
- `@supabase/supabase-js` + `@supabase/ssr` installed
- Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts`, root `middleware.ts` refreshes session on every request
- Magic-link sign-in live: `/signin` + `/auth/callback` + `/auth/signout`
- Nav shows real handle + real token balances when signed in, Sign in button when not
- `/pools` list reads from DB (join on profiles for owner handle + count on pool_entries)
- `/pools/create` inserts new pool with `auth.uid()` as owner
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (local). Need to add to Vercel for production.

### Phase 2.5 — Auth expansion + profiles + Feed ✅ (partial)
- Email+password sign-up/sign-in/forgot-password/reset-password all live. Google OAuth code in place, awaiting Google Cloud setup (button hidden via `NEXT_PUBLIC_GOOGLE_ENABLED` env flag).
- `/account` page — handle editor, display name, sign-out. Nav handle button now opens account instead of signing out.
- 10 demo capper accounts seeded + 50+ demo picks on evergreen relative dates. Accounts have password `demopass123` so you can sign in AS them for testing.
- Public profile pages at `/u/[handle]` — stats header, Track Record of resolved picks, pools hosted, Active Today CTA banner linking to Feed. Pending picks NOT shown on profile (gated to Feed to preserve the unlock monetization).
- Home Feed reads live data: cappers with 6+ picks today show up, sorted by ROI. Ticker + stats + sponsor banner preserved. Unlock button still local-state (persistence pending).
- Leaderboard handles + pool owner/entry handles link to `/u/[handle]`.
- Report-user flow: `reports` table with RLS + Report modal on profile. Reports write to DB. **Admin review page + email notifications still TODO.**
- Supabase MCP now authorized for Propick6 — SQL/migrations/seeds run directly from Claude.

### Phase 2.9 — Capper search ✅ (2026-04-25)
- New `components/SearchModal.tsx` — full-overlay modal with debounced (250ms) Supabase autocomplete: `profiles.handle ilike 'X%' order by handle asc limit 10`. ilike metachars (%, _, \\) sanitized from user input. Click result → `/u/[handle]`. Esc closes.
- `components/Nav.tsx` got a 🔍 button next to the token chips that opens the modal. Visible regardless of auth state — anyone can search.

### Phase 2.8 — +Pick wired end-to-end ✅ (2026-04-25)
- New `lib/espnGames.ts` — fetches today + next 4 days of games for NBA / NFL / NHL / MLB from ESPN's free public scoreboard API (`site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard`). No API key, CORS-friendly. Parallel fetches across the 5 days; graceful fallback to empty array on any failure so the form still works manually.
- `/pick` page rewritten:
  - Auth-gated — signed-out users see a sign-in CTA instead of the form.
  - Today's pick count read live from the `picks` table (was hardcoded `submitted=2`).
  - "Sport" relabeled "League." For NBA/NFL/NHL/MLB the form now shows a clickable list of upcoming games grouped by Today / Tomorrow / day-of-week. Tapping a game auto-fills the matchup field; finished games are disabled; live games are flagged.
  - Other sports (NCAAF/NCAAB/UFC/Soccer) keep the manual matchup text input — no game picker.
  - Post Pick now actually inserts into the `picks` table with the signed-in user as `seller_id`. RLS on `picks` enforces this server-side.
  - Success toast + error surface inline; submit button shows "Posting…" during the round-trip; counter increments on success.

### Phase 2.7 — Follow feature ✅ (2026-04-25)
- New `follows` table (PK `follower_id, followed_id`, cascade-delete on auth.users, no_self_follow CHECK constraint). Migration: `supabase/2026-04-25_follows.sql`.
- New denormalized `profiles.follower_count` int column kept in sync by an `after insert/delete` trigger on `follows` — gives O(1) public counts without exposing the follower list.
- Privacy: RLS on `follows` lets a user SELECT/INSERT/DELETE only rows where they are the follower. Nobody else can enumerate who follows whom; only the count is public via `profiles.follower_count`.
- `/u/[handle]` page: real Follow / Following toggle (was a stub alert), follower count under the joined-date row, optimistic UI with rollback on error, signed-out users bounce to `/signin?next=/u/<handle>`.
- Home Feed: new "All / Following" tab pill above today's lineup. Following mode filters cappers to those the user follows. Empty states handle (1) signed-out, (2) following nobody, (3) following somebody but none of them met today's 6-pick threshold.

### Phase 2.6 — UX polish + Stanley Cup pool + PWA install ✅ (2026-04-24 → 2026-04-25)
- **Stanley Cup Playoff Pool prototype** at `/pools/stanley-cup` — clickable bracket (auto-advance + games-per-series picker 4/5/6/7) + 20-player roster from all 16 actual 2026 playoff teams (~352 mock players). Bracket-bonus + player-points scoring legend. Local state only — DB persistence + per-pool brackets are next.
- **Leaderboard wireframe redesign** — columns now Place / User (with hot/cold emoji) / Record / Win% / Last 6 / Picks (eyeball icon link to `/u/[handle]` when capper has 6+ picks today). ROI dropped from view (still on type for future use). Pagination at 10/page (Page 1/2/3/Next/Last). Mock data padded with 25 extra leaders so 3 pages render convincingly.
- **Leaderboard sport filter** — pill row below Weekly/Monthly/All-Time: All / NBA / NFL / NHL / MLB. Strict purity rule (Capper.pureSport === filter or filter === ALL). 5 of the 25 padded mock leaders marked mixed-sport so the filter visibly trims the list. Switching filter re-ranks visible places + resets pagination.
- **Token rename pass** — UI labels updated everywhere: 🟡 "Unlock Balance" → "Unlock Tokens", 🔵 "Earn Balance" → "Redeem Tokens", "Earn Token" → "Redeem Token" in body copy across wallet/stats/pick/transactions. Mock data field `currentUser.earnTokens` → `redeemTokens`. Nav chips got hover titles. **DB column `earn_tokens` intentionally unchanged** — UI labels it "Redeem" but the column name is unchanged for safety; migration is queued as its own one-shot round.
- **PWA install support** — `app/icon.tsx` (192) + `app/apple-icon.tsx` (180) generate PNGs at build via `ImageResponse` (no static image files committed). `app/manifest.ts` declares the app installable with brand colors (#07090D bg / #00E676 theme). `layout.tsx` wired with `appleWebApp` metadata + `viewport.themeColor`. Tapping "Add to Home Screen" on iPhone or Galaxy now installs full-screen with a custom P6 icon.

### Phase 2.5 continued — still pending
- `/pools/[id]` detail page — read real pool + live leaderboard via `pool_leaderboard` view
- `/pools/[id]/rules` — read real pool scoring config
- `/pools/[id]/settings` — owner-only update (RLS already enforces; UI needs owner-check)
- `/pools/[id]/team` — write picks to `pool_entries` + `pool_entry_players`
- Unlock mechanic — persist to `unlocks` table, deduct `unlock_tokens`, credit `earn_tokens`. Core money loop.
- ~~+Pick page — wire the form to INSERT into `picks` so real users can actually post picks~~ ✅ shipped 2026-04-25 with ESPN game picker
- Admin reports review page — gated by `is_admin` on profiles
- Leaderboard + My Stats + Wallet pages — still on mock data
- **Consensus Picks page (`/consensus`) + 🟢 Free Token** — designed 2026-04-25, full spec in auto-memory. Build TBD.
- **DB column rename** `earn_tokens` → `redeem_tokens` — paired migration + Nav.tsx + schema.sql + trigger update. Low risk if done in isolation.
- **Per-pool bracket prediction** at `/pools/[id]/bracket` — currently `/pools/stanley-cup` is a global placeholder; needs to scope brackets per pool

### Phase 3 — Wire Stripe (test mode)
- Install `stripe` + `@stripe/stripe-js`
- Checkout Session for token bundle purchases
- Webhook to credit unlock tokens after `checkout.session.completed`
- Stripe Connect Express for seller payouts (cash-out earn tokens)
- Add env vars to Vercel: `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Phase 4 — Polish + launch prep
- Real leaderboard computed from `picks` + `unlocks`
- Pool payouts automation — settle pools via `pool_payouts`
- NHL stats API sync — nightly job to refresh `nhl_players`
- Advertiser self-service signup flow
- Admin page for rake accounting
- Age gate (19+) for Ontario compliance
- Terms + Privacy pages
- Move Stripe out of Test Mode (activate account, provide banking)

---

## Tech Stack

| Layer | Tool | Plan |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | Free |
| Styling | Tailwind CSS | Free |
| Database + Auth | Supabase | Free tier |
| Payments + Payouts | Stripe | Free setup, 2.9% + $0.30 per txn |
| Hosting | Vercel | Free tier |
| Code repo | GitHub | Free |

---

## Key Design Decisions (Locked In)
- Picks expire at midnight (no back-catalogue)
- Sellers hidden (not penalized) if under 6 picks
- Buyers see picks added in real time throughout the day after unlocking
- Unlock + Redeem tokens never expire; Free Tokens DO expire daily (only token type that does)
- Conversion only in increments of 5 redeem → 3 unlock
- Monthly cash payouts replaced entirely by token system — sellers cash out on their own schedule
- Three token types planned: 🟡 Unlock (paid), 🔵 Redeem (sellers earn, cash out), 🟢 Free (engagement-earned, daily expiry)
- Leaderboard sport filter uses **strict purity rule**: a capper appears under a sport bucket (NBA/NFL/NHL/MLB) only if 100% of their picks are that sport. Mixed-sport cappers appear under "All" only.
- Propick6 accounts fully separate from any other owner-held accounts

---

## Local File Layout

```
Mikes Pro Picks/
├── ProPick6_Context.md         ← legacy copy in workspace root (can be deleted)
├── TODO.md                     ← running project TODO (workspace-level, not in repo)
└── propick6/                   ← the Next.js app (also at github.com/Propick6/propick6)
    ├── CONTEXT.md              ← this file (version-controlled with the code)
    ├── README.md
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── middleware.ts           ← Supabase session refresh on every request
    ├── .gitignore
    ├── .env.local.example      ← template; real .env.local is gitignored
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx              ← metadata + viewport (PWA theme color, appleWebApp)
    │   ├── icon.tsx                ← 192x192 PWA + favicon icon, generated at build via ImageResponse
    │   ├── apple-icon.tsx          ← 180x180 iOS home-screen icon, also via ImageResponse
    │   ├── manifest.ts             ← PWA manifest (Android install)
    │   ├── page.tsx                (Feed — wired to Supabase)
    │   ├── leaderboard/page.tsx    ← wireframe redesign + sport filter + pagination (mock data)
    │   ├── pick/page.tsx
    │   ├── wallet/page.tsx
    │   ├── stats/page.tsx
    │   ├── advertise/page.tsx
    │   ├── account/page.tsx        ← handle editor, display name, sign-out
    │   ├── u/[handle]/page.tsx     ← public profile (Supabase-wired)
    │   ├── signin/page.tsx         ← magic-link + email/password tabs
    │   ├── forgot/page.tsx         ← forgot-password
    │   ├── reset-password/page.tsx ← reset-password
    │   ├── auth/
    │   │   ├── callback/route.ts   ← exchanges magic-link code for session
    │   │   └── signout/route.ts
    │   └── pools/
    │       ├── page.tsx            (Pools list — reads from Supabase)
    │       ├── create/page.tsx     (Create pool — writes to Supabase)
    │       ├── stanley-cup/page.tsx (Stanley Cup bracket prototype — local state)
    │       └── [id]/
    │           ├── page.tsx        (Pool detail — mock data for now)
    │           ├── team/page.tsx   (Team builder — mock data for now)
    │           ├── rules/page.tsx  (Rules + scoring breakdown — mock data for now)
    │           └── settings/page.tsx (Edit pool — mock data for now)
    ├── components/Nav.tsx      ← reads auth state + profile for token pills (with hover-title labels)
    ├── lib/
    │   ├── mockData.ts         (picks marketplace mock data — incl. extraLeaders for leaderboard pagination demo)
    │   ├── poolMockData.ts     (NHL players + pool types + helpers)
    │   ├── espnGames.ts        (ESPN scoreboard fetcher — NBA/NFL/NHL/MLB upcoming games for the +Pick form)
    │   └── supabase/
    │       ├── client.ts       (browser client)
    │       ├── server.ts       (server components + route handlers)
    │       └── middleware.ts   (session-refresh helper)
    └── supabase/
        ├── schema.sql                              ← base: profiles/picks/unlocks/transactions/advertisers + trigger
        ├── pools_schema.sql                        ← pools module tables + RLS + leaderboard view
        ├── seed_nhl_players.sql                    ← 52 NHL players
        ├── 2026-04-24_pools_has_bracket.sql        ← migration: pools.has_bracket flag
        ├── 2026-04-25_follows.sql                  ← migration: follows table + RLS + profiles.follower_count + trigger
        └── (other seed files: demo cappers, demo picks, etc.)
```

---

## Next Step When Resuming
1. Pick one meaningful next item (priority order roughly tracks TODO.md → Up Next):
   - **Consensus Picks page (`/consensus`) + 🟢 Free Token** — high-impact engagement loop. Full spec already locked in (auto-memory `project_consensus_picks.md`). Build path: new nav item → ad gate → game vote UI → poll reveal → earn 1 free token (daily cap, midnight expiry). DB additions: `free_tokens` int + `free_tokens_expires_at` timestamp on profiles, plus a `consensus_votes` table.
   - **DB column rename** `earn_tokens` → `redeem_tokens` — finishes the 2026-04-25 UI rename. Touches schema.sql + Nav.tsx Profile type + auto-create trigger. One-shot, low risk if isolated.
   - **Wire Unlock to persist** — the core money loop. `unlocks` table insert + `profiles.unlock_tokens` / `earn_tokens` updates. After this the whole token economy is real.
   - **Finish wiring pool pages** (`/pools/[id]`, team builder, rules, settings) so pools are fully functional end-to-end.
   - **Per-pool bracket** at `/pools/[id]/bracket` — `/pools/stanley-cup` is currently global; needs per-pool scoping.
   - **Admin reports page** — Nick needs a way to see reports inside the app, not just in Supabase Table Editor.
   - **TOTP 2FA** + **Google Cloud OAuth setup** — auth round-out items.
2. Running list of queued work: see `Mikes Pro Picks/TODO.md` in the workspace (workspace-level, not in repo).
3. Supabase MCP is now wired to Propick6 — SQL/seeds/migrations can run directly from chat. Vercel is still generate-and-paste (env vars, redeploys).
4. App is now installable as a PWA on iPhone (Safari → Share → Add to Home Screen) and Galaxy/Android (Chrome → three-dot → Install app). Custom P6 icon, full-screen launch.
