"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

// Next.js 14 requires useSearchParams() to live inside a <Suspense> boundary
// during static generation, so the component that reads search params is
// inner; the default export just wraps it.
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-sm mx-auto mt-10 text-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const params = useSearchParams();
  const nextPath = params.get("next") || "/pools";
  const errParam = params.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "confirm">(
    "idle"
  );
  const [err, setErr] = useState("");

  const supabase = createClient();

  // Google button shows up only when we've configured the Google provider
  // in Supabase (and set NEXT_PUBLIC_GOOGLE_ENABLED=true in .env.local).
  // Keeps the UI from advertising a broken path before setup is done.
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  async function onGoogle() {
    setErr("");
    setStatus("loading");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`,
      },
    });
    if (error) {
      setErr(error.message);
      setStatus("idle");
    }
    // On success the browser is redirected to Google and then back.
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setStatus("loading");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErr(error.message);
        setStatus("idle");
        return;
      }
      window.location.href = nextPath;
      return;
    }

    if (mode === "signup") {
      if (password !== password2) {
        setErr("Passwords don't match.");
        setStatus("idle");
        return;
      }
      if (password.length < 8) {
        setErr("Password must be at least 8 characters.");
        setStatus("idle");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });
      if (error) {
        setErr(error.message);
        setStatus("idle");
        return;
      }
      // If email confirmation is enabled in Supabase, user needs to click the
      // confirm link before they can sign in. Tell them.
      setStatus("confirm");
      return;
    }

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });
      if (error) {
        setErr(error.message);
        setStatus("idle");
        return;
      }
      setStatus("sent");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-5">
      <div>
        <h1 className="font-display text-3xl">SIGN IN</h1>
        <p className="text-sm text-muted mt-1">
          Pick whichever way you like best.
        </p>
      </div>

      {errParam === "callback_failed" && (
        <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
          That link didn&apos;t work. Try signing in again.
        </div>
      )}

      {/* Google button — one-tap. Only shown when Google provider is set up. */}
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={onGoogle}
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2 bg-panel border border-border hover:bg-panel2 text-text font-semibold py-2.5 rounded-full text-sm"
          >
            <GoogleG />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted">
            <div className="flex-1 h-px bg-border" />
            or
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1 bg-panel border border-border rounded-full p-1 text-xs">
        <TabButton active={mode === "signin"} onClick={() => setMode("signin")}>
          Sign in
        </TabButton>
        <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>
          Sign up
        </TabButton>
        <TabButton active={mode === "magic"} onClick={() => setMode("magic")}>
          Magic link
        </TabButton>
      </div>

      {/* Success states */}
      {status === "sent" && (
        <div className="rounded-xl border border-green/40 bg-green/10 p-4 text-sm">
          <div className="font-semibold text-green mb-1">Check your inbox</div>
          A sign-in link has been sent to{" "}
          <span className="text-text">{email}</span>. Click it to finish
          signing in.
        </div>
      )}

      {status === "confirm" && (
        <div className="rounded-xl border border-green/40 bg-green/10 p-4 text-sm">
          <div className="font-semibold text-green mb-1">Account created</div>
          We sent a confirmation link to{" "}
          <span className="text-text">{email}</span>. Click it, then come back
          and sign in with your password.
        </div>
      )}

      {/* Form */}
      {status !== "sent" && status !== "confirm" && (
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

          {mode !== "magic" && (
            <label className="block">
              <span className="block text-xs text-muted mb-1">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : ""}
                required
                minLength={mode === "signup" ? 8 : undefined}
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
              />
            </label>
          )}

          {mode === "signup" && (
            <label className="block">
              <span className="block text-xs text-muted mb-1">
                Confirm password
              </span>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                minLength={8}
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-green text-bg font-semibold px-4 py-2.5 rounded-full text-sm shadow-glow disabled:opacity-60"
          >
            {status === "loading"
              ? "Working…"
              : mode === "signin"
              ? "Sign in"
              : mode === "signup"
              ? "Create account"
              : "Send magic link"}
          </button>

          {mode === "signin" && (
            <div className="text-center">
              <Link
                href="/forgot"
                className="text-xs text-muted hover:text-text"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {err && (
            <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
              {err}
            </div>
          )}
        </form>
      )}

      <p className="text-[11px] text-muted text-center">
        By signing up you agree to our terms. 19+ only.
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 transition ${
        active ? "bg-green/10 text-green" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function GoogleG() {
  // Google "G" multicolor mark, inline SVG.
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
