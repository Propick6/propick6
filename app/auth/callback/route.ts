// Handles the redirect back from:
//   - magic-link sign in
//   - Google OAuth
//   - password-reset email
// All three end up here with a ?code= param which we exchange for a session,
// then bounce the user to whatever ?next= path they were headed to.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow redirects that stay on our own site. Stops someone from
// crafting ?next=https://evil.example to trick a user into handing off
// their session to a foreign domain.
function safeNext(raw: string | null): string {
  if (!raw) return "/pools";
  if (!raw.startsWith("/")) return "/pools";
  if (raw.startsWith("//")) return "/pools";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback — something went wrong.
  return NextResponse.redirect(`${origin}/signin?error=callback_failed`);
}
