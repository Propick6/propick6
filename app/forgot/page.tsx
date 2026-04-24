"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErr(error.message);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-5">
      <div>
        <Link href="/signin" className="text-xs text-muted hover:text-text">
          ← Back to sign in
        </Link>
        <h1 className="font-display text-3xl mt-2">FORGOT PASSWORD</h1>
        <p className="text-sm text-muted mt-1">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>

      {status === "sent" ? (
        <div className="rounded-xl border border-green/40 bg-green/10 p-4 text-sm">
          <div className="font-semibold text-green mb-1">Check your inbox</div>
          If there&apos;s an account for{" "}
          <span className="text-text">{email}</span>, you&apos;ll get a reset
          link in a minute. Click it to set a new password.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="block text-xs text-muted mb-1">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-green text-bg font-semibold px-4 py-2.5 rounded-full text-sm shadow-glow disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send reset link"}
          </button>

          {err && (
            <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
              {err}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
