# Pro Pick 6

Daily sports picks marketplace — cappers post pick cards, buyers unlock them with tokens, leaderboard tracks who's hot and who's cold.

## Token Economy

- 🟡 **Unlock Token** — $5, used to unlock a capper's full day card. Bundles: 1/5/10/20.
- 🔵 **Earn Token** — $3 cash value, awarded to sellers per unlock.
- Rake: $2 per unlock (platform). $0 on 🔵 → 🟡 conversions.
- Conversion: 5 🔵 → 3 🟡, only in increments of 5.
- Rules: 6-pick daily minimum to appear in feed, picks expire at midnight.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth) — wired in Phase 2
- Stripe (test mode) — wired in Phase 2
- Vercel (hosting)

## Phase Plan

**Phase 1 (this deploy):** Visual prototype of all 6 pages using mock data. No env vars required. Goal: prove the deploy pipeline and get a live URL.

**Phase 2:** Wire Supabase auth + database. Real user accounts, real pick submissions, real token balances.

**Phase 3:** Wire Stripe (test mode) for token bundle purchases and earn-token cash-out.

**Phase 4:** Leaderboard computed from real data, advertiser onboarding, webhooks.

## Deploying

1. Upload this whole folder to `github.com/Propick6/propick6` via GitHub's web UI.
2. In Vercel, click "Add New → Project" → import the `propick6` repo.
3. Accept all defaults and click "Deploy".
4. First build takes ~2 minutes. You'll get a URL like `propick6.vercel.app`.

No environment variables are required for Phase 1.

## Brand

- Background `#07090D`, green accent `#00E676`, gold (unlock) `#FFD700`, blue (earn) `#00C2FF`
- Fonts: Bebas Neue (display), DM Sans (body)
- Promo code: `PROPICK6`
