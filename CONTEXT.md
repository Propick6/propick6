# Pro Pick 6 — Project Context File
*Last updated: April 23, 2026*

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

## Build Status (As of 2026-04-23)

### Phase 1 — Visual prototype deployed ✅
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- 6 pages working on mock data: Feed, Leaderboard, +Pick, Wallet, My Stats, Advertise
- Nav bar with always-visible token pills (🟡 and 🔵)
- Brand styling complete — dark + green + gold + blue, Bebas Neue + DM Sans
- Supabase SQL schema drafted in `supabase/schema.sql` (not yet applied)
- Pushed to `github.com/Propick6/propick6`
- Deployed live at `propick6.vercel.app`
- Git installed locally; `git push` auto-deploys going forward

### Phase 2 — Wire Supabase (up next)
- Paste `supabase/schema.sql` into Supabase SQL Editor → creates `profiles`, `picks`, `unlocks`, `transactions`, `advertisers` tables with RLS
- Install `@supabase/supabase-js` as a dependency
- Add Supabase client in `lib/supabase.ts`
- Add auth pages: signup / login
- Wire nav token pills + wallet balances to read from real `profiles` row
- Add env vars to Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Phase 3 — Wire Stripe (test mode)
- Install `stripe` + `@stripe/stripe-js`
- Checkout Session for token bundle purchases
- Webhook to credit unlock tokens after `checkout.session.completed`
- Stripe Connect Express for seller payouts (cash-out earn tokens)
- Add env vars to Vercel: `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Phase 4 — Polish + launch prep
- Real leaderboard computed from `picks` + `unlocks`
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
└── propick6/                   ← the Next.js app (also at github.com/Propick6/propick6)
    ├── CONTEXT.md              ← this file (version-controlled with the code)
    ├── README.md
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── .gitignore
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx                (Feed)
    │   ├── leaderboard/page.tsx
    │   ├── pick/page.tsx
    │   ├── wallet/page.tsx
    │   ├── stats/page.tsx
    │   └── advertise/page.tsx
    ├── components/Nav.tsx
    ├── lib/mockData.ts
    └── supabase/schema.sql     ← paste into Supabase SQL Editor for Phase 2
```

---

## Next Step When Resuming
1. Finish phone testing of propick6.vercel.app — click through all 6 pages and report bugs/tweaks
2. Apply any bugfixes and polish (iterate via `git push`)
3. Begin Phase 2: paste `supabase/schema.sql` into Supabase SQL Editor
4. Grab Supabase URL + anon key from Project Settings → API, add to Vercel env vars
5. Claude generates `lib/supabase.ts` + auth pages + real token balance wiring
6. `git push` → auto-deploys to propick6.vercel.app
