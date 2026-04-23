// Handles the redirect back from a magic link.
// Supabase sends the browser here with a ?code=... param; we exchange it for
// a session cookie, then redirect the user onward.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/pools";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback — something went wrong. Send them back to sign-in with a note.
  return NextResponse.redirect(`${origin}/signin?error=callback_failed`);
}
