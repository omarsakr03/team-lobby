import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { decryptPayload } from "../../../../lib/control/crypto";
import { sanitizeCompletion, sanitizeSnapshot } from "../../../../lib/control/sanitize";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameSecret(provided, expected) {
  const left = Buffer.from(String(provided || ""));
  const right = Buffer.from(String(expected || ""));

  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

function authenticateAgent(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const agentId = request.headers.get("x-agent-id") || "";

  if (
    agentId !== process.env.CONTROL_AGENT_ID ||
    !sameSecret(token, process.env.CONTROL_AGENT_SECRET)
  ) {
    return null;
  }

  return agentId;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request) {
  const agentId = authenticateAgent(request);

  if (!agentId) {
    return NextResponse.json({ error: "Unauthorized agent." }, { status: 401 });
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > 180000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  try {
    const body = await request.json();
    const snapshot = sanitizeSnapshot(body?.snapshot || {});
    const completions = Array.isArray(body?.completions)
      ? body.completions.slice(0, 10).map(sanitizeCompletion)
      : [];
    const supabase = createAdminClient();

    const statusUpdate = {
      agent_id: agentId,
      version: snapshot.version,
      last_seen_at: new Date().toISOString(),
      observed_at: snapshot.observedAt,
      system: snapshot.system,
      processes: snapshot.processes,
      updated_at: new Date().toISOString()
    };

    if (snapshot.included.discord) statusUpdate.discord = snapshot.discord;
    if (snapshot.included.logs) statusUpdate.logs = snapshot.logs;
    if (snapshot.included.control) statusUpdate.control = snapshot.control;

    const hasFullSnapshot = snapshot.included.discord
      && snapshot.included.logs
      && snapshot.included.control;
    const statusQuery = hasFullSnapshot
      ? supabase.from("control_agent_status").upsert(statusUpdate)
      : supabase
        .from("control_agent_status")
        .update(statusUpdate)
        .eq("agent_id", agentId);
    const { error: statusError } = await statusQuery;

    if (statusError) {
      throw statusError;
    }

    const acknowledgedCompletionIds = [];
    const completionErrors = [];

    for (const completion of completions) {
      if (!isUuid(completion.id)) {
        continue;
      }

      const { data, error } = await supabase.rpc(
        "complete_control_command",
        {
          p_agent_id: agentId,
          p_command_id: completion.id,
          p_status: completion.status,
          p_result: completion.result,
          p_error_code: completion.errorCode,
          p_error_message: completion.errorMessage,
          p_completed_at: completion.completedAt
        }
      );

      if (error) {
        completionErrors.push(completion.id);
        console.error(
          `[Control] Completion ${completion.id} could not be stored:`,
          error.message
        );
        continue;
      }

      if (data === true) {
        acknowledgedCompletionIds.push(completion.id);
      }
    }

    if (completionErrors.length > 0) {
      throw new Error(
        `Could not persist ${completionErrors.length} command completion(s).`
      );
    }

    const { data: claimed, error: claimError } = await supabase.rpc(
      "claim_control_commands",
      { p_agent_id: agentId, p_limit: 5 }
    );

    if (claimError) {
      throw claimError;
    }

    const commands = [];

    for (const row of claimed || []) {
      try {
        commands.push({
          id: row.id,
          type: row.type,
          target: row.target,
          payload: decryptPayload(row),
          expiresAt: row.expires_at
        });
      } catch {
        await supabase
          .from("control_commands")
          .update({
            status: "failed",
            error_code: "PAYLOAD_DECRYPT_FAILED",
            error_message: "The command payload could not be decrypted.",
            completed_at: new Date().toISOString(),
            lease_expires_at: null
          })
          .eq("id", row.id)
          .eq("claimed_by", agentId);
      }
    }

    return NextResponse.json({
      ok: true,
      snapshotProtocol: 2,
      serverTime: new Date().toISOString(),
      acknowledgedCompletionIds,
      commands
    });
  } catch (error) {
    console.error("[Control] Agent sync failed:", error?.message || error);
    return NextResponse.json({ error: "Agent sync failed." }, { status: 500 });
  }
}
