import { NextResponse } from "next/server";
import { resolveAdminUser } from "../../../lib/control/auth";
import { resolveInternalRedirect } from "../../../lib/control/redirect";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = resolveInternalRedirect(
    url.searchParams.get("next"),
    url.origin
  );
  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      try {
        await resolveAdminUser(data.user.id);
        return NextResponse.redirect(new URL(next, url.origin));
      } catch {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/admin/login?error=unauthorized", url.origin));
      }
    }
  }

  return NextResponse.redirect(new URL("/admin/login?error=oauth", url.origin));
}
