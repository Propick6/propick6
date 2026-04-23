"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Magic link sends user here after they click it.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-5">
      <div>
        <h1 className="font-display text-3xl">SIGN IN</h1>
        <p className="text-sm text-muted mt-1">
          We&apos;ll email you a one-click magic link — no password needed.
        </p>
      </div>

      {status === "sent" ? (
        <div className="rounded-xl border border-green/40 bg-green/10 p-4 text-sm">
          <div className="font-semibold text-green mb-1">Check your inbox</div>
          A sign-in link has been sent to{" "}
          <span className="text-text">{email}</span>. Click it to finish signing
          in. (Check spam if you don&apos;t see it in 30 seconds.)
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
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>

          {status === "error" && (
            <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
              {errMsg || "Something went wrong. Try again."}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
