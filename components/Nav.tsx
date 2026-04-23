"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "@/lib/mockData";

const links = [
  { href: "/", label: "Feed" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pick", label: "+ Pick" },
  { href: "/stats", label: "My Stats" },
  { href: "/advertise", label: "Advertise" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-muted text-[10px] tracking-[0.2em] font-semibold">
            PRO
          </span>
          <span className="font-display text-2xl">
            PICK <span className="text-green">6</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full transition ${
                  active
                    ? "bg-green/10 text-green"
                    : "text-muted hover:text-text hover:bg-panel"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/wallet"
          className="flex items-center gap-2"
          aria-label="Open wallet"
        >
          <span className="flex items-center gap-1 bg-panel border border-border rounded-full px-2.5 py-1 text-sm">
            <span className="text-gold">🟡</span>
            <span className="font-semibold">{currentUser.unlockTokens}</span>
          </span>
          <span className="flex items-center gap-1 bg-panel border border-border rounded-full px-2.5 py-1 text-sm">
            <span className="text-blue">🔵</span>
            <span className="font-semibold">{currentUser.earnTokens}</span>
          </span>
        </Link>
      </div>
      <div className="md:hidden border-t border-border">
        <div className="max-w-5xl mx-auto px-2 py-2 flex gap-1 overflow-x-auto no-scrollbar text-xs">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap ${
                  active
                    ? "bg-green/10 text-green"
                    : "text-muted hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
