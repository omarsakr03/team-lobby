import { updateSession } from "./src/lib/supabase/proxy";

export async function proxy(request) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/api/control/:path*"
  ]
};
