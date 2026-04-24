"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  // The user landed here via a password-reset link that already exchanged
  // the code for a session in /auth/callback. They should have an active
  // session now. If they don't, send them to /forgot.
  const [ready, setReady] = useState<"checking" | "ok" | "nosession">(
    "checking"
  );
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setReady(data.user ? "ok" : "nosession");
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (password !== password2) {
      setErr("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setStatus("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
      setStatus("idle");
      return;
    }
    setStatus("saved");
    // Give them a second to see the confirmation, then bounce to the app.
    setTimeout(() => router.push("/pools"), 1200);
  }

  if (ready === "checking") {
    return (
      <div className="max-w-sm mx-auto mt-10 text-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (ready === "nosession") {
    return (
      <div className="max-w-sm mx-auto mt-10 space-y-4">
        <h1 className="font-display text-3xl">LINK EXPIRED</h1>
        <p className="text-sm text-muted">
          Your reset link has expired or already been used. Request a new one.
        </p>
        <Link
          href="/forgot"
          className="inline-block bg-green text-bg font-semibold px-4 py-2 rounded-full text-sm shadow-glow"
        >
          Request new link →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-5">
      <div>
        <h1 className="font-display text-3xl">NEW PASSWORD</h1>
        <p className="text-sm text-muted mt-1">
          Pick something you haven&apos;t used elsewhere. At least 8 characters.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-xs text-muted mb-1">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="block text-xs text-muted mb-1">Confirm</span>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            minLength={8}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={status === "saving" || status === "saved"}
          className="w-full bg-green text-bg font-semibold px-4 py-2.5 rounded-full text-sm shadow-glow disabled:opacity-60"
        >
          {status === "saving"
            ? "Saving…"
            : status === "saved"
            ? "Saved ✓"
            : "Save password"}
        </button>

        {err && (
          <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
            {err}
          </div>
        )}
      </form>
    </div>
  );
}
