"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OtherMember = {
  id: string;
  handle: string;
  display_name: string | null;
};

type InboxRow = {
  conversationId: string;
  lastMessageAt: string;
  other: OtherMember | null;
  lastMessageBody: string | null;
  lastMessageSenderIsMe: boolean;
  unread: number;
};

export default function MessagesInboxPage() {
  const supabase = createClient();
  const [authState, setAuthState] = useState<"checking" | "out" | "in">(
    "checking"
  );
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthState("out");
        setLoading(false);
        return;
      }
      setAuthState("in");

      // 1. My memberships — gives me the conversations I'm in + my last_read_at.
      const { data: myMemberships } = await supabase
        .from("conversation_members")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);

      const convIds = (myMemberships ?? []).map((m) => m.conversation_id as string);
      if (convIds.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const lastReadByConv = new Map<string, string>(
        (myMemberships ?? []).map((m) => [
          m.conversation_id as string,
          m.last_read_at as string,
        ])
      );

      // 2. Conversations sorted by recency.
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, last_message_at")
        .in("id", convIds)
        .order("last_message_at", { ascending: false });

      // 3. The OTHER member of each conversation, joined to their profile.
      const { data: otherMembersRaw } = await supabase
        .from("conversation_members")
        .select(
          "conversation_id, profile:profiles!inner(id, handle, display_name)"
        )
        .in("conversation_id", convIds)
        .neq("user_id", user.id);

      const otherByConv = new Map<string, OtherMember>();
      for (const m of (otherMembersRaw ?? []) as unknown as Array<{
        conversation_id: string;
        profile: OtherMember;
      }>) {
        otherByConv.set(m.conversation_id, m.profile);
      }

      // 4. Recent messages (descending) so we can take the head per conv as
      //    the "latest" + count unread (= newer than my last_read_at and
      //    not sent by me).
      const { data: recentMsgs } = await supabase
        .from("messages")
        .select("id, conversation_id, body, created_at, sender_id")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      const lastMsgByConv = new Map<
        string,
        { body: string; sender_id: string }
      >();
      const unreadByConv = new Map<string, number>();
      for (const m of (recentMsgs ?? []) as Array<{
        conversation_id: string;
        body: string;
        created_at: string;
        sender_id: string;
      }>) {
        if (!lastMsgByConv.has(m.conversation_id)) {
          lastMsgByConv.set(m.conversation_id, {
            body: m.body,
            sender_id: m.sender_id,
          });
        }
        if (m.sender_id === user.id) continue;
        const lastRead = lastReadByConv.get(m.conversation_id);
        if (lastRead && m.created_at > lastRead) {
          unreadByConv.set(
            m.conversation_id,
            (unreadByConv.get(m.conversation_id) ?? 0) + 1
          );
        }
      }

      const inbox: InboxRow[] = (convs ?? []).map((c) => {
        const last = lastMsgByConv.get(c.id as string);
        return {
          conversationId: c.id as string,
          lastMessageAt: c.last_message_at as string,
          other: otherByConv.get(c.id as string) ?? null,
          lastMessageBody: last?.body ?? null,
          lastMessageSenderIsMe: last ? last.sender_id === user.id : false,
          unread: unreadByConv.get(c.id as string) ?? 0,
        };
      });

      setRows(inbox);
      setLoading(false);
    }
    load();
  }, []);

  if (authState === "checking" || loading) {
    return (
      <div className="text-center text-sm text-muted py-10">Loading…</div>
    );
  }

  if (authState === "out") {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-4 text-center">
        <h1 className="font-display text-3xl">MESSAGES</h1>
        <p className="text-sm text-muted">Sign in to see your messages.</p>
        <Link
          href="/signin?next=/messages"
          className="inline-block bg-green text-bg font-semibold px-5 py-2.5 rounded-full text-sm shadow-glow"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="font-display text-3xl">MESSAGES</h1>

      {rows.length === 0 ? (
        <div className="text-center text-sm text-muted py-10 border border-dashed border-border rounded-xl">
          No messages yet. Visit a capper&apos;s profile and tap{" "}
          <span className="font-semibold text-text">Message</span> to start a
          conversation.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          {rows.map((r) => (
            <Link
              key={r.conversationId}
              href={`/messages/${r.conversationId}`}
              className="flex items-center gap-3 p-4 border-b border-border last:border-0 hover:bg-panel2 transition"
            >
              <div className="w-10 h-10 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-lg text-green shrink-0">
                {r.other?.handle?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold truncate">
                    @{r.other?.handle ?? "deleted"}
                  </span>
                  <span className="text-[10px] text-muted shrink-0">
                    {formatRelative(r.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className={`text-xs truncate flex-1 ${
                      r.unread > 0 ? "text-text font-semibold" : "text-muted"
                    }`}
                  >
                    {r.lastMessageBody
                      ? `${r.lastMessageSenderIsMe ? "You: " : ""}${r.lastMessageBody}`
                      : "(no messages yet)"}
                  </div>
                  {r.unread > 0 && (
                    <span className="bg-green text-bg text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shrink-0">
                      {r.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// "2026-04-25T18:30:00Z" → "5m" / "2h" / "Yesterday" / "Apr 21"
function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "yest";
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
