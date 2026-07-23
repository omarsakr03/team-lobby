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

const ADMINISTRATOR_PERMISSION = 1n << 3n;
const DISCORD_API_BASE = "https://discord.com/api/v10";

function discordAccessConfig() {
  const guildId = String(process.env.DISCORD_GUILD_ID || "").trim();
  const botToken = String(process.env.DISCORD_BOT_TOKEN || "").trim();

  return {
    guildId: /^\d{15,25}$/.test(guildId) ? guildId : null,
    botToken: botToken || null
  };
}

async function discordApi(path, botToken) {
  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    headers: { authorization: `Bot ${botToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new AccessError("Could not verify Discord server permissions.", 503, "DISCORD_VERIFICATION_FAILED");
  }

  return response.json();
}

async function hasDiscordAdministratorPermission(discordId) {
  const { guildId, botToken } = discordAccessConfig();
  if (!guildId || !botToken) return false;

  const [member, roles] = await Promise.all([
    discordApi(`/guilds/${guildId}/members/${discordId}`, botToken),
    discordApi(`/guilds/${guildId}/roles`, botToken)
  ]);
  const memberRoleIds = new Set(Array.isArray(member?.roles) ? member.roles.map(String) : []);

  return Array.isArray(roles) && roles.some((role) => {
    if (!memberRoleIds.has(String(role?.id || ""))) return false;
    try {
      return (BigInt(role.permissions || "0") & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
    } catch {
      return false;
    }
  });
}

export async function resolveAdminUser(userId) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data?.user) {
    throw new AccessError("Could not verify the signed-in user.");
  }

  const discordId = identityDiscordId(data.user);
  const allowed = allowedDiscordIds();

  if (!discordId) {
    throw new AccessError("This Discord account is not allowed.", 403, "FORBIDDEN");
  }

  let isAdministrator = false;
  try {
    isAdministrator = await hasDiscordAdministratorPermission(discordId);
  } catch (error) {
    if (!allowed.has(discordId)) throw error;
  }

  if (!allowed.has(discordId) && !isAdministrator) {
    throw new AccessError("This Discord account is not a server administrator.", 403, "FORBIDDEN");
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
