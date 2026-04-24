"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Handle rules — keep these in sync with anything else validating handles.
const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;
const HANDLE_RULE_TEXT =
  "3–20 characters · lowercase letters, numbers, underscores";

type Profile = {
  id: string;
  email: string | null;
  handle: string;
  display_name: string | null;
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Handle editor state
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/signin?next=/account");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, handle, display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErr(error.message);
      } else if (data) {
        const p: Profile = {
          id: data.id,
          email: user.email ?? null,
          handle: data.handle,
          display_name: data.display_name,
        };
        setProfile(p);
        setHandle(p.handle);
        setDisplayName(p.display_name ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setErr("");
    setSaved(false);

    const nextHandle = handle.trim().toLowerCase();
    if (!HANDLE_REGEX.test(nextHandle)) {
      setErr(`Handle must be ${HANDLE_RULE_TEXT}.`);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        handle: nextHandle,
        display_name: displayName.trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      // Unique violation on handle comes back as code 23505.
      if (error.code === "23505" || /duplicate/i.test(error.message)) {
        setErr("That handle is already taken — try another.");
      } else {
        setErr(error.message);
      }
      return;
    }

    setProfile({ ...profile, handle: nextHandle, display_name: displayName.trim() || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center text-sm text-muted">
        Loading account…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-10 space-y-3">
        <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
          Couldn&apos;t load your profile.{" "}
          {err || "Try signing out and back in."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6 space-y-5">
      <div>
        <Link href="/" className="text-xs text-muted hover:text-text">
          ← Back
        </Link>
        <h1 className="font-display text-3xl mt-2">ACCOUNT</h1>
        <p className="text-sm text-muted mt-1">
          Your public handle is how other cappers and pool players see you.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <Section title="Profile">
          <Field label="Handle (public)">
            <div className="flex items-center gap-2">
              <span className="text-muted">@</span>
              <input
                value={handle}
                onChange={(e) =>
                  setHandle(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                maxLength={20}
                className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <p className="text-[11px] text-muted mt-1">{HANDLE_RULE_TEXT}</p>
          </Field>

          <Field label="Display name (optional)">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              placeholder="e.g. Nick T"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Email">
            <div className="bg-bg border border-border rounded-md px-3 py-2 text-sm text-muted">
              {profile.email ?? "—"}
            </div>
            <p className="text-[11px] text-muted mt-1">
              Email can&apos;t be changed here yet — contact support if you need
              this.
            </p>
          </Field>
        </Section>

        {err && (
          <div className="rounded-md border border-hot/40 bg-hot/10 p-3 text-sm text-hot">
            {err}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-green text-bg font-semibold px-5 py-2 rounded-full text-sm shadow-glow disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-full border border-border text-sm text-muted hover:text-text"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Danger / sign-out zone */}
      <div className="rounded-xl border border-border bg-panel p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted">
            Session
          </div>
          <div className="text-sm">Sign out of this browser.</div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="border border-border text-muted hover:text-text px-4 py-2 rounded-full text-sm"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-muted mb-1">{label}</div>
      {children}
    </div>
  );
}
