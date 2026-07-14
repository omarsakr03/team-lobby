"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const BOT_LABELS = {
  "omar-guard": {
    title: "Omar Guard",
    subtitle: { en: "Security & moderation", ar: "ط§ظ„ط­ظ…ط§ظٹط© ظˆط§ظ„ط¥ط´ط±ط§ظپ" },
    accent: "violet",
    icon: "shield"
  },
  "lobby-games-bot": {
    title: "Lobby Games",
    subtitle: { en: "Games & community", ar: "ط§ظ„ط£ظ„ط¹ط§ط¨ ظˆط§ظ„ظ…ط¬طھظ…ط¹" },
    accent: "cyan",
    icon: "bot"
  }
};

const COPY = {
  en: {
    overview: "Overview", bots: "Bots", commands: "Commands", operations: "Operations",
    logs: "Logs", messages: "Direct messages", audit: "Audit trail", publicSite: "Public site",
    commandCenter: "Command center", workspace: "TEAM LOBBY / CONTROL CENTER V2",
    signOut: "Sign out", agentOnline: "Agent online", agentOffline: "Agent offline",
    liveOperations: "LIVE OPERATIONS", platformOverview: "Platform overview",
    autoRefresh: "Auto-refreshes every five seconds", lastSignal: "Last agent signal",
    botHealth: "BOT HEALTH", processesOnline: "processes online", members: "MEMBERS",
    currentlyOnline: "currently online", agentMemory: "AGENT MEMORY", controlLink: "CONTROL LINK",
    live: "Live", offline: "Offline", commandCoverage: "COMMAND COVERAGE", managedCommands: "managed commands",
    processControl: "PROCESS CONTROL", discordBots: "Discord bots",
    processNote: "Only the two whitelisted PM2 processes can be controlled.",
    uptime: "UPTIME", memory: "MEMORY", cpu: "CPU", restarts: "RESTARTS",
    start: "Start", restart: "Restart", stop: "Stop", queuing: "Queuingâ€¦",
    commandRegistry: "COMMAND REGISTRY", botCommands: "Bot commands",
    commandIntro: "Enable commands, set cooldowns, and restrict access to Discord roles or channels.",
    searchCommands: "Search commandsâ€¦", allBots: "All bots", allGroups: "All groups",
    enabled: "Enabled", disabled: "Disabled", configure: "Configure", cooldown: "Cooldown",
    unrestricted: "No restrictions", restricted: "Restricted", seconds: "seconds",
    commandSettings: "Command settings", commandState: "Command state",
    allowedRoles: "Allowed role IDs", allowedChannels: "Allowed channel IDs",
    idsHint: "Comma or space separated Discord IDs. Leave empty to allow all.",
    cancel: "Cancel", savePolicy: "Save policy", policyQueued: "Command policy queued securely.",
    riskLow: "Low risk", riskMedium: "Medium risk", riskHigh: "High risk", riskCritical: "Critical",
    operationsDesk: "OPERATIONS DESK", safeActions: "Safe actions",
    operationsIntro: "Approved actions only. Every change is validated locally and written to the audit trail.",
    guardMode: "Omar Guard protection mode", guardModeIntro: "Change the live protection posture without exposing the bot token.",
    passive: "Passive", active: "Active", lockdown: "Lockdown", current: "Current",
    applyMode: "Apply mode", gameTuning: "Lobby Games tuning",
    gameTuningIntro: "Control availability, reward multipliers, and turn timeouts for each game.",
    reward: "Reward multiplier", turnTimeout: "Turn timeout", saveGame: "Save game settings",
    gameQueued: "Game settings queued securely.", modeQueued: "Protection mode queued securely.",
    safeLogStream: "SAFE LOG STREAM", runtimeLogs: "Runtime logs", refresh: "Refresh",
    output: "Output", errors: "Errors", noLogs: "No log lines available.",
    logsSafe: "Secrets and Discord token patterns are redacted on the Windows agent and checked again by the server.",
    ownerWorkflow: "OWNER-APPROVED WORKFLOW", dmCenter: "Discord DM center",
    dmIntro: "Send a direct message through Lobby Games. Content is encrypted while queued and every action is audited.",
    maxCharacters: "Maximum 1,800 characters", rateLimit: "Five messages per 10 minutes",
    reviewRequired: "Explicit review before sending", discordUserId: "Discord User ID",
    message: "Message", writeMessage: "Write the private messageâ€¦", reviewMessage: "Review message",
    immutableHistory: "IMMUTABLE HISTORY", recentActivity: "Recent activity",
    auditIntro: "Actions are recorded without storing plaintext DM content in the audit log.",
    action: "ACTION", target: "TARGET", status: "STATUS", when: "WHEN", noActions: "No control actions yet.",
    confirmAction: "Confirm action", confirmationText: "This action can briefly affect service availability and will be audited.",
    confirm: "Confirm", reviewPrivate: "Review private message", recipient: "Recipient",
    editMessage: "Edit message", encryptSend: "Encrypt & send", commandQueued: "Command queued securely.",
    retry: "Retry", loading: "Loading control centerâ€¦", windowsOffline: "Windows agent is offline.",
    queuedOffline: "Control actions will remain queued until it reconnects.", noMatches: "No commands match these filters.",
    policyUpdated: "Policy updated", gameSettings: "Game settings", protectionStatus: "Protection status",
    activeCommands: "active", roles: "roles", channels: "channels"
  },
  ar: {
    overview: "ظ†ط¸ط±ط© ط¹ط§ظ…ط©", bots: "ط§ظ„ط¨ظˆطھط§طھ", commands: "ط§ظ„ط£ظˆط§ظ…ط±", operations: "ط§ظ„ط¹ظ…ظ„ظٹط§طھ",
    logs: "ط§ظ„ط³ط¬ظ„ط§طھ", messages: "ط§ظ„ط±ط³ط§ط¦ظ„ ط§ظ„ط®ط§طµط©", audit: "ط³ط¬ظ„ ط§ظ„طھط¯ظ‚ظٹظ‚", publicSite: "ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط¹ط§ظ…",
    commandCenter: "ظ…ط±ظƒط² ط§ظ„ظ‚ظٹط§ط¯ط©", workspace: "TEAM LOBBY / ظ…ط±ظƒط² ط§ظ„طھط­ظƒظ… V2",
    signOut: "طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬", agentOnline: "ط§ظ„ظˆظƒظٹظ„ ظ…طھطµظ„", agentOffline: "ط§ظ„ظˆظƒظٹظ„ ط؛ظٹط± ظ…طھطµظ„",
    liveOperations: "ط§ظ„ط¹ظ…ظ„ظٹط§طھ ط§ظ„ظ…ط¨ط§ط´ط±ط©", platformOverview: "ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ„ظ‰ ط§ظ„ظ…ظ†طµط©",
    autoRefresh: "طھط­ط¯ظٹط« طھظ„ظ‚ط§ط¦ظٹ ظƒظ„ ط®ظ…ط³ ط«ظˆط§ظ†ظچ", lastSignal: "ط¢ط®ط± ط¥ط´ط§ط±ط© ظ„ظ„ظˆظƒظٹظ„",
    botHealth: "طµط­ط© ط§ظ„ط¨ظˆطھط§طھ", processesOnline: "ط¹ظ…ظ„ظٹط© ظ…طھطµظ„ط©", members: "ط§ظ„ط£ط¹ط¶ط§ط،",
    currentlyOnline: "ظ…طھطµظ„ ط§ظ„ط¢ظ†", agentMemory: "ط°ط§ظƒط±ط© ط§ظ„ظˆظƒظٹظ„", controlLink: "ط±ط§ط¨ط· ط§ظ„طھط­ظƒظ…",
    live: "ظ…طھطµظ„", offline: "ط؛ظٹط± ظ…طھطµظ„", commandCoverage: "طھط؛ط·ظٹط© ط§ظ„ط£ظˆط§ظ…ط±", managedCommands: "ط£ظ…ط± ظ…ظڈط¯ط§ط±",
    processControl: "ط§ظ„طھط­ظƒظ… ظپظٹ ط§ظ„ط¹ظ…ظ„ظٹط§طھ", discordBots: "ط¨ظˆطھط§طھ Discord",
    processNote: "ط§ظ„طھط­ظƒظ… ظ…ظ‚طµظˆط± ط¹ظ„ظ‰ ط¹ظ…ظ„ظٹطھظٹ PM2 ط§ظ„ظ…ط³ظ…ظˆط­ ط¨ظ‡ظ…ط§ ظپظ‚ط·.",
    uptime: "ظ…ط¯ط© ط§ظ„طھط´ط؛ظٹظ„", memory: "ط§ظ„ط°ط§ظƒط±ط©", cpu: "ط§ظ„ظ…ط¹ط§ظ„ط¬", restarts: "ط¥ط¹ط§ط¯ط§طھ ط§ظ„طھط´ط؛ظٹظ„",
    start: "طھط´ط؛ظٹظ„", restart: "ط¥ط¹ط§ط¯ط© طھط´ط؛ظٹظ„", stop: "ط¥ظٹظ‚ط§ظپ", queuing: "ط¬ط§ط±ظچ ط§ظ„ط¥ط±ط³ط§ظ„â€¦",
    commandRegistry: "ط³ط¬ظ„ ط§ظ„ط£ظˆط§ظ…ط±", botCommands: "ط£ظˆط§ظ…ط± ط§ظ„ط¨ظˆطھط§طھ",
    commandIntro: "ظپط¹ظ‘ظ„ ط§ظ„ط£ظˆط§ظ…ط± ط£ظˆ ط¹ط·ظ‘ظ„ظ‡ط§ ظˆط§ط¶ط¨ط· ط§ظ„ط§ظ†طھط¸ط§ط± ظˆط§ظ„طµظ„ط§ط­ظٹط§طھ ط­ط³ط¨ ط±طھط¨ ظˆظ‚ظ†ظˆط§طھ Discord.",
    searchCommands: "ط§ط¨ط­ط« ظپظٹ ط§ظ„ط£ظˆط§ظ…ط±â€¦", allBots: "ظƒظ„ ط§ظ„ط¨ظˆطھط§طھ", allGroups: "ظƒظ„ ط§ظ„طھطµظ†ظٹظپط§طھ",
    enabled: "ظ…ظپط¹ظ‘ظ„", disabled: "ظ…ط¹ط·ظ‘ظ„", configure: "ط¥ط¹ط¯ط§ط¯", cooldown: "ظپطھط±ط© ط§ظ„ط§ظ†طھط¸ط§ط±",
    unrestricted: "ط¨ط¯ظˆظ† ظ‚ظٹظˆط¯", restricted: "ظ…ظ‚ظٹظ‘ط¯", seconds: "ط«ط§ظ†ظٹط©",
    commandSettings: "ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط£ظ…ط±", commandState: "ط­ط§ظ„ط© ط§ظ„ط£ظ…ط±",
    allowedRoles: "ظ…ط¹ط±ظپط§طھ ط§ظ„ط±طھط¨ ط§ظ„ظ…ط³ظ…ظˆط­ط©", allowedChannels: "ظ…ط¹ط±ظپط§طھ ط§ظ„ظ‚ظ†ظˆط§طھ ط§ظ„ظ…ط³ظ…ظˆط­ط©",
    idsHint: "ط§ظپطµظ„ ظ…ط¹ط±ظپط§طھ Discord ط¨ظپط§طµظ„ط© ط£ظˆ ظ…ط³ط§ظپط©. ط§طھط±ظƒ ط§ظ„ط­ظ‚ظ„ ظپط§ط±ط؛ظ‹ط§ ظ„ظ„ط³ظ…ط§ط­ ظ„ظ„ط¬ظ…ظٹط¹.",
    cancel: "ط¥ظ„ط؛ط§ط،", savePolicy: "ط­ظپط¸ ط§ظ„ط³ظٹط§ط³ط©", policyQueued: "طھظ… ط¥ط±ط³ط§ظ„ ط³ظٹط§ط³ط© ط§ظ„ط£ظ…ط± ط¨ط£ظ…ط§ظ†.",
    riskLow: "ط®ط·ظˆط±ط© ظ…ظ†ط®ظپط¶ط©", riskMedium: "ط®ط·ظˆط±ط© ظ…طھظˆط³ط·ط©", riskHigh: "ط®ط·ظˆط±ط© ط¹ط§ظ„ظٹط©", riskCritical: "ط­ط³ط§ط³ ط¬ط¯ظ‹ط§",
    operationsDesk: "ظ…ظƒطھط¨ ط§ظ„ط¹ظ…ظ„ظٹط§طھ", safeActions: "ط¥ط¬ط±ط§ط،ط§طھ ط¢ظ…ظ†ط©",
    operationsIntro: "ط¥ط¬ط±ط§ط،ط§طھ ظ…ط¹طھظ…ط¯ط© ظپظ‚ط·ط› ظƒظ„ طھط؛ظٹظٹط± ظٹظڈط±ط§ط¬ط¹ ظ…ط­ظ„ظٹظ‹ط§ ظˆظٹظڈط¶ط§ظپ ط¥ظ„ظ‰ ط³ط¬ظ„ ط§ظ„طھط¯ظ‚ظٹظ‚.",
    guardMode: "ظˆط¶ط¹ ط­ظ…ط§ظٹط© Omar Guard", guardModeIntro: "ط؛ظٹظ‘ط± ظ…ط³طھظˆظ‰ ط§ظ„ط­ظ…ط§ظٹط© ط§ظ„ظ…ط¨ط§ط´ط± ط¯ظˆظ† ظƒط´ظپ طھظˆظƒظ† ط§ظ„ط¨ظˆطھ.",
    passive: "ظ…ط±ط§ظ‚ط¨ط©", active: "ظ†ط´ط·", lockdown: "ط¥ط؛ظ„ط§ظ‚ ط£ظ…ظ†ظٹ", current: "ط§ظ„ط­ط§ظ„ظٹ",
    applyMode: "طھط·ط¨ظٹظ‚ ط§ظ„ظˆط¶ط¹", gameTuning: "ط¶ط¨ط· Lobby Games",
    gameTuningIntro: "طھط­ظƒظ… ظپظٹ طھظˆظپط± ط§ظ„ط£ظ„ط¹ط§ط¨ ظˆظ…ط¶ط§ط¹ظپ ط§ظ„ظ…ظƒط§ظپط¢طھ ظˆظ…ط¯ط© ظƒظ„ ط¯ظˆط±.",
    reward: "ظ…ط¶ط§ط¹ظپ ط§ظ„ظ…ظƒط§ظپط£ط©", turnTimeout: "ظ…ظ‡ظ„ط© ط§ظ„ط¯ظˆط±", saveGame: "ط­ظپط¸ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظ„ط¹ط¨ط©",
    gameQueued: "طھظ… ط¥ط±ط³ط§ظ„ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظ„ط¹ط¨ط© ط¨ط£ظ…ط§ظ†.", modeQueued: "طھظ… ط¥ط±ط³ط§ظ„ ظˆط¶ط¹ ط§ظ„ط­ظ…ط§ظٹط© ط¨ط£ظ…ط§ظ†.",
    safeLogStream: "ط³ط¬ظ„ ط¢ظ…ظ†", runtimeLogs: "ط³ط¬ظ„ط§طھ ط§ظ„طھط´ط؛ظٹظ„", refresh: "طھط­ط¯ظٹط«",
    output: "ط§ظ„ظ…ط®ط±ط¬ط§طھ", errors: "ط§ظ„ط£ط®ط·ط§ط،", noLogs: "ظ„ط§ طھظˆط¬ط¯ ط£ط³ط·ط± ط³ط¬ظ„ ظ…طھط§ط­ط©.",
    logsSafe: "طھظڈط­ط¬ط¨ ط§ظ„ط£ط³ط±ط§ط± ظˆط£ظ†ظ…ط§ط· طھظˆظƒظ† Discord ط¯ط§ط®ظ„ ظˆظƒظٹظ„ Windows ط«ظ… طھظڈظپط­طµ ظ…ط±ط© ط£ط®ط±ظ‰ ط¹ظ„ظ‰ ط§ظ„ط®ط§ط¯ظ….",
    ownerWorkflow: "ظ…ط³ط§ط± ظ…ط¹طھظ…ط¯ ظ…ظ† ط§ظ„ظ…ط§ظ„ظƒ", dmCenter: "ظ…ط±ظƒط² ط±ط³ط§ط¦ظ„ Discord",
    dmIntro: "ط£ط±ط³ظ„ ط±ط³ط§ظ„ط© ط®ط§طµط© ط¹ط¨ط± Lobby Gamesط› ظٹظڈط´ظپظ‘ط± ط§ظ„ظ…ط­طھظˆظ‰ ط£ط«ظ†ط§ط، ط§ظ„ط§ظ†طھط¸ط§ط± ظˆطھظڈط³ط¬ظ‘ظ„ ظƒظ„ ط¹ظ…ظ„ظٹط©.",
    maxCharacters: "ط§ظ„ط­ط¯ ط§ظ„ط£ظ‚طµظ‰ 1,800 ط­ط±ظپ", rateLimit: "ط®ظ…ط³ ط±ط³ط§ط¦ظ„ ظƒظ„ 10 ط¯ظ‚ط§ط¦ظ‚",
    reviewRequired: "ظ…ط±ط§ط¬ط¹ط© طµط±ظٹط­ط© ظ‚ط¨ظ„ ط§ظ„ط¥ط±ط³ط§ظ„", discordUserId: "Discord User ID",
    message: "ط§ظ„ط±ط³ط§ظ„ط©", writeMessage: "ط§ظƒطھط¨ ط§ظ„ط±ط³ط§ظ„ط© ط§ظ„ط®ط§طµط©â€¦", reviewMessage: "ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط±ط³ط§ظ„ط©",
    immutableHistory: "ط³ط¬ظ„ ط؛ظٹط± ظ‚ط§ط¨ظ„ ظ„ظ„طھظ„ط§ط¹ط¨", recentActivity: "ط§ظ„ظ†ط´ط§ط· ط§ظ„ط£ط®ظٹط±",
    auditIntro: "طھظڈط³ط¬ظ‘ظ„ ط§ظ„ط¹ظ…ظ„ظٹط§طھ ط¯ظˆظ† ط­ظپط¸ ظ…ط­طھظˆظ‰ ط§ظ„ط±ط³ط§ط¦ظ„ ط§ظ„ط®ط§طµط© ظƒظ†طµ طµط±ظٹط­.",
    action: "ط§ظ„ط¹ظ…ظ„ظٹط©", target: "ط§ظ„ظ‡ط¯ظپ", status: "ط§ظ„ط­ط§ظ„ط©", when: "ط§ظ„ظˆظ‚طھ", noActions: "ظ„ط§ طھظˆط¬ط¯ ط¹ظ…ظ„ظٹط§طھ طھط­ظƒظ… ط­طھظ‰ ط§ظ„ط¢ظ†.",
    confirmAction: "طھط£ظƒظٹط¯ ط§ظ„ط¹ظ…ظ„ظٹط©", confirmationText: "ظ‚ط¯ طھط¤ط«ط± ظ‡ط°ظ‡ ط§ظ„ط¹ظ…ظ„ظٹط© ظ…ط¤ظ‚طھظ‹ط§ ط¹ظ„ظ‰ طھظˆظپط± ط§ظ„ط®ط¯ظ…ط© ظˆط³ظٹطھظ… طھط³ط¬ظٹظ„ظ‡ط§.",
    confirm: "طھط£ظƒظٹط¯", reviewPrivate: "ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط±ط³ط§ظ„ط© ط§ظ„ط®ط§طµط©", recipient: "ط§ظ„ظ…ط³طھظ„ظ…",
    editMessage: "طھط¹ط¯ظٹظ„ ط§ظ„ط±ط³ط§ظ„ط©", encryptSend: "طھط´ظپظٹط± ظˆط¥ط±ط³ط§ظ„", commandQueued: "طھظ… ط¥ط±ط³ط§ظ„ ط§ظ„ط£ظ…ط± ط¨ط£ظ…ط§ظ†.",
    retry: "ط¥ط¹ط§ط¯ط© ط§ظ„ظ…ط­ط§ظˆظ„ط©", loading: "ط¬ط§ط±ظچ طھط­ظ…ظٹظ„ ظ…ط±ظƒط² ط§ظ„طھط­ظƒظ…â€¦", windowsOffline: "ظˆظƒظٹظ„ Windows ط؛ظٹط± ظ…طھطµظ„.",
    queuedOffline: "ط³طھط¸ظ„ ط£ظˆط§ظ…ط± ط§ظ„طھط­ظƒظ… ظپظٹ ط§ظ„ط§ظ†طھط¸ط§ط± ط­طھظ‰ ظٹط¹ط§ظˆط¯ ط§ظ„ط§طھطµط§ظ„.", noMatches: "ظ„ط§ طھظˆط¬ط¯ ط£ظˆط§ظ…ط± طھط·ط§ط¨ظ‚ ظ‡ط°ظ‡ ط§ظ„ظپظ„ط§طھط±.",
    policyUpdated: "طھظ… طھط­ط¯ظٹط« ط§ظ„ط³ظٹط§ط³ط©", gameSettings: "ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط£ظ„ط¹ط§ط¨", protectionStatus: "ط­ط§ظ„ط© ط§ظ„ط­ظ…ط§ظٹط©",
    activeCommands: "ظ…ظپط¹ظ‘ظ„", roles: "ط±طھط¨", channels: "ظ‚ظ†ظˆط§طھ"
  }
};

const NAV_ITEMS = [
  ["overview", "grid"], ["bots", "bot"], ["commands", "command"],
  ["operations", "sliders"], ["logs", "terminal"], ["messages", "message"], ["audit", "history"]
];

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></>,
    command: <><path d="M8 9h8M8 13h5"/><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m16 16 2 2 3-4"/></>,
    sliders: <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/></>,
    terminal: <><path d="m4 6 5 5-5 5M12 18h8"/></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/><path d="M8 10h8M8 14h5"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    refresh: <><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 10A7 7 0 0 0 6 6.5L4 9M5.5 14A7 7 0 0 0 18 17.5l2-2.5"/></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3M10 10h4v4h-4z"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    activity: <><path d="M3 12h4l2-7 4 14 2-7h6"/></>
  };
  return <svg className="admin-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Brand() {
  return <span className="admin-brand"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 42 13v22L24 45 6 35V13L24 3Z"/><path d="m24 10 11 6v14l-11 8-11-8V16l11-6Z"/><path d="M17 18h14v5h-4.5v9h-5v-9H17v-5Z"/></svg><span>TEAM <b>LOBBY</b><small>CONTROL V2</small></span></span>;
}

function formatBytes(value) {
  const number = Number(value || 0);
  if (!number) return "0 MB";
  return `${(number / 1024 / 1024).toFixed(number > 1024 ** 3 ? 0 : 1)} MB`;
}

function formatUptime(startedAt) {
  if (!startedAt) return "â€”";
  const seconds = Math.max(0, Math.floor((Date.now() - Number(startedAt)) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function timeAgo(value, locale) {
  if (!value) return locale === "ar" ? "ط£ط¨ط¯ظ‹ط§" : "never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return locale === "ar" ? "ط§ظ„ط¢ظ†" : "just now";
  if (seconds < 60) return locale === "ar" ? `ظ…ظ†ط° ${seconds}ط«` : `${seconds}s ago`;
  if (seconds < 3600) return locale === "ar" ? `ظ…ظ†ط° ${Math.floor(seconds / 60)}ط¯` : `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return locale === "ar" ? `ظ…ظ†ط° ${Math.floor(seconds / 3600)}ط³` : `${Math.floor(seconds / 3600)}h ago`;
  return locale === "ar" ? `ظ…ظ†ط° ${Math.floor(seconds / 86400)}ظٹ` : `${Math.floor(seconds / 86400)}d ago`;
}

function commandLabel(command, locale) {
  const labels = {
    "process.start": ["Started", "طھط´ط؛ظٹظ„"], "process.stop": ["Stopped", "ط¥ظٹظ‚ط§ظپ"],
    "process.restart": ["Restarted", "ط¥ط¹ط§ط¯ط© طھط´ط؛ظٹظ„"], "dm.send": ["Sent Discord DM", "ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„ط© Discord"],
    "status.refresh": ["Refreshed status", "طھط­ط¯ظٹط« ط§ظ„ط­ط§ظ„ط©"], "logs.refresh": ["Refreshed logs", "طھط­ط¯ظٹط« ط§ظ„ط³ط¬ظ„ط§طھ"],
    "command.policy.update": ["Updated command policy", "طھط­ط¯ظٹط« ط³ظٹط§ط³ط© ط£ظ…ط±"],
    "guard.mode.set": ["Changed protection mode", "طھط؛ظٹظٹط± ظˆط¶ط¹ ط§ظ„ط­ظ…ط§ظٹط©"],
    "games.settings.update": ["Updated game settings", "طھط­ط¯ظٹط« ط¥ط¹ط¯ط§ط¯ط§طھ ظ„ط¹ط¨ط©"]
  };
  return (labels[command.type] || [command.type, command.type])[locale === "ar" ? 1 : 0];
}

function splitIds(value) {
  return Array.from(new Set(String(value || "").split(/[\s,]+/).map((item) => item.trim()).filter(Boolean)));
}

function SectionTitle({ eyebrow, title, note, action }) {
  return <div className="section-title"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action || (note ? <p>{note}</p> : null)}</div>;
}

function GameSettingCard({ game, current, locale, t, busy, onSave }) {
  const [enabled, setEnabled] = useState(current?.enabled !== false);
  const [rewardMultiplier, setRewardMultiplierValue] = useState(current?.rewardMultiplier || 1);
  const [turnTimeoutSeconds, setTurnTimeoutSeconds] = useState(current?.turnTimeoutSeconds || 60);

  useEffect(() => {
    setEnabled(current?.enabled !== false);
    setRewardMultiplierValue(current?.rewardMultiplier || 1);
    setTurnTimeoutSeconds(current?.turnTimeoutSeconds || 60);
  }, [current]);

  return <article className="game-setting-card">
    <div className="game-setting-head"><div><span>{game.name.slice(0, 2).toUpperCase()}</span><div><h3>{game.label?.[locale] || game.name}</h3><code>/{game.name}</code></div></div><label className="switch"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)}/><i /></label></div>
    <div className="game-fields"><label>{t.reward}<input type="number" min="0.1" max="5" step="0.1" value={rewardMultiplier} onChange={(event) => setRewardMultiplierValue(event.target.value)}/></label><label>{t.turnTimeout}<div className="input-suffix"><input type="number" min="10" max="300" step="5" value={turnTimeoutSeconds} onChange={(event) => setTurnTimeoutSeconds(event.target.value)}/><span>s</span></div></label></div>
    <button className="save-card-button" disabled={busy} onClick={() => onSave({ gameKey: game.name, enabled, rewardMultiplier: Number(rewardMultiplier), turnTimeoutSeconds: Number(turnTimeoutSeconds) })}>{busy ? t.queuing : t.saveGame}</button>
  </article>;
}

export default function DashboardClient({ initialUser }) {
  const [locale, setLocale] = useState("ar");
  const [view, setView] = useState("overview");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(null);
  const [logTarget, setLogTarget] = useState("omar-guard");
  const [logStream, setLogStream] = useState("error");
  const [confirmAction, setConfirmAction] = useState(null);
  const [dm, setDm] = useState({ userId: "", content: "" });
  const [dmReview, setDmReview] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [commandBot, setCommandBot] = useState("all");
  const [commandGroup, setCommandGroup] = useState("all");
  const [policyEditor, setPolicyEditor] = useState(null);

  const t = COPY[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem("team-lobby-control-locale");
    if (saved === "en" || saved === "ar") setLocale(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("team-lobby-control-locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch("/api/control/overview", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        window.location.assign("/admin/login");
        return;
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Dashboard refresh failed.");
      setData(payload);
      setError("");
    } catch (loadError) {
      setError(loadError?.message || "Dashboard refresh failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => { if (!document.hidden) load(true); }, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function queueCommand(command, successText = t.commandQueued) {
    const busyKey = `${command.type}:${command.target || command.payload?.commandName || "agent"}`;
    setBusy(busyKey);
    setConfirmAction(null);
    try {
      const response = await fetch("/api/control/commands", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(command)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Command failed.");
      setToast({ kind: "success", text: successText });
      if (command.type === "dm.send") {
        setDm({ userId: "", content: "" });
        setDmReview(false);
      }
      if (command.type === "command.policy.update") setPolicyEditor(null);
      window.setTimeout(() => load(true), 900);
      window.setTimeout(() => load(true), 5500);
    } catch (commandError) {
      setToast({ kind: "error", text: commandError?.message || "Command failed." });
    } finally {
      setBusy("");
    }
  }

  const user = data?.user || initialUser;
  const agent = data?.agent || { online: false, processes: [], system: {}, discord: {}, logs: {}, control: { bots: {} } };
  const processes = useMemo(() => {
    const byName = new Map((agent.processes || []).map((item) => [item.name, item]));
    return Object.keys(BOT_LABELS).map((name) => byName.get(name) || { name, status: "missing" });
  }, [agent.processes]);
  const guild = agent.discord?.guild;
  const controlBots = agent.control?.bots || {};
  const commandCatalog = useMemo(() => Object.entries(controlBots).flatMap(([target, bot]) => (bot.catalog || []).map((command) => ({
    ...command,
    target,
    policy: bot.policy?.commands?.[command.name] || { enabled: true, cooldownSeconds: 0, allowedRoleIds: [], allowedChannelIds: [] }
  }))), [controlBots]);
  const groups = useMemo(() => Array.from(new Set(commandCatalog.map((command) => command.group))).sort(), [commandCatalog]);
  const filteredCommands = useMemo(() => commandCatalog.filter((command) => {
    const search = commandSearch.trim().toLowerCase();
    const label = `${command.name} ${command.label?.en || ""} ${command.label?.ar || ""}`.toLowerCase();
    return (!search || label.includes(search)) && (commandBot === "all" || command.target === commandBot) && (commandGroup === "all" || command.group === commandGroup);
  }), [commandCatalog, commandSearch, commandBot, commandGroup]);
  const gameCommands = controlBots["lobby-games-bot"]?.catalog?.filter((command) => command.game) || [];
  const gameStatusMap = new Map((controlBots["lobby-games-bot"]?.status?.games || []).map((game) => [game.gameKey, game]));
  const protectionMode = controlBots["omar-guard"]?.status?.protectionMode || "â€”";
  const logText = agent.logs?.[logTarget]?.[logStream] || t.noLogs;
  const enabledCommandCount = commandCatalog.filter((command) => command.policy?.enabled !== false).length;

  function openPolicy(command) {
    setPolicyEditor({
      target: command.target,
      command,
      enabled: command.policy?.enabled !== false,
      cooldownSeconds: command.policy?.cooldownSeconds || 0,
      roleText: (command.policy?.allowedRoleIds || []).join(", "),
      channelText: (command.policy?.allowedChannelIds || []).join(", ")
    });
  }

  function savePolicy() {
    queueCommand({
      type: "command.policy.update",
      target: policyEditor.target,
      payload: {
        commandName: policyEditor.command.name,
        enabled: policyEditor.enabled,
        cooldownSeconds: Number(policyEditor.cooldownSeconds),
        allowedRoleIds: splitIds(policyEditor.roleText),
        allowedChannelIds: splitIds(policyEditor.channelText)
      }
    }, t.policyQueued);
  }

  return <main className="admin-shell" dir={locale === "ar" ? "rtl" : "ltr"}>
    <aside className="admin-sidebar">
      <Brand />
      <nav aria-label="Dashboard navigation">{NAV_ITEMS.map(([id, icon]) => <button type="button" key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon name={icon}/><span>{t[id]}</span></button>)}</nav>
      <div className="admin-sidebar-foot"><Link href="/"><Icon name="external"/><span>{t.publicSite}</span></Link><span className={`agent-pill ${agent.online ? "online" : "offline"}`}><i />{agent.online ? t.agentOnline : t.agentOffline}</span></div>
    </aside>

    <div className="admin-workspace">
      <header className="admin-topbar">
        <div><span className="admin-kicker">{t.workspace}</span><h1>{t.commandCenter}</h1></div>
        <div className="admin-user">
          <button className="locale-button" type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}><Icon name="globe"/><span>{locale === "ar" ? "EN" : "ط¹ط±ط¨ظٹ"}</span></button>
          <button className="icon-button" onClick={() => load()} aria-label="Refresh dashboard" disabled={loading}><Icon name="refresh"/></button>
          <span className="admin-user-copy"><b>{user.name}</b><small>{user.discordId}</small></span>
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span className="avatar-fallback">O</span>}
          <form action="/auth/signout" method="post"><button type="submit">{t.signOut}</button></form>
        </div>
      </header>

      <div className="mobile-nav">{NAV_ITEMS.map(([id, icon]) => <button type="button" key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon name={icon}/><span>{t[id]}</span></button>)}</div>

      <div className="admin-content">
        {error && <div className="admin-banner error" role="alert">{error}<button onClick={() => load()}>{t.retry}</button></div>}
        {!agent.online && !loading && <div className="admin-banner warning"><b>{t.windowsOffline}</b> {t.queuedOffline} {t.lastSignal} {timeAgo(agent.lastSeenAt, locale)}.</div>}
        {loading && !data && <div className="admin-loading"><span/><p>{t.loading}</p></div>}

        {view === "overview" && <>
          <section className="admin-section hero-overview"><SectionTitle eyebrow={t.liveOperations} title={t.platformOverview} note={`${t.autoRefresh} آ· ${t.lastSignal} ${timeAgo(agent.lastSeenAt, locale)}`}/><div className="status-ribbon"><span className={agent.online ? "ok" : "down"}><i/>{agent.online ? t.agentOnline : t.agentOffline}</span><span><Icon name="activity"/>{processes.filter((item) => item.status === "online").length}/2 {t.processesOnline}</span><span><Icon name="command"/>{enabledCommandCount}/{commandCatalog.length} {t.activeCommands}</span></div></section>
          <section className="metric-grid">
            <article><span className="metric-icon violet"><Icon name="shield"/></span><div><small>{t.botHealth}</small><strong>{processes.filter((item) => item.status === "online").length} / 2</strong><p>{t.processesOnline}</p></div><em className="metric-glow violet"/></article>
            <article><span className="metric-icon cyan"><Icon name="users"/></span><div><small>{t.members}</small><strong>{guild?.memberCount?.toLocaleString() || "â€”"}</strong><p>{guild?.onlineCount?.toLocaleString() || "â€”"} {t.currentlyOnline}</p></div><em className="metric-glow cyan"/></article>
            <article><span className="metric-icon green"><Icon name="cpu"/></span><div><small>{t.agentMemory}</small><strong>{formatBytes(agent.system?.usedMemoryBytes)}</strong><p>Node {agent.system?.nodeVersion || "â€”"}</p></div><em className="metric-glow green"/></article>
            <article><span className="metric-icon violet"><Icon name="command"/></span><div><small>{t.commandCoverage}</small><strong>{enabledCommandCount} / {commandCatalog.length || "â€”"}</strong><p>{t.managedCommands}</p></div><em className="metric-glow violet"/></article>
          </section>
          <section className="admin-section overview-split"><div className="overview-panel"><SectionTitle eyebrow={t.processControl} title={t.discordBots}/><div className="compact-bots">{processes.map((processItem) => { const label = BOT_LABELS[processItem.name]; return <button key={processItem.name} onClick={() => setView("bots")}><span className={`bot-emblem ${label.accent}`}><Icon name={label.icon}/></span><div><b>{label.title}</b><small>{label.subtitle[locale]}</small></div><em className={`status-badge ${processItem.status}`}><i/>{processItem.status}</em></button>; })}</div></div><div className="overview-panel"><SectionTitle eyebrow={t.immutableHistory} title={t.recentActivity}/><div className="activity-list">{(data?.commands || []).slice(0, 5).map((command) => <div key={command.id}><span><i/>{commandLabel(command, locale)}</span><b className={`command-status ${command.status}`}>{command.status}</b><time>{timeAgo(command.createdAt, locale)}</time></div>)}</div></div></section>
        </>}

        {view === "bots" && <section className="admin-section"><SectionTitle eyebrow={t.processControl} title={t.discordBots} note={t.processNote}/><div className="bot-grid">{processes.map((processItem) => { const label = BOT_LABELS[processItem.name]; const isOnline = processItem.status === "online"; return <article className={`bot-card ${label.accent}`} key={processItem.name}><div className="bot-head"><span className="bot-emblem"><Icon name={label.icon}/></span><div><h3>{label.title}</h3><p>{label.subtitle[locale]}</p></div><span className={`status-badge ${processItem.status}`}><i/>{processItem.status}</span></div><div className="bot-stats"><span><small>{t.uptime}</small><b>{formatUptime(processItem.uptimeStartedAt)}</b></span><span><small>{t.memory}</small><b>{formatBytes(processItem.memoryBytes)}</b></span><span><small>{t.cpu}</small><b>{Number(processItem.cpuPercent || 0).toFixed(1)}%</b></span><span><small>{t.restarts}</small><b>{processItem.restarts || 0}</b></span></div><div className="bot-actions"><button className="start" disabled={!agent.online || isOnline || Boolean(busy)} onClick={() => queueCommand({ type: "process.start", target: processItem.name })}>{busy === `process.start:${processItem.name}` ? t.queuing : t.start}</button><button disabled={!agent.online || !isOnline || Boolean(busy)} onClick={() => setConfirmAction({ type: "process.restart", target: processItem.name, title: label.title })}>{t.restart}</button><button className="danger" disabled={!agent.online || !isOnline || Boolean(busy)} onClick={() => setConfirmAction({ type: "process.stop", target: processItem.name, title: label.title })}>{t.stop}</button></div></article>; })}</div></section>}

        {view === "commands" && <section className="admin-section"><SectionTitle eyebrow={t.commandRegistry} title={t.botCommands} note={t.commandIntro}/><div className="command-toolbar"><label className="command-search"><Icon name="search"/><input value={commandSearch} onChange={(event) => setCommandSearch(event.target.value)} placeholder={t.searchCommands}/></label><select value={commandBot} onChange={(event) => setCommandBot(event.target.value)}><option value="all">{t.allBots}</option>{Object.entries(BOT_LABELS).map(([id, label]) => <option key={id} value={id}>{label.title}</option>)}</select><select value={commandGroup} onChange={(event) => setCommandGroup(event.target.value)}><option value="all">{t.allGroups}</option>{groups.map((group) => <option key={group} value={group}>{group}</option>)}</select><span className="command-count">{filteredCommands.length}</span></div><div className="command-grid">{filteredCommands.map((command) => { const restricted = command.policy.allowedRoleIds?.length || command.policy.allowedChannelIds?.length; return <article className={`command-card risk-${command.risk}`} key={`${command.target}:${command.name}`}><div className="command-card-top"><span className={`command-bot-dot ${BOT_LABELS[command.target]?.accent}`}/><code>/{command.name}</code><span className={`risk-pill ${command.risk}`}>{t[`risk${command.risk[0].toUpperCase()}${command.risk.slice(1)}`]}</span></div><h3>{command.label?.[locale] || command.name}</h3><p>{BOT_LABELS[command.target]?.title} آ· {command.group}</p><div className="policy-summary"><span className={command.policy.enabled !== false ? "on" : "off"}><i/>{command.policy.enabled !== false ? t.enabled : t.disabled}</span><span><Icon name="activity"/>{command.policy.cooldownSeconds || 0}s</span><span><Icon name="lock"/>{restricted ? t.restricted : t.unrestricted}</span></div><button onClick={() => openPolicy(command)}><Icon name="sliders"/>{t.configure}</button></article>; })}{!filteredCommands.length && <p className="empty-state">{t.noMatches}</p>}</div></section>}

        {view === "operations" && <><section className="admin-section"><SectionTitle eyebrow={t.operationsDesk} title={t.safeActions} note={t.operationsIntro}/><div className="guard-mode-panel"><div className="guard-mode-copy"><span className="bot-emblem violet"><Icon name="shield"/></span><div><small>{t.protectionStatus}</small><h3>{t.guardMode}</h3><p>{t.guardModeIntro}</p></div><strong>{t.current}: {protectionMode}</strong></div><div className="mode-buttons">{[["Passive", "passive"], ["Active", "active"], ["Lockdown", "lockdown"]].map(([mode, key]) => <button key={mode} className={`${mode.toLowerCase()} ${protectionMode === mode ? "selected" : ""}`} disabled={!agent.online || Boolean(busy)} onClick={() => mode === "Lockdown" ? setConfirmAction({ type: "guard.mode.set", target: "omar-guard", payload: { mode }, title: t.lockdown }) : queueCommand({ type: "guard.mode.set", target: "omar-guard", payload: { mode } }, t.modeQueued)}><i/>{t[key]}{protectionMode === mode && <small>{t.current}</small>}</button>)}</div></div></section><section className="admin-section"><SectionTitle eyebrow={t.gameSettings} title={t.gameTuning} note={t.gameTuningIntro}/><div className="game-settings-grid">{gameCommands.map((game) => <GameSettingCard key={game.name} game={game} current={gameStatusMap.get(game.name)} locale={locale} t={t} busy={busy === "games.settings.update:lobby-games-bot"} onSave={(payload) => queueCommand({ type: "games.settings.update", target: "lobby-games-bot", payload }, t.gameQueued)}/>)}</div></section></>}

        {view === "logs" && <section className="admin-section"><SectionTitle eyebrow={t.safeLogStream} title={t.runtimeLogs} action={<button className="outline-button" disabled={!agent.online || Boolean(busy)} onClick={() => queueCommand({ type: "logs.refresh" })}><Icon name="refresh"/>{t.refresh}</button>}/><div className="log-panel"><div className="log-toolbar"><div>{Object.keys(BOT_LABELS).map((name) => <button key={name} className={logTarget === name ? "active" : ""} onClick={() => setLogTarget(name)}>{BOT_LABELS[name].title}</button>)}</div><div><button className={logStream === "out" ? "active" : ""} onClick={() => setLogStream("out")}>{t.output}</button><button className={logStream === "error" ? "active" : ""} onClick={() => setLogStream("error")}>{t.errors}</button></div></div><pre aria-label={`${BOT_LABELS[logTarget].title} ${logStream} log`}>{logText}</pre><p>{t.logsSafe}</p></div></section>}

        {view === "messages" && <section className="admin-section message-grid"><div><SectionTitle eyebrow={t.ownerWorkflow} title={t.dmCenter}/><p className="section-intro">{t.dmIntro}</p><div className="message-rules"><span><i/>{t.maxCharacters}</span><span><i/>{t.rateLimit}</span><span><i/>{t.reviewRequired}</span></div></div><form className="dm-form" onSubmit={(event) => { event.preventDefault(); setDmReview(true); }}><label>{t.discordUserId}<input value={dm.userId} onChange={(event) => setDm({ ...dm, userId: event.target.value.replace(/\D/g, "").slice(0, 25) })} placeholder="123456789012345678" inputMode="numeric" required minLength={15} maxLength={25}/></label><label>{t.message}<textarea value={dm.content} onChange={(event) => setDm({ ...dm, content: event.target.value.slice(0, 1800) })} placeholder={t.writeMessage} rows={7} required maxLength={1800}/><span>{dm.content.length} / 1800</span></label><button type="submit" disabled={!agent.online || Boolean(busy)}>{t.reviewMessage}<span>â†’</span></button></form></section>}

        {view === "audit" && <section className="admin-section"><SectionTitle eyebrow={t.immutableHistory} title={t.recentActivity} note={t.auditIntro}/><div className="audit-table"><div className="audit-row audit-head"><span>{t.action}</span><span>{t.target}</span><span>{t.status}</span><span>{t.when}</span></div>{(data?.commands || []).length ? data.commands.map((command) => <div className="audit-row" key={command.id}><span><i/>{commandLabel(command, locale)}</span><span>{command.target ? BOT_LABELS[command.target]?.title || command.target : "Control agent"}</span><span><b className={`command-status ${command.status}`}>{command.status}</b>{command.errorMessage && <small>{command.errorMessage}</small>}</span><time>{timeAgo(command.createdAt, locale)}</time></div>) : <p className="empty-state">{t.noActions}</p>}</div></section>}
      </div>
    </div>

    {policyEditor && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPolicyEditor(null); }}><div className="control-modal policy-modal" role="dialog" aria-modal="true"><div className="modal-heading"><span className="modal-icon"><Icon name="command"/></span><div><small>{BOT_LABELS[policyEditor.target]?.title}</small><h2>{t.commandSettings}: /{policyEditor.command.name}</h2></div></div><label className="policy-state-row"><span><b>{t.commandState}</b><small>{policyEditor.enabled ? t.enabled : t.disabled}</small></span><span className="switch"><input type="checkbox" checked={policyEditor.enabled} onChange={(event) => setPolicyEditor({ ...policyEditor, enabled: event.target.checked })}/><i/></span></label><label>{t.cooldown}<div className="input-suffix"><input type="number" min="0" max="3600" value={policyEditor.cooldownSeconds} onChange={(event) => setPolicyEditor({ ...policyEditor, cooldownSeconds: event.target.value })}/><span>{t.seconds}</span></div></label><label>{t.allowedRoles}<textarea rows="2" value={policyEditor.roleText} onChange={(event) => setPolicyEditor({ ...policyEditor, roleText: event.target.value })}/><small>{t.idsHint}</small></label><label>{t.allowedChannels}<textarea rows="2" value={policyEditor.channelText} onChange={(event) => setPolicyEditor({ ...policyEditor, channelText: event.target.value })}/><small>{t.idsHint}</small></label><div className="modal-actions"><button onClick={() => setPolicyEditor(null)}>{t.cancel}</button><button className="primary" onClick={savePolicy} disabled={Boolean(busy)}>{busy ? t.queuing : t.savePolicy}</button></div></div></div>}

    {confirmAction && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmAction(null); }}><div className="control-modal confirm-modal" role="dialog" aria-modal="true"><span className="modal-icon danger"><Icon name="shield"/></span><h2>{t.confirmAction}</h2><p><b>{confirmAction.title}</b><br/>{t.confirmationText}</p><div className="modal-actions"><button onClick={() => setConfirmAction(null)}>{t.cancel}</button><button className="confirm-danger" onClick={() => queueCommand(confirmAction, confirmAction.type === "guard.mode.set" ? t.modeQueued : t.commandQueued)} disabled={Boolean(busy)}>{t.confirm}</button></div></div></div>}

    {dmReview && <div className="modal-backdrop" role="presentation"><div className="control-modal confirm-modal dm-review" role="dialog" aria-modal="true"><span className="modal-icon message"><Icon name="message"/></span><h2>{t.reviewPrivate}</h2><p>{t.recipient} <b>{dm.userId}</b></p><blockquote>{dm.content}</blockquote><div className="modal-actions"><button onClick={() => setDmReview(false)}>{t.editMessage}</button><button className="confirm-send" onClick={() => queueCommand({ type: "dm.send", target: "lobby-games-bot", payload: dm })} disabled={Boolean(busy)}>{busy ? t.queuing : t.encryptSend}</button></div></div></div>}

    {toast && <div className={`admin-toast ${toast.kind}`} role="status">{toast.text}</div>}
  </main>;
}
