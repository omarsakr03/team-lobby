"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { persistClientLocale, readClientLocale } from "../../lib/locale";

const BOT_LABELS = {
  "omar-guard": {
    title: "Omar Guard",
    subtitle: { en: "Security & moderation", ar: "الحماية والإشراف" },
    accent: "violet",
    icon: "shield"
  },
  "lobby-games-bot": {
    title: "Lobby Games",
    subtitle: { en: "Games & community", ar: "الألعاب والمجتمع" },
    accent: "cyan",
    icon: "bot"
  },
  "andonis-games-bot": {
    title: "Andonis Games",
    subtitle: { en: "Andonis game services", ar: "ألعاب وخدمات أدونيس" },
    accent: "blue",
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
    currentlyOnline: "currently online", systemMemory: "SYSTEM MEMORY USED", controlLink: "CONTROL LINK",
    live: "Live", offline: "Offline", commandCoverage: "COMMAND COVERAGE", managedCommands: "managed commands",
    processControl: "PROCESS CONTROL", discordBots: "Discord bots",
    processNote: "Only the three whitelisted PM2 processes can be controlled.",
    uptime: "UPTIME", memory: "MEMORY", cpu: "CPU", restarts: "RESTARTS",
    start: "Start", restart: "Restart", stop: "Stop", queuing: "Queuing…",
    commandRegistry: "COMMAND REGISTRY", botCommands: "Bot commands",
    commandIntro: "Enable commands, set cooldowns, and restrict access to Discord roles or channels.",
    searchCommands: "Search commands…", allBots: "All bots", allGroups: "All groups",
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
    message: "Message", writeMessage: "Write the private message…", reviewMessage: "Review message",
    immutableHistory: "IMMUTABLE HISTORY", recentActivity: "Recent activity",
    auditIntro: "Actions are recorded without storing plaintext DM content in the audit log.",
    action: "ACTION", target: "TARGET", status: "STATUS", when: "WHEN", noActions: "No control actions yet.",
    confirmAction: "Confirm action", confirmationText: "This action can briefly affect service availability and will be audited.",
    confirm: "Confirm", reviewPrivate: "Review private message", recipient: "Recipient",
    editMessage: "Edit message", encryptSend: "Encrypt & send", commandQueued: "Command queued securely.",
    retry: "Retry", loading: "Loading control center…", windowsOffline: "Windows agent is offline.",
    queuedOffline: "Control actions will remain queued until it reconnects.", noMatches: "No commands match these filters.",
    policyUpdated: "Policy updated", gameSettings: "Game settings", protectionStatus: "Protection status",
    activeCommands: "active", roles: "roles", channels: "channels",
    networkUsage: "Internet usage", networkEyebrow: "MEASURED TRAFFIC",
    networkNote: "Bot counters measure their Node process sockets. Agent counters measure control-sync payloads.",
    today: "Today", thisMonth: "This month", lifetime: "Lifetime",
    upload: "Upload", download: "Download", meterPending: "Waiting for the first meter sample",
    agentControl: "Control Agent", processSockets: "Process sockets", syncPayload: "Sync payload"
  },
  ar: {
    overview: "نظرة عامة", bots: "البوتات", commands: "الأوامر", operations: "العمليات",
    logs: "السجلات", messages: "الرسائل الخاصة", audit: "سجل التدقيق", publicSite: "الموقع العام",
    commandCenter: "مركز القيادة", workspace: "TEAM LOBBY / مركز التحكم V2",
    signOut: "تسجيل الخروج", agentOnline: "الوكيل متصل", agentOffline: "الوكيل غير متصل",
    liveOperations: "العمليات المباشرة", platformOverview: "نظرة عامة على المنصة",
    autoRefresh: "تحديث تلقائي كل خمس ثوانٍ", lastSignal: "آخر إشارة للوكيل",
    botHealth: "صحة البوتات", processesOnline: "عملية متصلة", members: "الأعضاء",
    currentlyOnline: "متصل الآن", systemMemory: "ذاكرة الجهاز المستخدمة", controlLink: "رابط التحكم",
    live: "متصل", offline: "غير متصل", commandCoverage: "تغطية الأوامر", managedCommands: "أمر مُدار",
    processControl: "التحكم في العمليات", discordBots: "بوتات Discord",
    processNote: "التحكم مقصور على عمليات PM2 الثلاث المسموح بها فقط.",
    uptime: "مدة التشغيل", memory: "الذاكرة", cpu: "المعالج", restarts: "إعادات التشغيل",
    start: "تشغيل", restart: "إعادة تشغيل", stop: "إيقاف", queuing: "جارٍ الإرسال…",
    commandRegistry: "سجل الأوامر", botCommands: "أوامر البوتات",
    commandIntro: "فعّل الأوامر أو عطّلها واضبط الانتظار والصلاحيات حسب رتب وقنوات Discord.",
    searchCommands: "ابحث في الأوامر…", allBots: "كل البوتات", allGroups: "كل التصنيفات",
    enabled: "مفعّل", disabled: "معطّل", configure: "إعداد", cooldown: "فترة الانتظار",
    unrestricted: "بدون قيود", restricted: "مقيّد", seconds: "ثانية",
    commandSettings: "إعدادات الأمر", commandState: "حالة الأمر",
    allowedRoles: "معرفات الرتب المسموحة", allowedChannels: "معرفات القنوات المسموحة",
    idsHint: "افصل معرفات Discord بفاصلة أو مسافة. اترك الحقل فارغًا للسماح للجميع.",
    cancel: "إلغاء", savePolicy: "حفظ السياسة", policyQueued: "تم إرسال سياسة الأمر بأمان.",
    riskLow: "خطورة منخفضة", riskMedium: "خطورة متوسطة", riskHigh: "خطورة عالية", riskCritical: "حساس جدًا",
    operationsDesk: "مكتب العمليات", safeActions: "إجراءات آمنة",
    operationsIntro: "إجراءات معتمدة فقط؛ كل تغيير يُراجع محليًا ويُضاف إلى سجل التدقيق.",
    guardMode: "وضع حماية Omar Guard", guardModeIntro: "غيّر مستوى الحماية المباشر دون كشف توكن البوت.",
    passive: "مراقبة", active: "نشط", lockdown: "إغلاق أمني", current: "الحالي",
    applyMode: "تطبيق الوضع", gameTuning: "ضبط Lobby Games",
    gameTuningIntro: "تحكم في توفر الألعاب ومضاعف المكافآت ومدة كل دور.",
    reward: "مضاعف المكافأة", turnTimeout: "مهلة الدور", saveGame: "حفظ إعدادات اللعبة",
    gameQueued: "تم إرسال إعدادات اللعبة بأمان.", modeQueued: "تم إرسال وضع الحماية بأمان.",
    safeLogStream: "سجل آمن", runtimeLogs: "سجلات التشغيل", refresh: "تحديث",
    output: "المخرجات", errors: "الأخطاء", noLogs: "لا توجد أسطر سجل متاحة.",
    logsSafe: "تُحجب الأسرار وأنماط توكن Discord داخل وكيل Windows ثم تُفحص مرة أخرى على الخادم.",
    ownerWorkflow: "مسار معتمد من المالك", dmCenter: "مركز رسائل Discord",
    dmIntro: "أرسل رسالة خاصة عبر Lobby Games؛ يُشفّر المحتوى أثناء الانتظار وتُسجّل كل عملية.",
    maxCharacters: "الحد الأقصى 1,800 حرف", rateLimit: "خمس رسائل كل 10 دقائق",
    reviewRequired: "مراجعة صريحة قبل الإرسال", discordUserId: "Discord User ID",
    message: "الرسالة", writeMessage: "اكتب الرسالة الخاصة…", reviewMessage: "مراجعة الرسالة",
    immutableHistory: "سجل غير قابل للتلاعب", recentActivity: "النشاط الأخير",
    auditIntro: "تُسجّل العمليات دون حفظ محتوى الرسائل الخاصة كنص صريح.",
    action: "العملية", target: "الهدف", status: "الحالة", when: "الوقت", noActions: "لا توجد عمليات تحكم حتى الآن.",
    confirmAction: "تأكيد العملية", confirmationText: "قد تؤثر هذه العملية مؤقتًا على توفر الخدمة وسيتم تسجيلها.",
    confirm: "تأكيد", reviewPrivate: "مراجعة الرسالة الخاصة", recipient: "المستلم",
    editMessage: "تعديل الرسالة", encryptSend: "تشفير وإرسال", commandQueued: "تم إرسال الأمر بأمان.",
    retry: "إعادة المحاولة", loading: "جارٍ تحميل مركز التحكم…", windowsOffline: "وكيل Windows غير متصل.",
    queuedOffline: "ستظل أوامر التحكم في الانتظار حتى يعاود الاتصال.", noMatches: "لا توجد أوامر تطابق هذه الفلاتر.",
    policyUpdated: "تم تحديث السياسة", gameSettings: "إعدادات الألعاب", protectionStatus: "حالة الحماية",
    activeCommands: "مفعّل", roles: "رتب", channels: "قنوات",
    networkUsage: "استهلاك الإنترنت", networkEyebrow: "استهلاك مقاس فعليًا",
    networkNote: "عدادات البوتات تقيس اتصالات عملية Node نفسها، وعداد الوكيل يقيس بيانات المزامنة مع لوحة التحكم.",
    today: "اليوم", thisMonth: "هذا الشهر", lifetime: "الإجمالي",
    upload: "رفع", download: "تنزيل", meterPending: "في انتظار أول قراءة من العداد",
    agentControl: "وكيل التحكم", processSockets: "اتصالات العملية", syncPayload: "بيانات المزامنة"
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
    activity: <><path d="M3 12h4l2-7 4 14 2-7h6"/></>,
    network: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/><path d="M2 9a14 14 0 0 1 20 0"/></>
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

function formatTraffic(value) {
  const bytes = Math.max(0, Number(value || 0));
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function trafficTotal(counter) {
  return Number(counter?.uploadBytes || 0) + Number(counter?.downloadBytes || 0);
}

function formatSystemMemory(value) {
  const bytes = Number(value || 0);
  if (!bytes) return "0 GB";
  const gigabytes = bytes / 1024 / 1024 / 1024;
  return gigabytes >= 1
    ? `${gigabytes.toFixed(1)} GB`
    : formatBytes(bytes);
}

function formatUptime(startedAt) {
  if (!startedAt) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - Number(startedAt)) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function timeAgo(value, locale) {
  if (!value) return locale === "ar" ? "أبدًا" : "never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return locale === "ar" ? "الآن" : "just now";
  if (seconds < 60) return locale === "ar" ? `منذ ${seconds}ث` : `${seconds}s ago`;
  if (seconds < 3600) return locale === "ar" ? `منذ ${Math.floor(seconds / 60)}د` : `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return locale === "ar" ? `منذ ${Math.floor(seconds / 3600)}س` : `${Math.floor(seconds / 3600)}h ago`;
  return locale === "ar" ? `منذ ${Math.floor(seconds / 86400)}ي` : `${Math.floor(seconds / 86400)}d ago`;
}

function commandLabel(command, locale) {
  const labels = {
    "process.start": ["Started", "تشغيل"], "process.stop": ["Stopped", "إيقاف"],
    "process.restart": ["Restarted", "إعادة تشغيل"], "dm.send": ["Sent Discord DM", "إرسال رسالة Discord"],
    "status.refresh": ["Refreshed status", "تحديث الحالة"], "logs.refresh": ["Refreshed logs", "تحديث السجلات"],
    "command.policy.update": ["Updated command policy", "تحديث سياسة أمر"],
    "guard.mode.set": ["Changed protection mode", "تغيير وضع الحماية"],
    "games.settings.update": ["Updated game settings", "تحديث إعدادات لعبة"]
  };
  return (labels[command.type] || [command.type, command.type])[locale === "ar" ? 1 : 0];
}

function splitIds(value) {
  return Array.from(new Set(String(value || "").split(/[\s,]+/).map((item) => item.trim()).filter(Boolean)));
}

function SectionTitle({ eyebrow, title, note, action }) {
  return <div className="section-title"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action || (note ? <p>{note}</p> : null)}</div>;
}

function NetworkUsageCard({ title, subtitle, usage, accent, t }) {
  return <article className={`network-card ${accent || "green"}`}>
    <div className="network-card-head"><span><Icon name="network"/></span><div><h3>{title}</h3><p>{subtitle}</p></div></div>
    {usage?.available ? <>
      <strong>{formatTraffic(trafficTotal(usage.day))}</strong><small>{t.today}</small>
      <div className="network-transfer"><span><small>{t.upload}</small><b>↑ {formatTraffic(usage.day?.uploadBytes)}</b></span><span><small>{t.download}</small><b>↓ {formatTraffic(usage.day?.downloadBytes)}</b></span></div>
      <div className="network-periods"><span>{t.thisMonth}<b>{formatTraffic(trafficTotal(usage.month))}</b></span><span>{t.lifetime}<b>{formatTraffic(trafficTotal(usage.lifetime))}</b></span></div>
    </> : <p className="network-pending">{t.meterPending}</p>}
  </article>;
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

export default function DashboardClient({ initialUser, initialLocale = "ar" }) {
  const [locale, setLocale] = useState(initialLocale);
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
  const [localeReady, setLocaleReady] = useState(false);

  const t = COPY[locale];

  useEffect(() => {
    setLocale(readClientLocale(initialLocale));
    setLocaleReady(true);
  }, [initialLocale]);

  useEffect(() => {
    if (localeReady) persistClientLocale(locale);
  }, [locale, localeReady]);

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
  const protectionMode = controlBots["omar-guard"]?.status?.protectionMode || "—";
  const logText = agent.logs?.[logTarget]?.[logStream] || t.noLogs;
  const enabledCommandCount = commandCatalog.filter((command) => command.policy?.enabled !== false).length;
  const network = agent.system?.network || { processes: {}, agent: null };
  const networkCards = [
    {
      title: BOT_LABELS["omar-guard"].title,
      subtitle: t.processSockets,
      accent: "violet",
      usage: network.processes?.["omar-guard"]
    },
    {
      title: BOT_LABELS["lobby-games-bot"].title,
      subtitle: t.processSockets,
      accent: "cyan",
      usage: network.processes?.["lobby-games-bot"]
    },
    {
      title: BOT_LABELS["andonis-games-bot"].title,
      subtitle: t.processSockets,
      accent: "blue",
      usage: network.processes?.["andonis-games-bot"]
    },
    {
      title: t.agentControl,
      subtitle: t.syncPayload,
      accent: "green",
      usage: network.agent
    }
  ];

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

  return <main className="admin-shell" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
    <aside className="admin-sidebar">
      <Brand />
      <nav aria-label="Dashboard navigation">{NAV_ITEMS.map(([id, icon]) => <button type="button" key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon name={icon}/><span>{t[id]}</span></button>)}</nav>
      <div className="admin-sidebar-foot"><Link href={`/${locale}`}><Icon name="external"/><span>{t.publicSite}</span></Link><span className={`agent-pill ${agent.online ? "online" : "offline"}`}><i />{agent.online ? t.agentOnline : t.agentOffline}</span></div>
    </aside>

    <div className="admin-workspace">
      <header className="admin-topbar">
        <div><span className="admin-kicker">{t.workspace}</span><h1>{t.commandCenter}</h1></div>
        <div className="admin-user">
          <button className="locale-button" type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}><Icon name="globe"/><span>{locale === "ar" ? "EN" : "عربي"}</span></button>
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
          <section className="admin-section hero-overview"><SectionTitle eyebrow={t.liveOperations} title={t.platformOverview} note={`${t.autoRefresh} · ${t.lastSignal} ${timeAgo(agent.lastSeenAt, locale)}`}/><div className="status-ribbon"><span className={agent.online ? "ok" : "down"}><i/>{agent.online ? t.agentOnline : t.agentOffline}</span><span><Icon name="activity"/>{processes.filter((item) => item.status === "online").length}/{processes.length || 3} {t.processesOnline}</span><span><Icon name="command"/>{enabledCommandCount}/{commandCatalog.length} {t.activeCommands}</span></div></section>
          <section className="metric-grid">
            <article><span className="metric-icon violet"><Icon name="shield"/></span><div><small>{t.botHealth}</small><strong>{processes.filter((item) => item.status === "online").length} / 2</strong><p>{t.processesOnline}</p></div><em className="metric-glow violet"/></article>
            <article><span className="metric-icon cyan"><Icon name="users"/></span><div><small>{t.members}</small><strong>{guild?.memberCount?.toLocaleString() || "—"}</strong><p>{guild?.onlineCount?.toLocaleString() || "—"} {t.currentlyOnline}</p></div><em className="metric-glow cyan"/></article>
            <article><span className="metric-icon green"><Icon name="cpu"/></span><div><small>{t.systemMemory}</small><strong>{formatSystemMemory(agent.system?.usedMemoryBytes)}</strong><p>Node {agent.system?.nodeVersion || "—"}</p></div><em className="metric-glow green"/></article>
            <article><span className="metric-icon violet"><Icon name="command"/></span><div><small>{t.commandCoverage}</small><strong>{enabledCommandCount} / {commandCatalog.length || "—"}</strong><p>{t.managedCommands}</p></div><em className="metric-glow violet"/></article>
          </section>
          <section className="admin-section network-section"><SectionTitle eyebrow={t.networkEyebrow} title={t.networkUsage} note={t.networkNote}/><div className="network-grid">{networkCards.map((item) => <NetworkUsageCard key={item.title} {...item} t={t}/>)}</div></section>
          <section className="admin-section overview-split"><div className="overview-panel"><SectionTitle eyebrow={t.processControl} title={t.discordBots}/><div className="compact-bots">{processes.map((processItem) => { const label = BOT_LABELS[processItem.name]; return <button key={processItem.name} onClick={() => setView("bots")}><span className={`bot-emblem ${label.accent}`}><Icon name={label.icon}/></span><div><b>{label.title}</b><small>{label.subtitle[locale]}</small></div><em className={`status-badge ${processItem.status}`}><i/>{processItem.status}</em></button>; })}</div></div><div className="overview-panel"><SectionTitle eyebrow={t.immutableHistory} title={t.recentActivity}/><div className="activity-list">{(data?.audit || []).slice(0, 5).map((entry) => <div key={entry.id}><span><i/>{commandLabel(entry, locale)}</span><b className={`command-status ${entry.status}`}>{entry.status}</b><time>{timeAgo(entry.createdAt, locale)}</time></div>)}</div></div></section>
        </>}

        {view === "bots" && <section className="admin-section"><SectionTitle eyebrow={t.processControl} title={t.discordBots} note={t.processNote}/><div className="bot-grid">{processes.map((processItem) => { const label = BOT_LABELS[processItem.name]; const isOnline = processItem.status === "online"; return <article className={`bot-card ${label.accent}`} key={processItem.name}><div className="bot-head"><span className="bot-emblem"><Icon name={label.icon}/></span><div><h3>{label.title}</h3><p>{label.subtitle[locale]}</p></div><span className={`status-badge ${processItem.status}`}><i/>{processItem.status}</span></div><div className="bot-stats"><span><small>{t.uptime}</small><b>{formatUptime(processItem.uptimeStartedAt)}</b></span><span><small>{t.memory}</small><b>{formatBytes(processItem.memoryBytes)}</b></span><span><small>{t.cpu}</small><b>{Number(processItem.cpuPercent || 0).toFixed(1)}%</b></span><span><small>{t.restarts}</small><b>{processItem.restarts || 0}</b></span></div><div className="bot-actions"><button className="start" disabled={!agent.online || isOnline || Boolean(busy)} onClick={() => queueCommand({ type: "process.start", target: processItem.name })}>{busy === `process.start:${processItem.name}` ? t.queuing : t.start}</button><button disabled={!agent.online || !isOnline || Boolean(busy)} onClick={() => setConfirmAction({ type: "process.restart", target: processItem.name, title: label.title })}>{t.restart}</button><button className="danger" disabled={!agent.online || !isOnline || Boolean(busy)} onClick={() => setConfirmAction({ type: "process.stop", target: processItem.name, title: label.title })}>{t.stop}</button></div></article>; })}</div></section>}

        {view === "commands" && <section className="admin-section"><SectionTitle eyebrow={t.commandRegistry} title={t.botCommands} note={t.commandIntro}/><div className="command-toolbar"><label className="command-search"><Icon name="search"/><input value={commandSearch} onChange={(event) => setCommandSearch(event.target.value)} placeholder={t.searchCommands}/></label><select value={commandBot} onChange={(event) => setCommandBot(event.target.value)}><option value="all">{t.allBots}</option>{Object.entries(BOT_LABELS).map(([id, label]) => <option key={id} value={id}>{label.title}</option>)}</select><select value={commandGroup} onChange={(event) => setCommandGroup(event.target.value)}><option value="all">{t.allGroups}</option>{groups.map((group) => <option key={group} value={group}>{group}</option>)}</select><span className="command-count">{filteredCommands.length}</span></div><div className="command-grid">{filteredCommands.map((command) => { const restricted = command.policy.allowedRoleIds?.length || command.policy.allowedChannelIds?.length; return <article className={`command-card risk-${command.risk}`} key={`${command.target}:${command.name}`}><div className="command-card-top"><span className={`command-bot-dot ${BOT_LABELS[command.target]?.accent}`}/><code>/{command.name}</code><span className={`risk-pill ${command.risk}`}>{t[`risk${command.risk[0].toUpperCase()}${command.risk.slice(1)}`]}</span></div><h3>{command.label?.[locale] || command.name}</h3><p>{BOT_LABELS[command.target]?.title} · {command.group}</p><div className="policy-summary"><span className={command.policy.enabled !== false ? "on" : "off"}><i/>{command.policy.enabled !== false ? t.enabled : t.disabled}</span><span><Icon name="activity"/>{command.policy.cooldownSeconds || 0}s</span><span><Icon name="lock"/>{restricted ? t.restricted : t.unrestricted}</span></div><button onClick={() => openPolicy(command)}><Icon name="sliders"/>{t.configure}</button></article>; })}{!filteredCommands.length && <p className="empty-state">{t.noMatches}</p>}</div></section>}

        {view === "operations" && <><section className="admin-section"><SectionTitle eyebrow={t.operationsDesk} title={t.safeActions} note={t.operationsIntro}/><div className="guard-mode-panel"><div className="guard-mode-copy"><span className="bot-emblem violet"><Icon name="shield"/></span><div><small>{t.protectionStatus}</small><h3>{t.guardMode}</h3><p>{t.guardModeIntro}</p></div><strong>{t.current}: {protectionMode}</strong></div><div className="mode-buttons">{[["Passive", "passive"], ["Active", "active"], ["Lockdown", "lockdown"]].map(([mode, key]) => <button key={mode} className={`${mode.toLowerCase()} ${protectionMode === mode ? "selected" : ""}`} disabled={!agent.online || Boolean(busy) || protectionMode === mode} onClick={() => setConfirmAction({ type: "guard.mode.set", target: "omar-guard", payload: { mode }, title: `${t.guardMode}: ${t[key]}` })}><i/>{t[key]}{protectionMode === mode && <small>{t.current}</small>}</button>)}</div></div></section><section className="admin-section"><SectionTitle eyebrow={t.gameSettings} title={t.gameTuning} note={t.gameTuningIntro}/><div className="game-settings-grid">{gameCommands.map((game) => <GameSettingCard key={game.name} game={game} current={gameStatusMap.get(game.name)} locale={locale} t={t} busy={busy === "games.settings.update:lobby-games-bot"} onSave={(payload) => queueCommand({ type: "games.settings.update", target: "lobby-games-bot", payload }, t.gameQueued)}/>)}</div></section></>}

        {view === "logs" && <section className="admin-section"><SectionTitle eyebrow={t.safeLogStream} title={t.runtimeLogs} action={<button className="outline-button" disabled={!agent.online || Boolean(busy)} onClick={() => queueCommand({ type: "logs.refresh" })}><Icon name="refresh"/>{t.refresh}</button>}/><div className="log-panel"><div className="log-toolbar"><div>{Object.keys(BOT_LABELS).map((name) => <button key={name} className={logTarget === name ? "active" : ""} onClick={() => setLogTarget(name)}>{BOT_LABELS[name].title}</button>)}</div><div><button className={logStream === "out" ? "active" : ""} onClick={() => setLogStream("out")}>{t.output}</button><button className={logStream === "error" ? "active" : ""} onClick={() => setLogStream("error")}>{t.errors}</button></div></div><pre aria-label={`${BOT_LABELS[logTarget].title} ${logStream} log`}>{logText}</pre><p>{t.logsSafe}</p></div></section>}

        {view === "messages" && <section className="admin-section message-grid"><div><SectionTitle eyebrow={t.ownerWorkflow} title={t.dmCenter}/><p className="section-intro">{t.dmIntro}</p><div className="message-rules"><span><i/>{t.maxCharacters}</span><span><i/>{t.rateLimit}</span><span><i/>{t.reviewRequired}</span></div></div><form className="dm-form" onSubmit={(event) => { event.preventDefault(); setDmReview(true); }}><label>{t.discordUserId}<input value={dm.userId} onChange={(event) => setDm({ ...dm, userId: event.target.value.replace(/\D/g, "").slice(0, 25) })} placeholder="123456789012345678" inputMode="numeric" required minLength={15} maxLength={25}/></label><label>{t.message}<textarea value={dm.content} onChange={(event) => setDm({ ...dm, content: event.target.value.slice(0, 1800) })} placeholder={t.writeMessage} rows={7} required maxLength={1800}/><span>{dm.content.length} / 1800</span></label><button type="submit" disabled={!agent.online || Boolean(busy)}>{t.reviewMessage}<span>→</span></button></form></section>}

        {view === "audit" && <section className="admin-section"><SectionTitle eyebrow={t.immutableHistory} title={t.recentActivity} note={t.auditIntro}/><div className="audit-table"><div className="audit-row audit-head"><span>{t.action}</span><span>{t.target}</span><span>{t.status}</span><span>{t.when}</span></div>{(data?.audit || []).length ? data.audit.map((entry) => <div className="audit-row" key={entry.id}><span><i/>{commandLabel(entry, locale)}</span><span>{entry.target ? BOT_LABELS[entry.target]?.title || entry.target : "Control agent"}</span><span><b className={`command-status ${entry.status}`}>{entry.status}</b>{entry.errorMessage && <small>{entry.errorMessage}</small>}</span><time>{timeAgo(entry.createdAt, locale)}</time></div>) : <p className="empty-state">{t.noActions}</p>}</div></section>}
      </div>
    </div>

    {policyEditor && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPolicyEditor(null); }}><div className="control-modal policy-modal" role="dialog" aria-modal="true"><div className="modal-heading"><span className="modal-icon"><Icon name="command"/></span><div><small>{BOT_LABELS[policyEditor.target]?.title}</small><h2>{t.commandSettings}: /{policyEditor.command.name}</h2></div></div><label className="policy-state-row"><span><b>{t.commandState}</b><small>{policyEditor.enabled ? t.enabled : t.disabled}</small></span><span className="switch"><input type="checkbox" checked={policyEditor.enabled} onChange={(event) => setPolicyEditor({ ...policyEditor, enabled: event.target.checked })}/><i/></span></label><label>{t.cooldown}<div className="input-suffix"><input type="number" min="0" max="3600" value={policyEditor.cooldownSeconds} onChange={(event) => setPolicyEditor({ ...policyEditor, cooldownSeconds: event.target.value })}/><span>{t.seconds}</span></div></label><label>{t.allowedRoles}<textarea rows="2" value={policyEditor.roleText} onChange={(event) => setPolicyEditor({ ...policyEditor, roleText: event.target.value })}/><small>{t.idsHint}</small></label><label>{t.allowedChannels}<textarea rows="2" value={policyEditor.channelText} onChange={(event) => setPolicyEditor({ ...policyEditor, channelText: event.target.value })}/><small>{t.idsHint}</small></label><div className="modal-actions"><button onClick={() => setPolicyEditor(null)}>{t.cancel}</button><button className="primary" onClick={savePolicy} disabled={Boolean(busy)}>{busy ? t.queuing : t.savePolicy}</button></div></div></div>}

    {confirmAction && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmAction(null); }}><div className="control-modal confirm-modal" role="dialog" aria-modal="true"><span className="modal-icon danger"><Icon name="shield"/></span><h2>{t.confirmAction}</h2><p><b>{confirmAction.title}</b><br/>{t.confirmationText}</p><div className="modal-actions"><button onClick={() => setConfirmAction(null)}>{t.cancel}</button><button className="confirm-danger" onClick={() => queueCommand(confirmAction, confirmAction.type === "guard.mode.set" ? t.modeQueued : t.commandQueued)} disabled={Boolean(busy)}>{t.confirm}</button></div></div></div>}

    {dmReview && <div className="modal-backdrop" role="presentation"><div className="control-modal confirm-modal dm-review" role="dialog" aria-modal="true"><span className="modal-icon message"><Icon name="message"/></span><h2>{t.reviewPrivate}</h2><p>{t.recipient} <b>{dm.userId}</b></p><blockquote>{dm.content}</blockquote><div className="modal-actions"><button onClick={() => setDmReview(false)}>{t.editMessage}</button><button className="confirm-send" onClick={() => queueCommand({ type: "dm.send", target: "lobby-games-bot", payload: dm })} disabled={Boolean(busy)}>{busy ? t.queuing : t.encryptSend}</button></div></div></div>}

    {toast && <div className={`admin-toast ${toast.kind}`} role="status">{toast.text}</div>}
  </main>;
}
