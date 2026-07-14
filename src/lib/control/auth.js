import { createAdminClient } from "../supabase/admin";
import { createClient as createServerClient } from "../supabase/server";

export class AccessError extends Error {
  constructor(message, status = 401, code = "UNAUTHORIZED") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function allowedDiscordIds() {
  return new Set(
    String(process.env.ADMIN_DISCORD_USER_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => /^\d{15,25}$/.test(value))
  );
}

function identityDiscordId(user) {
  const identity = user?.identities?.find((item) => item.provider === "discord");
  const identityData = identity?.identity_data || {};
  const id = String(identityData.sub || identityData.provider_id || "").trim();
  return /^\d{15,25}$/.test(id) ? id : null;
}

export async function resolveAdminUser(userId) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data?.user) {
    throw new AccessError("Could not verify the signed-in user.");
  }

  const discordId = identityDiscordId(data.user);
  const allowed = allowedDiscordIds();

  if (!discordId || !allowed.has(discordId)) {
    throw new AccessError("This Discord account is not allowed.", 403, "FORBIDDEN");
  }

  const metadata = data.user.user_metadata || {};

  return {
    authUserId: data.user.id,
    discordId,
    name: String(metadata.full_name || metadata.name || metadata.user_name || "Omar").slice(0, 80),
    avatarUrl: metadata.avatar_url || null
  };
}

export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    throw new AccessError("Sign in is required.");
  }

  return resolveAdminUser(userId);
}

export function validateSameOrigin(request) {
  const origin = request.headers.get("origin");
  const expected = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || request.url
  ).origin;

  if (!origin || origin !== expected) {
    throw new AccessError("Invalid request origin.", 403, "INVALID_ORIGIN");
  }
}
