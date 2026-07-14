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
