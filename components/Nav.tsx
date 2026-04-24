"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Feed" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pools", label: "Pools" },
  { href: "/pick", label: "+ Pick" },
  { href: "/stats", label: "My Stats" },
  { href: "/advertise", label: "Advertise" },
];

type Profile = {
  handle: string | null;
  unlock_tokens: number;
  earn_tokens: number;
};

export default function Nav() {
  const path = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Load user + profile on mount, and re-run whenever auth state changes.
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSignedIn(false);
        setProfile(null);
        return;
      }
      setSignedIn(true);

      const { data } = await supabase
        .from("profiles")
        .select("handle, unlock_tokens, earn_tokens")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(
        data ?? { handle: null, unlock_tokens: 0, earn_tokens: 0 }
      );
    }

    loadProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
            const active =
              l.href === "/" ? path === "/" : path.startsWith(l.href);
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

        {/* Right side: token chips + sign-in/out */}
        <div className="flex items-center gap-2">
          {signedIn && profile && (
            <Link
              href="/wallet"
              className="flex items-center gap-2"
              aria-label="Open wallet"
            >
              <span className="flex items-center gap-1 bg-panel border border-border rounded-full px-2.5 py-1 text-sm">
                <span className="text-gold">🟡</span>
                <span className="font-semibold">{profile.unlock_tokens}</span>
              </span>
              <span className="flex items-center gap-1 bg-panel border border-border rounded-full px-2.5 py-1 text-sm">
                <span className="text-blue">🔵</span>
                <span className="font-semibold">{profile.earn_tokens}</span>
              </span>
            </Link>
          )}

          {signedIn === false && (
            <Link
              href="/signin"
              className="bg-green text-bg font-semibold px-3 py-1.5 rounded-full text-sm"
            >
              Sign in
            </Link>
          )}

          {signedIn && (
            <Link
              href="/account"
              className="text-xs text-muted hover:text-text border border-border rounded-full px-2.5 py-1"
              title="Account settings"
            >
              {profile?.handle ? `@${profile.handle}` : "Account"}
            </Link>
          )}
        </div>
      </div>
      <div className="md:hidden border-t border-border">
        <div className="max-w-5xl mx-auto px-2 py-2 flex gap-1 overflow-x-auto no-scrollbar text-xs">
          {links.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path.startsWith(l.href);
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
