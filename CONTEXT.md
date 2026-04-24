# Pro Pick 6 — Project Context File
*Last updated: April 24, 2026 (Feed + profiles live, Report flow shipped)*

---

## What We're Building
A sports picks marketplace called **Pro Pick 6** where cappers (sellers) post daily pick cards, buyers unlock them using tokens, and a leaderboard tracks who's hot and cold.

---

## App Name & Branding
- **Name:** Pro Pick 6
- **Logo style:** "PRO" small above "PICK 6" — the 6 is highlighted in green
- **Color scheme:** Dark background (#07090D), green accent (#00E676), gold for unlock tokens (#FFD700), blue for earn tokens (#00C2FF)
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

### Earn Tokens (blue)
- Value: **$3 cash each**
- How earned: Sellers receive 1 Earn Token every time someone unlocks their day card
- Never expire
- Two options for sellers:
  1. Cash out at $3 per token via Stripe (anytime, no minimum)
  2. Convert to Unlock Tokens — only in increments of 5

### Conversion Rate (Earn → Unlock)
- **5 Earn Tokens → 3 Unlock Tokens** (even $15-for-$15 exchange, $0 rake on conversion)
- Steps: 10 → 6, 15 → 9, 20 → 12, etc.
- Only moves in steps of 5 — no partial conversions

### Platform Rake
- **$2 per unlock** (buyer pays $5, seller gets $3 token, platform keeps $2)
- Stripe processing fee (~2.9%) comes out of the platform's $2
- $0 rake on token conversions
- Natural rake on cash withdrawals comes from the $2/unlock already taken

---

## Money Flow Per Transaction
```
Buyer spends:     1 Unlock Token   = $5.00
Seller receives:  1 Earn Token     = $3.00 cash value
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

## Build Status (As of 2026-04-23 evening)

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

### Phase 2.5 continued — still pending
- `/pools/[id]` detail page — read real pool + live leaderboard via `pool_leaderboard` view
- `/pools/[id]/rules` — read real pool scoring config
- `/pools/[id]/settings` — owner-only update (RLS already enforces; UI needs owner-check)
- `/pools/[id]/team` — write picks to `pool_entries` + `pool_entry_players`
- Unlock mechanic — persist to `unlocks` table, deduct `unlock_tokens`, credit `earn_tokens`. Core money loop.
- +Pick page — wire the form to INSERT into `picks` so real users can actually post picks
- Admin reports review page — gated by `is_admin` on profiles
- Leaderboard + My Stats + Wallet pages — still on mock data

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
- Tokens never expire
- Conversion only in increments of 5 earn → 3 unlock
- Monthly cash payouts replaced entirely by token system — sellers cash out on their own schedule
- Two separate token types to keep dollar values clean and separate
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
    │   ├── layout.tsx
    │   ├── page.tsx                (Feed)
    │   ├── leaderboard/page.tsx
    │   ├── pick/page.tsx
    │   ├── wallet/page.tsx
    │   ├── stats/page.tsx
    │   ├── advertise/page.tsx
    │   ├── signin/page.tsx         ← magic-link sign-in
    │   ├── auth/
    │   │   ├── callback/route.ts   ← exchanges magic-link code for session
    │   │   └── signout/route.ts
    │   └── pools/
    │       ├── page.tsx            (Pools list — reads from Supabase)
    │       ├── create/page.tsx     (Create pool — writes to Supabase)
    │       └── [id]/
    │           ├── page.tsx        (Pool detail — mock data for now)
    │           ├── team/page.tsx   (Team builder — mock data for now)
    │           ├── rules/page.tsx  (Rules + scoring breakdown — mock data for now)
    │           └── settings/page.tsx (Edit pool — mock data for now)
    ├── components/Nav.tsx      ← reads auth state + profile for token pills
    ├── lib/
    │   ├── mockData.ts         (picks marketplace mock data)
    │   ├── poolMockData.ts     (NHL players + pool types + helpers)
    │   └── supabase/
    │       ├── client.ts       (browser client)
    │       ├── server.ts       (server components + route handlers)
    │       └── middleware.ts   (session-refresh helper)
    └── supabase/
        ├── schema.sql              ← base: profiles/picks/unlocks/transactions/advertisers + trigger
        ├── pools_schema.sql        ← pools module tables + RLS + leaderboard view
        └── seed_nhl_players.sql    ← 52 NHL players
```

---

## Next Step When Resuming
1. Pick one meaningful next item (in rough priority order from TODO.md):
   - **Wire Unlock to persist** — the core money loop. `unlocks` table insert + `profiles.unlock_tokens` / `earn_tokens` updates. After this the whole token economy is real.
   - **Finish wiring pool pages** (`/pools/[id]`, team builder, rules, settings) so pools are fully functional end-to-end.
   - **Admin reports page** — Nick needs a way to see reports inside the app, not just in Supabase Table Editor.
   - **TOTP 2FA** — option 3 of the auth plan.
   - **Google Cloud OAuth setup** — finish option 1 (deferred; console.cloud.google.com setup + `NEXT_PUBLIC_GOOGLE_ENABLED=true`).
2. Running list of queued work: see `Mikes Pro Picks/TODO.md` in the workspace.
3. Supabase MCP is now wired to Propick6 — SQL/seeds/migrations can run directly from chat. Vercel is still generate-and-paste (env vars, redeploys).
