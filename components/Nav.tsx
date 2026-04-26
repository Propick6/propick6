"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchModal from "@/components/SearchModal";

const links = [
  { href: "/", label: "Feed" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pools", label: "Pools" },
  { href: "/pick", label: "+ Pick" },
  { href: "/messages", label: "Messages" },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Load user + profile on mount, and re-run whenever auth state changes.
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSignedIn(false);
        setProfile(null);
        setUserId(null);
        setUnread(0);
        return;
      }
      setSignedIn(true);
      setUserId(user.id);

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

  // Compute the unread message count (across all conversations) and keep it
  // fresh: refetch on every route change AND on every message Realtime INSERT
  // we receive (RLS scopes the broadcast to conversations we're in).
  useEffect(() => {
    if (!userId) {
      setUnread(0);
      return;
    }
    const supabase = createClient();

    async function fetchUnread() {
      const { data: members } = await supabase
        .from("conversation_members")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId);
      if (!members || members.length === 0) {
        setUnread(0);
        return;
      }
      const convIds = members.map((m) => m.conversation_id as string);
      const lastReadByConv = new Map<string, string>(
        members.map((m) => [m.conversation_id as string, m.last_read_at as string])
      );

      const { data: msgs } = await supabase
        .from("messages")
        .select("conversation_id, created_at, sender_id")
        .in("conversation_id", convIds)
        .neq("sender_id", userId);

      let count = 0;
      for (const m of (msgs ?? []) as Array<{
        conversation_id: string;
        created_at: string;
      }>) {
        const lr = lastReadByConv.get(m.conversation_id);
        if (lr && m.created_at > lr) count++;
      }
      setUnread(count);
    }

    fetchUnread();

    const channel = supabase
      .channel(`nav-unread-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          // RLS only delivers events for messages in conversations we're in,
          // so any insert we see here is potentially relevant. Refetch.
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, path]);

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
            const showBadge = l.href === "/messages" && unread > 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full transition inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-green/10 text-green"
                    : "text-muted hover:text-text hover:bg-panel"
                }`}
              >
                {l.label}
                {showBadge && (
                  <span className="bg-green text-bg text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: search + token chips + sign-in/out */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search cappers"
            title="Search cappers"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-panel text-muted hover:text-text hover:border-green transition text-sm"
          >
            🔍
          </button>
          {signedIn && profile && (
            <Link
              href="/wallet"
              className="flex items-center gap-2"
              aria-label="Open wallet"
            >
              <span
                className="flex items-center gap-1 bg-panel border border-border rounded-full px-2.5 py-1 text-sm"
                title="Unlock Tokens"
              >
                <span className="text-gold">🟡</span>
                <span className="font-semibold">{profile.unlock_tokens}</span>
              </span>
              <span
                className="flex items-center gap-1 bg-panel border border-border rounded-full px-2.5 py-1 text-sm"
                title="Redeem Tokens"
              >
                <span className="text-blue">🔵</span>
                {/* DB column is still earn_tokens — labeled "Redeem Tokens" in UI per 2026-04-25 rename. */}
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
              // Goes to your PUBLIC profile (stats + followers + track record).
              // Edit-account is one click away via the "Edit account" button there.
              // Falls back to /account when handle isn't set yet (new accounts).
              href={profile?.handle ? `/u/${profile.handle}` : "/account"}
              className="text-xs text-muted hover:text-text border border-border rounded-full px-2.5 py-1"
              title="Your profile"
            >
              {profile?.handle ? `@${profile.handle}` : "Account"}
            </Link>
          )}
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="md:hidden border-t border-border">
        <div className="max-w-5xl mx-auto px-2 py-2 flex gap-1 overflow-x-auto no-scrollbar text-xs">
          {links.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path.startsWith(l.href);
            const showBadge = l.href === "/messages" && unread > 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap inline-flex items-center gap-1 ${
                  active
                    ? "bg-green/10 text-green"
                    : "text-muted hover:text-text"
                }`}
              >
                {l.label}
                {showBadge && (
                  <span className="bg-green text-bg text-[9px] font-bold rounded-full min-w-3.5 h-3.5 px-1 flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
