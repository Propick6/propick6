"use client";

import { useState } from "react";
import { currentUser, tokenBundles, transactions } from "@/lib/mockData";

export default function WalletPage() {
  const [convertSteps, setConvertSteps] = useState(1); // each step = 5 redeem → 3 unlock
  const maxSteps = Math.floor(currentUser.redeemTokens / 5);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">MY WALLET</h1>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-4">
          <div className="text-xs uppercase tracking-wider text-gold">
            🟡 Unlock Tokens
          </div>
          <div className="font-display text-4xl mt-1">
            {currentUser.unlockTokens}
          </div>
          <div className="text-sm text-muted">
            ≈ ${currentUser.unlockTokens * 5}.00 value · never expire
          </div>
        </div>
        <div className="rounded-xl border border-blue/40 bg-gradient-to-br from-blue/10 to-transparent p-4">
          <div className="text-xs uppercase tracking-wider text-blue">
            🔵 Redeem Tokens
          </div>
          <div className="font-display text-4xl mt-1">
            {currentUser.redeemTokens}
          </div>
          <div className="text-sm text-muted">
            ≈ ${currentUser.redeemTokens * 3}.00 cash value
          </div>
        </div>
      </div>

      {/* Buy bundles */}
      <section>
        <h2 className="font-display text-xl mb-2">BUY UNLOCK TOKENS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tokenBundles.map((b) => (
            <button
              key={b.tokens}
              className={`rounded-xl p-4 border text-left hover:border-green transition ${
                b.highlight
                  ? "border-green bg-green/5"
                  : "border-border bg-panel"
              }`}
            >
              {b.highlight && (
                <div className="text-[10px] text-green font-semibold mb-1 tracking-wider">
                  MOST POPULAR
                </div>
              )}
              <div className="font-display text-3xl">
                {b.tokens} <span className="text-gold">🟡</span>
              </div>
              <div className="text-sm text-muted mt-1">${b.price}.00</div>
              <div className="text-[11px] text-muted mt-2">{b.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Withdraw + Convert */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
          <div className="font-display text-xl">WITHDRAW TO CASH</div>
          <div className="text-sm text-muted">
            Convert your 🔵 Redeem Tokens into real money via Stripe. No minimum.
          </div>
          <div className="flex items-center justify-between bg-panel2 rounded-lg p-3">
            <span className="text-sm">
              Withdraw all {currentUser.redeemTokens} 🔵
            </span>
            <span className="font-semibold">
              ${currentUser.redeemTokens * 3}.00
            </span>
          </div>
          <button className="w-full bg-blue text-bg font-semibold py-2.5 rounded-full">
            Cash out via Stripe
          </button>
        </div>

        <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
          <div className="font-display text-xl">CONVERT 🔵 → 🟡</div>
          <div className="text-sm text-muted">
            Only in increments of 5. Even exchange ($15 for $15), zero rake.
          </div>
          <div className="flex items-center justify-between bg-panel2 rounded-lg p-3">
            <button
              onClick={() => setConvertSteps((s) => Math.max(1, s - 1))}
              disabled={convertSteps <= 1 || maxSteps === 0}
              className="w-8 h-8 rounded-full bg-bg border border-border disabled:opacity-40"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-sm">
                {convertSteps * 5} 🔵 → {convertSteps * 3} 🟡
              </div>
              <div className="text-xs text-muted">
                ${convertSteps * 15} for ${convertSteps * 15}
              </div>
            </div>
            <button
              onClick={() =>
                setConvertSteps((s) => Math.min(Math.max(1, maxSteps), s + 1))
              }
              disabled={convertSteps >= maxSteps || maxSteps === 0}
              className="w-8 h-8 rounded-full bg-bg border border-border disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            disabled={maxSteps === 0}
            className="w-full bg-gold text-bg font-semibold py-2.5 rounded-full disabled:opacity-40"
          >
            {maxSteps === 0
              ? "Need 5+ 🔵 to convert"
              : `Convert ${convertSteps * 5} 🔵 → ${convertSteps * 3} 🟡`}
          </button>
        </div>
      </section>

      {/* Transactions */}
      <section>
        <h2 className="font-display text-xl mb-2">TRANSACTION HISTORY</h2>
        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
            >
              <div>
                <div className="text-sm font-semibold">{t.kind}</div>
                <div className="text-xs text-muted">
                  {t.date} · {t.detail}
                </div>
              </div>
              <div className="text-sm font-semibold">{t.amount}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
