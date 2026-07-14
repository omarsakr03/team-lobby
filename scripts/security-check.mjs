import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";

process.env.CONTROL_PAYLOAD_ENCRYPTION_KEY = randomBytes(32).toString("base64");

const { encryptPayload, decryptPayload } = await import("../src/lib/control/crypto.js");
const { sanitizeSnapshot } = await import("../src/lib/control/sanitize.js");

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
  logs: { "omar-guard": { out: `token=${fakeToken}` } },
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

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
for (const key of ["SUPABASE_SERVICE_ROLE_KEY", "CONTROL_AGENT_SECRET", "CONTROL_PAYLOAD_ENCRYPTION_KEY"]) {
  assert(!envExample.includes(`NEXT_PUBLIC_${key}`), `${key} must remain server-only.`);
}

console.log("Dashboard security checks passed.");
