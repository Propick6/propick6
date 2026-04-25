"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Result = {
  handle: string;
  display_name: string | null;
};

const DEBOUNCE_MS = 250;
const RESULT_LIMIT = 10;

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset everything when the modal opens; autofocus the input.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setLoading(false);
    // Defer focus so it lands after the input is mounted/visible.
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  // Esc closes the modal.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced search. Cancels in-flight requests via the `cancelled` flag if
  // the user keeps typing — prevents stale results from clobbering newer ones.
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      // ilike 'mike%' = case-insensitive prefix match on handle.
      // Special chars in user input are safe inside the % template because
      // Postgres ilike treats only %, _ and \ as metachars; we strip those
      // to keep the query a pure prefix search.
      const safe = trimmed.replace(/[%_\\]/g, "");
      const { data } = await supabase
        .from("profiles")
        .select("handle, display_name")
        .ilike("handle", `${safe}%`)
        .order("handle", { ascending: true })
        .limit(RESULT_LIMIT);
      if (cancelled) return;
      setResults((data as Result[] | null) ?? []);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, open]);

  function go(handle: string) {
    onClose();
    router.push(`/u/${handle}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <span className="text-muted text-lg pl-1">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cappers by handle…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            onClick={onClose}
            className="text-xs text-muted hover:text-text border border-border rounded px-2 py-0.5"
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        {/* Results / states */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              Start typing to find a capper by their handle.
            </div>
          ) : loading ? (
            <div className="p-6 text-center text-xs text-muted">Searching…</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              No cappers match{" "}
              <span className="text-text font-semibold">@{query.trim()}</span>.
            </div>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.handle}>
                  {/* Use button (not Link) so we can close the modal first
                      and also so it works even if router push is intercepted. */}
                  <button
                    onClick={() => go(r.handle)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-panel2 transition border-b border-border last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-panel2 border border-border flex items-center justify-center font-display text-sm text-green shrink-0">
                      {r.handle[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">@{r.handle}</div>
                      {r.display_name && (
                        <div className="text-xs text-muted truncate">
                          {r.display_name}
                        </div>
                      )}
                    </div>
                    <span className="text-muted text-xs">▸</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-3 py-2 bg-panel2 border-t border-border text-[10px] text-muted text-center">
            Showing {results.length} of up to {RESULT_LIMIT} matches —{" "}
            <Link
              href="/leaderboard"
              onClick={onClose}
              className="underline hover:text-text"
            >
              browse leaderboard
            </Link>{" "}
            for the full list.
          </div>
        )}
      </div>
    </div>
  );
}
