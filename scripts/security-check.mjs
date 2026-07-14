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
  logs: { "omar-guard": { out: `token=${fakeToken}` } }
});

assert.equal(snapshot.processes.length, 1);
assert.equal(snapshot.processes[0].name, "omar-guard");
assert(!snapshot.logs["omar-guard"].out.includes(fakeToken));

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
for (const key of ["SUPABASE_SERVICE_ROLE_KEY", "CONTROL_AGENT_SECRET", "CONTROL_PAYLOAD_ENCRYPTION_KEY"]) {
  assert(!envExample.includes(`NEXT_PUBLIC_${key}`), `${key} must remain server-only.`);
}

console.log("Dashboard security checks passed.");
