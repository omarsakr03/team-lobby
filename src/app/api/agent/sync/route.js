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

    const { error: statusError } = await supabase
      .from("control_agent_status")
      .upsert({
        agent_id: agentId,
        version: snapshot.version,
        last_seen_at: new Date().toISOString(),
        observed_at: snapshot.observedAt,
        system: snapshot.system,
        processes: snapshot.processes,
        discord: snapshot.discord,
        logs: snapshot.logs,
        updated_at: new Date().toISOString()
      });

    if (statusError) {
      throw statusError;
    }

    const acknowledgedCompletionIds = [];

    for (const completion of completions) {
      if (!isUuid(completion.id)) {
        continue;
      }

      const { data, error } = await supabase
        .from("control_commands")
        .update({
          status: completion.status,
          result: completion.result,
          error_code: completion.errorCode,
          error_message: completion.errorMessage,
          completed_at: completion.completedAt
        })
        .eq("id", completion.id)
        .eq("claimed_by", agentId)
        .eq("status", "claimed")
        .select("id")
        .maybeSingle();

      if (!error && data?.id) {
        acknowledgedCompletionIds.push(data.id);
      }
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
            completed_at: new Date().toISOString()
          })
          .eq("id", row.id)
          .eq("claimed_by", agentId);
      }
    }

    return NextResponse.json({
      ok: true,
      serverTime: new Date().toISOString(),
      acknowledgedCompletionIds,
      commands
    });
  } catch (error) {
    console.error("[Control] Agent sync failed:", error?.message || error);
    return NextResponse.json({ error: "Agent sync failed." }, { status: 500 });
  }
}
