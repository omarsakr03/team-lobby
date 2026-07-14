import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function encryptionKey() {
  const encoded = process.env.CONTROL_PAYLOAD_ENCRYPTION_KEY || "";
  const key = Buffer.from(encoded, "base64");

  if (key.length !== 32) {
    throw new Error("CONTROL_PAYLOAD_ENCRYPTION_KEY must be 32 random bytes encoded as base64.");
  }

  return key;
}

export function encryptPayload(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value ?? {}), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    payload_ciphertext: ciphertext.toString("base64"),
    payload_iv: iv.toString("base64"),
    payload_tag: cipher.getAuthTag().toString("base64")
  };
}

export function decryptPayload(row) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(row.payload_iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(row.payload_tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(row.payload_ciphertext, "base64")),
    decipher.final()
  ]);

  return JSON.parse(plaintext.toString("utf8"));
}
