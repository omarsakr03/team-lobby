import { NextResponse } from "next/server";
import {
  AccessError,
  requireAdmin,
  validateSameOrigin
} from "../../../../lib/control/auth";
import { encryptPayload } from "../../../../lib/control/crypto";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROCESS_TARGETS = new Set(["omar-guard", "lobby-games-bot"]);
const PROCESS_TYPES = new Set(["process.start", "process.stop", "process.restart"]);
const COMMAND_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{1,39}$/;
const SNOWFLAKE_PATTERN = /^\d{15,25}$/;
const GAME_KEYS = new Set([
  "mafia", "roulette", "spy", "xoteams", "xo", "spin", "dice",
  "guess", "guesscountry", "fasttype", "math", "sortnumbers"
]);

function idList(value) {
  if (!Array.isArray(value)) return [];
  const ids = Array.from(new Set(value.map(String).filter((item) => SNOWFLAKE_PATTERN.test(item))));
  if (ids.length > 20) {
    throw new AccessError("A maximum of 20 role or channel IDs is allowed.", 400, "TOO_MANY_IDS");
  }
  return ids;
}

function validateCommand(body) {
  const type = String(body?.type || "");
  const target = body?.target ? String(body.target) : null;

  if (PROCESS_TYPES.has(type)) {
    if (!PROCESS_TARGETS.has(target)) {
      throw new AccessError("Invalid process target.", 400, "INVALID_TARGET");
    }

    return { type, target, payload: {} };
  }

  if (type === "status.refresh" || type === "logs.refresh") {
    return { type, target: null, payload: {} };
  }

  if (type === "dm.send") {
    const userId = String(body?.payload?.userId || "").trim();
    const content = String(body?.payload?.content || "").trim();

    if (!/^\d{15,25}$/.test(userId)) {
      throw new AccessError("Discord User ID is invalid.", 400, "INVALID_USER_ID");
    }

    if (!content || content.length > 1800) {
      throw new AccessError("Message must contain 1 to 1800 characters.", 400, "INVALID_MESSAGE");
    }

    return { type, target: "lobby-games-bot", payload: { userId, content } };
  }

  if (type === "command.policy.update") {
    if (!PROCESS_TARGETS.has(target)) {
      throw new AccessError("Invalid command target.", 400, "INVALID_TARGET");
    }

    const commandName = String(body?.payload?.commandName || "").trim().toLowerCase();
    const cooldownSeconds = Number.parseInt(body?.payload?.cooldownSeconds ?? 0, 10);
    if (!COMMAND_NAME_PATTERN.test(commandName)) {
      throw new AccessError("Invalid command name.", 400, "INVALID_COMMAND_NAME");
    }
    if (!Number.isSafeInteger(cooldownSeconds) || cooldownSeconds < 0 || cooldownSeconds > 3600) {
      throw new AccessError("Cooldown must be between 0 and 3600 seconds.", 400, "INVALID_COOLDOWN");
    }

    return {
      type,
      target,
      payload: {
        commandName,
        enabled: body?.payload?.enabled !== false,
        cooldownSeconds,
        allowedRoleIds: idList(body?.payload?.allowedRoleIds),
        allowedChannelIds: idList(body?.payload?.allowedChannelIds)
      }
    };
  }

  if (type === "guard.mode.set") {
    const mode = String(body?.payload?.mode || "");
    if (!["Passive", "Active", "Lockdown"].includes(mode)) {
      throw new AccessError("Invalid protection mode.", 400, "INVALID_MODE");
    }
    return { type, target: "omar-guard", payload: { mode } };
  }

  if (type === "games.settings.update") {
    const gameKey = String(body?.payload?.gameKey || "").toLowerCase();
    if (!GAME_KEYS.has(gameKey)) {
      throw new AccessError("Invalid game key.", 400, "INVALID_GAME");
    }

    const payload = { gameKey };
    if (typeof body?.payload?.enabled === "boolean") payload.enabled = body.payload.enabled;
    if (body?.payload?.rewardMultiplier !== undefined) {
      const multiplier = Number(body.payload.rewardMultiplier);
      if (!Number.isFinite(multiplier) || multiplier < 0.1 || multiplier > 5) {
        throw new AccessError("Reward multiplier must be between 0.1 and 5.", 400, "INVALID_MULTIPLIER");
      }
      payload.rewardMultiplier = multiplier;
    }
    if (body?.payload?.turnTimeoutSeconds !== undefined) {
      const seconds = Number(body.payload.turnTimeoutSeconds);
      if (!Number.isSafeInteger(seconds) || seconds < 10 || seconds > 300) {
        throw new AccessError("Turn timeout must be between 10 and 300 seconds.", 400, "INVALID_TIMEOUT");
      }
      payload.turnTimeoutSeconds = seconds;
    }
    return { type, target: "lobby-games-bot", payload };
  }

  throw new AccessError("Unsupported command.", 400, "INVALID_COMMAND");
}

async function enforceRateLimit(supabase, user, command) {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count, error } = await supabase
    .from("control_commands")
    .select("id", { count: "exact", head: true })
    .eq("requested_by", user.discordId)
    .gte("created_at", oneMinuteAgo);

  if (error) {
    throw error;
  }

  if ((count || 0) >= 8) {
    throw new AccessError("Too many control actions. Wait one minute.", 429, "RATE_LIMITED");
  }

  if (command.type === "dm.send") {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60000).toISOString();
    const { count: dmCount, error: dmError } = await supabase
      .from("control_commands")
      .select("id", { count: "exact", head: true })
      .eq("requested_by", user.discordId)
      .eq("type", "dm.send")
      .gte("created_at", tenMinutesAgo);

    if (dmError) {
      throw dmError;
    }

    if ((dmCount || 0) >= 5) {
      throw new AccessError("Discord DM limit reached. Wait before sending again.", 429, "DM_RATE_LIMITED");
    }
  }
}

export async function POST(request) {
  try {
    validateSameOrigin(request);
    const user = await requireAdmin();
    const command = validateCommand(await request.json());
    const supabase = createAdminClient();

    await enforceRateLimit(supabase, user, command);

    const encrypted = encryptPayload(command.payload);
    const expiresAt = new Date(
      Date.now() + (command.type === "dm.send" ? 15 : 5) * 60000
    ).toISOString();

    const { data, error } = await supabase
      .from("control_commands")
      .insert({
        type: command.type,
        target: command.target,
        ...encrypted,
        requested_by: user.discordId,
        requested_by_name: user.name,
        expires_at: expiresAt
      })
      .select("id,type,target,status,created_at")
      .single();

    if (error) {
      throw error;
    }

    const auditMetadata = command.type === "dm.send"
      ? {
          recipientId: command.payload.userId,
          messageLength: command.payload.content.length
        }
      : command.type === "command.policy.update"
        ? { commandName: command.payload.commandName, enabled: command.payload.enabled }
        : command.type === "guard.mode.set"
          ? { mode: command.payload.mode }
          : command.type === "games.settings.update"
            ? { gameKey: command.payload.gameKey }
            : {};

    await supabase.from("control_audit_log").insert({
      actor_discord_id: user.discordId,
      actor_name: user.name,
      action: command.type,
      target: command.target,
      command_id: data.id,
      metadata: auditMetadata
    });

    return NextResponse.json({ ok: true, command: data }, { status: 202 });
  } catch (error) {
    const status = error instanceof AccessError ? error.status : 500;
    const message = error instanceof AccessError ? error.message : "Could not queue command.";

    if (!(error instanceof AccessError)) {
      console.error("[Control] Command queue failed:", error?.message || error);
    }

    return NextResponse.json({ error: message, code: error?.code || "COMMAND_FAILED" }, { status });
  }
}
