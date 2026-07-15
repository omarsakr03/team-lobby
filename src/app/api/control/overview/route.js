import { NextResponse } from "next/server";
import { AccessError, requireAdmin } from "../../../../lib/control/auth";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicCommand(row) {
  return {
    id: row.id,
    type: row.type,
    target: row.target,
    status: row.status,
    requestedBy: row.requested_by_name || row.requested_by,
    result: row.result,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    completedAt: row.completed_at
  };
}

function publicAudit(row, commandById) {
  const command = row.command_id ? commandById.get(row.command_id) : null;

  return {
    id: row.id,
    type: row.action,
    target: row.target,
    actor: row.actor_name || row.actor_discord_id,
    status: command?.status || "recorded",
    errorCode: command?.error_code || null,
    errorMessage: command?.error_message || null,
    metadata: row.metadata,
    createdAt: row.created_at,
    completedAt: command?.completed_at || null
  };
}

export async function GET() {
  try {
    const user = await requireAdmin();
    const supabase = createAdminClient();
    const agentId = process.env.CONTROL_AGENT_ID;

    const [statusResult, commandResult, auditResult] = await Promise.all([
      supabase
        .from("control_agent_status")
        .select("agent_id,version,last_seen_at,observed_at,system,processes,discord,logs,control")
        .eq("agent_id", agentId)
        .maybeSingle(),
      supabase
        .from("control_commands")
        .select("id,type,target,status,requested_by,requested_by_name,result,error_code,error_message,created_at,completed_at")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("control_audit_log")
        .select("id,actor_discord_id,actor_name,action,target,command_id,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(30)
    ]);

    if (statusResult.error || commandResult.error || auditResult.error) {
      throw statusResult.error || commandResult.error || auditResult.error;
    }

    const status = statusResult.data;
    const lastSeen = status?.last_seen_at ? new Date(status.last_seen_at).getTime() : 0;
    const agentOnline = Date.now() - lastSeen < 20000;
    const commands = commandResult.data || [];
    const commandById = new Map(commands.map((command) => [command.id, command]));

    return NextResponse.json(
      {
        user,
        agent: status
          ? {
              id: status.agent_id,
              version: status.version,
              online: agentOnline,
              lastSeenAt: status.last_seen_at,
              observedAt: status.observed_at,
              system: status.system,
              processes: status.processes,
              discord: status.discord,
              logs: status.logs,
              control: status.control
            }
          : {
              id: agentId,
              version: null,
              online: false,
              lastSeenAt: null,
              observedAt: null,
              system: {},
              processes: [],
              discord: {},
              logs: {},
              control: { bots: {} }
            },
        commands: commands.map(publicCommand),
        audit: (auditResult.data || []).map((entry) => publicAudit(entry, commandById)),
        serverTime: new Date().toISOString()
      },
      {
        headers: {
          "cache-control": "private, no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    const status = error instanceof AccessError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof AccessError ? error.message : "Could not load dashboard." },
      { status }
    );
  }
}
