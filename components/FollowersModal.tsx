"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Person = {
  id: string;
  handle: string;
  display_name: string | null;
};

type Tab = "followers" | "following";

export default function FollowersModal({
  open,
  onClose,
  userId,
  initialTab = "followers",
}: {
  open: boolean;
  onClose: () => void;
  userId: string; // the profile owner — must equal auth.uid() for RLS to return rows
  initialTab?: Tab;
}) {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Load the active tab.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    async function load() {
      // For "followers": find rows where I'm followed → return follower profile.
      // For "following": find rows where I'm follower → return followed profile.
      const filterCol = tab === "followers" ? "followed_id" : "follower_id";
      const joinCol = tab === "followers" ? "follower_id" : "followed_id";

      const { data: edges } = await supabase
        .from("follows")
        .select(`${joinCol}`)
        .eq(filterCol, userId);

      if (cancelled) return;

      const ids = ((edges ?? []) as Array<Record<string, string>>).map(
        (r) => r[joinCol]
      );
      if (ids.length === 0) {
        setPeople([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, handle, display_name")
        .in("id", ids)
        .order("handle", { ascending: true });

      if (cancelled) return;
      setPeople((profiles as Person[] | null) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, tab, userId]);

  async function unfollow(targetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const prev = people;
    // Optimistic removal from the displayed list.
    setPeople((p) => p.filter((x) => x.id !== targetId));
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followed_id", targetId);
    if (error) {
      setPeople(prev);
      console.error("Unfollow failed:", error);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-[8vh]"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["followers", "following"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition ${
                tab === t
                  ? "text-green border-b-2 border-green"
                  : "text-muted hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={onClose}
            className="px-3 text-xs text-muted hover:text-text"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted">Loading…</div>
          ) : people.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              {tab === "followers"
                ? "Nobody follows you yet."
                : "You're not following anyone yet."}
            </div>
          ) : (
            <ul>
              {people.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-panel2 transition"
                >
                  <Link
                    href={`/u/${p.handle}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-sm text-green shrink-0">
                      {p.handle[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">@{p.handle}</div>
                      {p.display_name && (
                        <div className="text-xs text-muted truncate">
                          {p.display_name}
                        </div>
                      )}
                    </div>
                  </Link>
                  {tab === "following" && (
                    <button
                      onClick={() => unfollow(p.id)}
                      className="text-xs border border-border hover:border-hot hover:text-hot text-muted rounded-full px-3 py-1 shrink-0 transition"
                    >
                      Unfollow
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
