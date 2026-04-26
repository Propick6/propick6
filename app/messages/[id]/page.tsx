"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OtherMember = {
  id: string;
  handle: string;
  display_name: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const conversationId = params.id;
  const supabase = createClient();
  const router = useRouter();

  const [authState, setAuthState] = useState<"checking" | "out" | "in">(
    "checking"
  );
  const [me, setMe] = useState<string | null>(null);
  const [other, setOther] = useState<OtherMember | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load + subscribe to realtime inserts on this conversation.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (cancelled) return;
        setAuthState("out");
        setLoading(false);
        return;
      }
      if (cancelled) return;
      setMe(user.id);
      setAuthState("in");

      // Find the OTHER member for the header. RLS lets us see all members of
      // conversations we belong to; if we get nothing back we don't have access.
      const { data: members } = await supabase
        .from("conversation_members")
        .select(
          "user_id, profile:profiles!inner(id, handle, display_name)"
        )
        .eq("conversation_id", conversationId);

      if (!members || members.length === 0) {
        if (cancelled) return;
        setForbidden(true);
        setLoading(false);
        return;
      }

      const otherMember = (members as unknown as Array<{
        user_id: string;
        profile: OtherMember;
      }>).find((m) => m.user_id !== user.id);
      if (cancelled) return;
      setOther(otherMember?.profile ?? null);

      // Initial messages.
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);

      if (cancelled) return;
      setMessages((msgs as Message[] | null) ?? []);
      setLoading(false);

      // Mark this conversation as read NOW.
      await supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      // Realtime: append any new messages as they arrive.
      channel = supabase
        .channel(`conv-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const m = payload.new as Message;
            setMessages((prev) =>
              prev.some((x) => x.id === m.id) ? prev : [...prev, m]
            );
          }
        )
        .subscribe();
    }
    init();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Auto-scroll to bottom whenever messages change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // When new messages arrive while you're viewing, keep the read marker fresh.
  useEffect(() => {
    if (authState !== "in" || !me || messages.length === 0) return;
    const handle = setTimeout(async () => {
      await supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", me);
    }, 500);
    return () => clearTimeout(handle);
  }, [messages.length, me, authState, conversationId]);

  async function send() {
    if (!me || !body.trim() || sending) return;
    setSending(true);
    const text = body.trim();
    setBody("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: me,
      body: text,
    });

    if (error) {
      // Restore the input so the user can retry.
      setBody(text);
      console.error("Send failed:", error);
    }
    setSending(false);
  }

  if (authState === "checking" || loading) {
    return (
      <div className="text-center text-sm text-muted py-10">Loading…</div>
    );
  }

  if (authState === "out") {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-4 text-center">
        <h1 className="font-display text-3xl">MESSAGE</h1>
        <p className="text-sm text-muted">Sign in to view this conversation.</p>
        <Link
          href={`/signin?next=/messages/${conversationId}`}
          className="inline-block bg-green text-bg font-semibold px-5 py-2.5 rounded-full text-sm shadow-glow"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-3 text-center">
        <h1 className="font-display text-3xl">NOT FOUND</h1>
        <p className="text-sm text-muted">
          This conversation doesn&apos;t exist or you&apos;re not in it.
        </p>
        <Link
          href="/messages"
          className="inline-block border border-border rounded-full px-4 py-2 text-sm text-muted hover:text-text"
        >
          ← Back to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <Link
          href="/messages"
          className="text-muted hover:text-text text-xs"
          aria-label="Back to messages"
        >
          ← Back
        </Link>
        {other && (
          <Link
            href={`/u/${other.handle}`}
            className="flex items-center gap-2 ml-auto group"
          >
            <div className="w-8 h-8 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-sm text-green">
              {other.handle[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm group-hover:text-green truncate">
                @{other.handle}
              </div>
              {other.display_name && (
                <div className="text-[10px] text-muted truncate">
                  {other.display_name}
                </div>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Messages list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="text-center text-xs text-muted py-10">
            Say hi 👋
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm break-words ${
                    mine
                      ? "bg-green text-bg rounded-br-sm"
                      : "bg-panel border border-border rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.body}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      mine ? "text-bg/60" : "text-muted"
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border pt-3 flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter inserts newline.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          maxLength={4000}
          placeholder={`Message @${other?.handle ?? ""}…`}
          className="flex-1 bg-panel2 border border-border rounded-2xl px-3 py-2 text-sm focus:border-green outline-none resize-none max-h-32"
        />
        <button
          onClick={send}
          disabled={!body.trim() || sending}
          className="bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow disabled:opacity-40"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
