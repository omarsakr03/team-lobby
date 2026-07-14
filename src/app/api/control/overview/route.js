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

export async function GET() {
  try {
    const user = await requireAdmin();
    const supabase = createAdminClient();
    const agentId = process.env.CONTROL_AGENT_ID;

    const [statusResult, commandResult, auditResult] = await Promise.all([
      supabase
        .from("control_agent_status")
        .select("agent_id,version,last_seen_at,observed_at,system,processes,discord,logs")
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
              logs: status.logs
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
              logs: {}
            },
        commands: (commandResult.data || []).map(publicCommand),
        audit: auditResult.data || [],
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
