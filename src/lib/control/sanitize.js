const ALLOWED_PROCESSES = new Set(["omar-guard", "lobby-games-bot"]);
const TOKEN_PATTERN = /\b(?:[MN][A-Za-z\d_-]{20,}\.[A-Za-z\d_-]{6}\.[A-Za-z\d_-]{20,}|mfa\.[A-Za-z\d_-]{20,})\b/g;
const SECRET_PATTERN = /\b(token|secret|password|api[_-]?key|authorization)\b(\s*[:=]\s*)([^\s,;]+)/gi;

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeText(value, maximum = 32000) {
  return String(value ?? "")
    .replace(TOKEN_PATTERN, "[REDACTED]")
    .replace(SECRET_PATTERN, "$1$2[REDACTED]")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(-maximum);
}

export function sanitizeSnapshot(snapshot) {
  const processes = Array.isArray(snapshot?.processes)
    ? snapshot.processes
        .filter((item) => ALLOWED_PROCESSES.has(item?.name))
        .slice(0, 2)
        .map((item) => ({
          name: item.name,
          status: ["online", "stopped", "errored", "launching", "missing", "unknown"].includes(item.status)
            ? item.status
            : "unknown",
          uptimeStartedAt: item.uptimeStartedAt ? finite(item.uptimeStartedAt) : null,
          restarts: finite(item.restarts),
          unstableRestarts: finite(item.unstableRestarts),
          memoryBytes: finite(item.memoryBytes),
          cpuPercent: finite(item.cpuPercent),
          version: item.version ? safeText(item.version, 40) : null
        }))
    : [];

  const logs = {};
  for (const name of ALLOWED_PROCESSES) {
    logs[name] = {
      out: safeText(snapshot?.logs?.[name]?.out),
      error: safeText(snapshot?.logs?.[name]?.error)
    };
  }

  const discord = snapshot?.discord || {};
  const guild = discord.guild || {};
  const bot = discord.bot || {};

  return {
    version: safeText(snapshot?.version || "unknown", 30),
    observedAt: snapshot?.observedAt || null,
    system: {
      platform: safeText(snapshot?.system?.platform || "unknown", 40),
      nodeVersion: safeText(snapshot?.system?.nodeVersion || "unknown", 30),
      agentUptimeSeconds: finite(snapshot?.system?.agentUptimeSeconds),
      totalMemoryBytes: finite(snapshot?.system?.totalMemoryBytes),
      usedMemoryBytes: finite(snapshot?.system?.usedMemoryBytes),
      loadAverage: Array.isArray(snapshot?.system?.loadAverage)
        ? snapshot.system.loadAverage.slice(0, 3).map((value) => finite(value))
        : []
    },
    processes,
    logs,
    discord: {
      configured: Boolean(discord.configured),
      connected: Boolean(discord.connected),
      errorCode: discord.errorCode ? safeText(discord.errorCode, 80) : null,
      bot: bot.id ? {
        id: safeText(bot.id, 25),
        username: safeText(bot.username, 80),
        avatar: bot.avatar ? safeText(bot.avatar, 100) : null
      } : null,
      guild: guild.id ? {
        id: safeText(guild.id, 25),
        name: safeText(guild.name, 100),
        icon: guild.icon ? safeText(guild.icon, 100) : null,
        memberCount: finite(guild.memberCount),
        onlineCount: finite(guild.onlineCount),
        premiumTier: finite(guild.premiumTier)
      } : null
    }
  };
}

export function sanitizeCompletion(completion) {
  const status = completion?.status === "succeeded" ? "succeeded" : "failed";
  let result = null;

  if (completion?.result && typeof completion.result === "object") {
    try {
      const encoded = JSON.stringify(completion.result);
      result = encoded.length <= 8000
        ? JSON.parse(encoded)
        : { truncated: true };
    } catch {
      result = { serializationError: true };
    }
  }

  return {
    id: String(completion?.id || ""),
    status,
    result,
    errorCode: completion?.errorCode ? safeText(completion.errorCode, 80) : null,
    errorMessage: completion?.errorMessage ? safeText(completion.errorMessage, 300) : null,
    completedAt: completion?.completedAt || new Date().toISOString()
  };
}
