import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";

process.env.CONTROL_PAYLOAD_ENCRYPTION_KEY = randomBytes(32).toString("base64");

const { encryptPayload, decryptPayload } = await import("../src/lib/control/crypto.js");
const { sanitizeSnapshot } = await import("../src/lib/control/sanitize.js");
const { resolveInternalRedirect } = await import("../src/lib/control/redirect.js");

assert.equal(
  resolveInternalRedirect("/admin?tab=logs", "https://team-lobby.ddns.net"),
  "/admin?tab=logs"
);
assert.equal(
  resolveInternalRedirect("//evil.example", "https://team-lobby.ddns.net"),
  "/admin"
);
assert.equal(
  resolveInternalRedirect("/\\evil.example", "https://team-lobby.ddns.net"),
  "/admin"
);

const sensitive = {
  userId: "538241496630165515",
  content: "private dashboard message"
};
const encrypted = encryptPayload(sensitive);

assert(!encrypted.payload_ciphertext.includes(sensitive.content));
assert.deepEqual(decryptPayload(encrypted), sensitive);

assert.throws(() => decryptPayload({
  ...encrypted,
  payload_tag: Buffer.from(randomBytes(16)).toString("base64")
}));

const fakeToken = `${"M".repeat(24)}.${"a".repeat(6)}.${"b".repeat(28)}`;
const snapshot = sanitizeSnapshot({
  processes: [{ name: "omar-guard", status: "online" }, { name: "not-allowed", status: "online" }],
  system: {
    fleet: {
      healthy: 1,
      components: [
        {
          name: "omar-guard",
          installed: true,
          version: "1.0.0",
          entrypointReady: true,
          controllable: true,
          processStatus: "online",
          heartbeat: { updatedAt: "2026-07-23T00:00:00.000Z", ageSeconds: 4, fresh: true },
          runtime: {
            component: "omar-guard",
            version: "1.0.0",
            ready: true,
            capabilities: ["process-health", "../../unsafe"]
          }
        },
        { name: "../../unsafe", installed: true }
      ]
    }
  },
  logs: { "omar-guard": { out: `token=${fakeToken}` } },
  network: {
    processes: [{
      name: "omar-guard",
      available: true,
      day: { key: "2026-07-16", uploadBytes: 100, downloadBytes: 200 },
      month: { key: "2026-07", uploadBytes: 300, downloadBytes: 400 },
      lifetime: { uploadBytes: 500, downloadBytes: 600 }
    }],
    agent: {
      name: "team-lobby-agent",
      available: true,
      scope: "sync-payload",
      day: { key: "2026-07-16", uploadBytes: 1000, downloadBytes: 2000 }
    },
    optimization: { pollIntervalMs: 5000, fullSnapshotIntervalMs: 60000 }
  },
  control: {
    bots: {
      "omar-guard": {
        catalog: [
          { name: "security", label: { en: "Security", ar: "الحماية" }, risk: "high" },
          { name: "../../shell", label: { en: "Unsafe", ar: "غير آمن" }, risk: "critical" }
        ],
        policy: {
          commands: {
            security: {
              enabled: true,
              cooldownSeconds: 99999,
              allowedRoleIds: ["538241496630165515", "not-an-id"],
              allowedChannelIds: ["123456789012345678"]
            },
            shell: { enabled: true }
          }
        },
        status: { protectionMode: "Lockdown", trustedBotCount: 2 }
      }
    }
  }
});

assert.equal(snapshot.processes.length, 1);
assert.equal(snapshot.processes[0].name, "omar-guard");
assert(!snapshot.logs["omar-guard"].out.includes(fakeToken));
assert.equal(snapshot.control.bots["omar-guard"].catalog.length, 1);
assert.deepEqual(Object.keys(snapshot.control.bots["omar-guard"].policy.commands), ["security"]);
assert.equal(snapshot.control.bots["omar-guard"].policy.commands.security.cooldownSeconds, 3600);
assert.deepEqual(snapshot.control.bots["omar-guard"].policy.commands.security.allowedRoleIds, ["538241496630165515"]);
assert.equal(snapshot.control.bots["omar-guard"].status.protectionMode, "Lockdown");
assert.equal(snapshot.system.network.processes["omar-guard"].day.downloadBytes, 200);
assert.equal(snapshot.system.network.agent.scope, "sync-payload");
assert.equal(snapshot.system.network.optimization.fullSnapshotIntervalMs, 60000);
assert.equal(snapshot.system.fleet.components.length, 1);
assert.equal(snapshot.system.fleet.components[0].version, "1.0.0");
assert.deepEqual(
  snapshot.system.fleet.components[0].runtime.capabilities,
  ["process-health"]
);

const heartbeat = sanitizeSnapshot({
  included: { logs: false, discord: false, control: false },
  processes: [{ name: "lobby-games-bot", status: "online" }]
});
assert.equal(heartbeat.logs, null);
assert.equal(heartbeat.discord, null);
assert.equal(heartbeat.control, null);

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
for (const key of ["SUPABASE_SERVICE_ROLE_KEY", "CONTROL_AGENT_SECRET", "CONTROL_PAYLOAD_ENCRYPTION_KEY"]) {
  assert(!envExample.includes(`NEXT_PUBLIC_${key}`), `${key} must remain server-only.`);
}

const syncRoute = await readFile(
  new URL("../src/app/api/agent/sync/route.js", import.meta.url),
  "utf8"
);
const controlPlaneSql = await readFile(
  new URL("../supabase/control-plane.sql", import.meta.url),
  "utf8"
);
const commandRoute = await readFile(
  new URL("../src/app/api/control/commands/route.js", import.meta.url),
  "utf8"
);
const overviewRoute = await readFile(
  new URL("../src/app/api/control/overview/route.js", import.meta.url),
  "utf8"
);
const dashboardClient = await readFile(
  new URL("../src/app/admin/dashboard-client.jsx", import.meta.url),
  "utf8"
);

assert(syncRoute.includes('"complete_control_command"'));
assert(syncRoute.includes("acknowledgedCompletionIds"));
assert(syncRoute.includes("snapshot.included.logs"));
assert(syncRoute.includes("snapshotProtocol: 2"));
assert(syncRoute.includes("readLimitedJson"));
assert(syncRoute.includes(".update(statusUpdate)"));
assert(syncRoute.includes("statusUpdate.logs"));
assert(controlPlaneSql.includes("lease_expires_at"));
assert(controlPlaneSql.includes("claim_attempts"));
assert(controlPlaneSql.includes("complete_control_command"));
assert(controlPlaneSql.includes("enforce_control_command_insert"));
assert(controlPlaneSql.includes("write_control_command_audit"));
assert(controlPlaneSql.includes("prevent_control_audit_mutation"));
assert(commandRoute.includes("recordedAudit"));
assert(commandRoute.includes("auditError"));
assert(commandRoute.includes("CONTROL_RATE_LIMITED"));
assert(commandRoute.includes("PAYLOAD_TOO_LARGE"));
assert(overviewRoute.includes("publicAudit"));
assert(dashboardClient.includes("(data?.audit || [])"));
assert(dashboardClient.includes("protectionMode === mode"));
assert(dashboardClient.includes('setConfirmAction({ type: "guard.mode.set"'));
assert(dashboardClient.includes("NetworkUsageCard"));
assert(dashboardClient.includes("network.processes"));

console.log("Dashboard security checks passed.");
