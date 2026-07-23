const ALLOWED_PROCESSES = new Set(["omar-guard", "lobby-games-bot", "andonis-games-bot"]);
const RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);
const COMMAND_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{1,39}$/;
const SNOWFLAKE_PATTERN = /^\d{15,25}$/;
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

function safeIds(value) {
  return Array.isArray(value)
    ? Array.from(new Set(value.map(String).filter((item) => SNOWFLAKE_PATTERN.test(item)))).slice(0, 20)
    : [];
}

function safeBytes(value) {
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(finite(value))));
}

function sanitizeCounter(value) {
  return {
    uploadBytes: safeBytes(value?.uploadBytes),
    downloadBytes: safeBytes(value?.downloadBytes)
  };
}

function sanitizeNetworkUsage(value, expectedName) {
  if (!value || value.name !== expectedName || value.available !== true) {
    return { name: expectedName, available: false };
  }

  return {
    name: expectedName,
    available: true,
    measuredAt: value.measuredAt ? safeText(value.measuredAt, 40) : null,
    sessionStartedAt: value.sessionStartedAt ? safeText(value.sessionStartedAt, 40) : null,
    session: sanitizeCounter(value.session),
    day: {
      key: /^\d{4}-\d{2}-\d{2}$/.test(String(value.day?.key || "")) ? value.day.key : null,
      ...sanitizeCounter(value.day)
    },
    month: {
      key: /^\d{4}-\d{2}$/.test(String(value.month?.key || "")) ? value.month.key : null,
      ...sanitizeCounter(value.month)
    },
    lifetime: sanitizeCounter(value.lifetime),
    scope: value.scope === "sync-payload" ? "sync-payload" : "process-sockets"
  };
}

function sanitizeNetwork(value) {
  const sourceProcesses = Array.isArray(value?.processes) ? value.processes : [];
  const processes = {};

  for (const name of ALLOWED_PROCESSES) {
    processes[name] = sanitizeNetworkUsage(
      sourceProcesses.find((item) => item?.name === name),
      name
    );
  }

  return {
    measuredAt: value?.measuredAt ? safeText(value.measuredAt, 40) : null,
    processes,
    agent: sanitizeNetworkUsage(value?.agent, "team-lobby-agent"),
    optimization: {
      pollIntervalMs: Math.min(60000, Math.max(0, finite(value?.optimization?.pollIntervalMs))),
      fullSnapshotIntervalMs: Math.min(
        600000,
        Math.max(0, finite(value?.optimization?.fullSnapshotIntervalMs))
      ),
      fullSnapshot: Boolean(value?.optimization?.fullSnapshot)
    }
  };
}

function sanitizeControl(control) {
  const bots = {};

  for (const target of ALLOWED_PROCESSES) {
    const source = control?.bots?.[target] || {};
    const catalog = Array.isArray(source.catalog)
      ? source.catalog
          .filter((item) => COMMAND_NAME_PATTERN.test(String(item?.name || "")))
          .slice(0, 80)
          .map((item) => ({
            name: safeText(item.name, 40),
            group: safeText(item.group || "other", 40),
            label: {
              en: safeText(item.label?.en || item.name, 100),
              ar: safeText(item.label?.ar || item.name, 100)
            },
            risk: RISK_LEVELS.has(item.risk) ? item.risk : "low",
            game: Boolean(item.game)
          }))
      : [];

    const allowedNames = new Set(catalog.map((item) => item.name));
    const commands = {};

    for (const name of allowedNames) {
      const entry = source.policy?.commands?.[name] || {};
      commands[name] = {
        enabled: entry.enabled !== false,
        cooldownSeconds: Math.min(3600, Math.max(0, finite(entry.cooldownSeconds))),
        allowedRoleIds: safeIds(entry.allowedRoleIds),
        allowedChannelIds: safeIds(entry.allowedChannelIds)
      };
    }

    const status = target === "omar-guard"
      ? {
          protectionMode: ["Passive", "Active", "Lockdown"].includes(source.status?.protectionMode)
            ? source.status.protectionMode
            : null,
          trustedBotCount: finite(source.status?.trustedBotCount),
          updatedAt: source.status?.updatedAt || null
        }
      : {
          games: Array.isArray(source.status?.games)
            ? source.status.games.slice(0, 30).map((game) => ({
                gameKey: safeText(game?.gameKey, 40),
                enabled: game?.enabled !== false,
                rewardMultiplier: Math.min(5, Math.max(0.1, finite(game?.rewardMultiplier, 1))),
                turnTimeoutSeconds: game?.turnTimeoutSeconds == null
                  ? null
                  : Math.min(300, Math.max(10, finite(game.turnTimeoutSeconds)))
              }))
            : [],
          updatedAt: source.status?.updatedAt || null
        };

    bots[target] = {
      catalog,
      policy: {
        version: 1,
        updatedAt: source.policy?.updatedAt || null,
        commands
      },
      status
    };
  }

  return { bots };
}

export function sanitizeSnapshot(snapshot) {
  const hasInclusionMap = snapshot?.included && typeof snapshot.included === "object";
  const included = {
    logs: hasInclusionMap ? Boolean(snapshot.included.logs) : snapshot?.logs != null,
    discord: hasInclusionMap ? Boolean(snapshot.included.discord) : snapshot?.discord != null,
    control: hasInclusionMap ? Boolean(snapshot.included.control) : snapshot?.control != null
  };

  const processes = Array.isArray(snapshot?.processes)
    ? snapshot.processes
        .filter((item) => ALLOWED_PROCESSES.has(item?.name))
        .slice(0, ALLOWED_PROCESSES.size)
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

  const logs = included.logs ? {} : null;
  if (logs) {
    for (const name of ALLOWED_PROCESSES) {
      logs[name] = {
        out: safeText(snapshot?.logs?.[name]?.out),
        error: safeText(snapshot?.logs?.[name]?.error)
      };
    }
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
        : [],
      network: sanitizeNetwork(snapshot?.network)
    },
    processes,
    logs,
    discord: included.discord ? {
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
    } : null,
    control: included.control ? sanitizeControl(snapshot?.control || {}) : null,
    included
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
