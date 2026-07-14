"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const BOT_LABELS = {
  "omar-guard": { title: "Omar Guard", subtitle: "Security & moderation", accent: "violet" },
  "lobby-games-bot": { title: "Lobby Games", subtitle: "Games & community", accent: "cyan" }
};

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></>,
    terminal: <><path d="m4 6 5 5-5 5M12 18h8"/></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/><path d="M8 10h8M8 14h5"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    refresh: <><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 10A7 7 0 0 0 6 6.5L4 9M5.5 14A7 7 0 0 0 18 17.5l2-2.5"/></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3M10 10h4v4h-4z"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>
  };
  return <svg className="admin-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Brand() {
  return (
    <span className="admin-brand">
      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 42 13v22L24 45 6 35V13L24 3Z"/><path d="m24 10 11 6v14l-11 8-11-8V16l11-6Z"/><path d="M17 18h14v5h-4.5v9h-5v-9H17v-5Z"/></svg>
      <span>TEAM <b>LOBBY</b><small>CONTROL</small></span>
    </span>
  );
}

function formatBytes(value) {
  const number = Number(value || 0);
  if (!number) return "0 MB";
  return `${(number / 1024 / 1024).toFixed(number > 1024 ** 3 ? 0 : 1)} MB`;
}

function formatUptime(startedAt) {
  if (!startedAt) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - Number(startedAt)) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function timeAgo(value) {
  if (!value) return "never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function commandLabel(command) {
  const labels = {
    "process.start": "Started",
    "process.stop": "Stopped",
    "process.restart": "Restarted",
    "dm.send": "Sent Discord DM",
    "status.refresh": "Refreshed status",
    "logs.refresh": "Refreshed logs"
  };
  return labels[command.type] || command.type;
}

export default function DashboardClient({ initialUser }) {
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
    const timer = window.setInterval(() => {
      if (!document.hidden) load(true);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function queueCommand(command) {
    const busyKey = `${command.type}:${command.target || "agent"}`;
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
      setToast({ kind: "success", text: "Command queued securely." });
      if (command.type === "dm.send") {
        setDm({ userId: "", content: "" });
        setDmReview(false);
      }
      window.setTimeout(() => load(true), 700);
    } catch (commandError) {
      setToast({ kind: "error", text: commandError?.message || "Command failed." });
    } finally {
      setBusy("");
    }
  }

  const user = data?.user || initialUser;
  const agent = data?.agent || { online: false, processes: [], system: {}, discord: {}, logs: {} };
  const processes = useMemo(() => {
    const byName = new Map((agent.processes || []).map((item) => [item.name, item]));
    return Object.keys(BOT_LABELS).map((name) => byName.get(name) || { name, status: "missing" });
  }, [agent.processes]);
  const guild = agent.discord?.guild;
  const logText = agent.logs?.[logTarget]?.[logStream] || "No log lines available.";

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <nav aria-label="Dashboard navigation">
          <a className="active" href="#overview"><Icon name="grid"/><span>Overview</span></a>
          <a href="#bots"><Icon name="bot"/><span>Bots</span></a>
          <a href="#logs"><Icon name="terminal"/><span>Logs</span></a>
          <a href="#messages"><Icon name="message"/><span>Direct messages</span></a>
          <a href="#audit"><Icon name="history"/><span>Audit trail</span></a>
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/"><Icon name="external"/><span>Public site</span></Link>
          <span className={`agent-pill ${agent.online ? "online" : "offline"}`}><i />Agent {agent.online ? "online" : "offline"}</span>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div><span className="admin-kicker">TEAM LOBBY / CONTROL</span><h1>Command center</h1></div>
          <div className="admin-user">
            <button className="icon-button" onClick={() => load()} aria-label="Refresh dashboard" disabled={loading}><Icon name="refresh"/></button>
            <span className="admin-user-copy"><b>{user.name}</b><small>{user.discordId}</small></span>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span className="avatar-fallback">O</span>}
            <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form>
          </div>
        </header>

        <div className="admin-content">
          {error && <div className="admin-banner error" role="alert">{error}<button onClick={() => load()}>Retry</button></div>}
          {!agent.online && !loading && <div className="admin-banner warning"><b>Windows agent is offline.</b> Control actions will remain queued until it reconnects. Last seen {timeAgo(agent.lastSeenAt)}.</div>}

          <section id="overview" className="admin-section">
            <div className="section-title"><div><span>LIVE OPERATIONS</span><h2>Platform overview</h2></div><p>Auto-refreshes every five seconds · Last agent signal {timeAgo(agent.lastSeenAt)}</p></div>
            <div className="metric-grid">
              <article><span className="metric-icon violet"><Icon name="shield"/></span><div><small>BOT HEALTH</small><strong>{processes.filter((item) => item.status === "online").length} / 2</strong><p>processes online</p></div></article>
              <article><span className="metric-icon cyan"><Icon name="users"/></span><div><small>MEMBERS</small><strong>{guild?.memberCount?.toLocaleString() || "—"}</strong><p>{guild?.onlineCount?.toLocaleString() || "—"} currently online</p></div></article>
              <article><span className="metric-icon green"><Icon name="cpu"/></span><div><small>AGENT MEMORY</small><strong>{formatBytes(agent.system?.usedMemoryBytes)}</strong><p>Node {agent.system?.nodeVersion || "—"}</p></div></article>
              <article><span className={`metric-icon ${agent.online ? "green" : "red"}`}><Icon name="refresh"/></span><div><small>CONTROL LINK</small><strong>{agent.online ? "Live" : "Offline"}</strong><p>Agent v{agent.version || "—"}</p></div></article>
            </div>
          </section>

          <section id="bots" className="admin-section">
            <div className="section-title"><div><span>PROCESS CONTROL</span><h2>Discord bots</h2></div><p>Only the two whitelisted PM2 processes can be controlled.</p></div>
            <div className="bot-grid">
              {processes.map((processItem) => {
                const label = BOT_LABELS[processItem.name];
                const isOnline = processItem.status === "online";
                return (
                  <article className={`bot-card ${label.accent}`} key={processItem.name}>
                    <div className="bot-head"><span className="bot-emblem"><Icon name={processItem.name === "omar-guard" ? "shield" : "bot"}/></span><div><h3>{label.title}</h3><p>{label.subtitle}</p></div><span className={`status-badge ${processItem.status}`}><i />{processItem.status}</span></div>
                    <div className="bot-stats"><span><small>UPTIME</small><b>{formatUptime(processItem.uptimeStartedAt)}</b></span><span><small>MEMORY</small><b>{formatBytes(processItem.memoryBytes)}</b></span><span><small>CPU</small><b>{Number(processItem.cpuPercent || 0).toFixed(1)}%</b></span><span><small>RESTARTS</small><b>{processItem.restarts || 0}</b></span></div>
                    <div className="bot-actions">
                      <button className="start" disabled={!agent.online || isOnline || Boolean(busy)} onClick={() => queueCommand({ type: "process.start", target: processItem.name })}>{busy === `process.start:${processItem.name}` ? "Queuing…" : "Start"}</button>
                      <button disabled={!agent.online || !isOnline || Boolean(busy)} onClick={() => setConfirmAction({ type: "process.restart", target: processItem.name, title: label.title })}>Restart</button>
                      <button className="danger" disabled={!agent.online || !isOnline || Boolean(busy)} onClick={() => setConfirmAction({ type: "process.stop", target: processItem.name, title: label.title })}>Stop</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="logs" className="admin-section">
            <div className="section-title"><div><span>SAFE LOG STREAM</span><h2>Runtime logs</h2></div><button className="outline-button" disabled={!agent.online || Boolean(busy)} onClick={() => queueCommand({ type: "logs.refresh" })}><Icon name="refresh"/>Refresh</button></div>
            <div className="log-panel">
              <div className="log-toolbar"><div>{Object.keys(BOT_LABELS).map((name) => <button key={name} className={logTarget === name ? "active" : ""} onClick={() => setLogTarget(name)}>{BOT_LABELS[name].title}</button>)}</div><div><button className={logStream === "out" ? "active" : ""} onClick={() => setLogStream("out")}>Output</button><button className={logStream === "error" ? "active" : ""} onClick={() => setLogStream("error")}>Errors</button></div></div>
              <pre aria-label={`${BOT_LABELS[logTarget].title} ${logStream} log`}>{logText}</pre>
              <p>Secrets and Discord token patterns are redacted on the Windows agent and checked again by the server.</p>
            </div>
          </section>

          <section id="messages" className="admin-section message-grid">
            <div><div className="section-title"><div><span>OWNER-APPROVED WORKFLOW</span><h2>Discord DM center</h2></div></div><p className="section-intro">Send a direct message through Lobby Games. The content is encrypted while queued, mentions are disabled, and every action is audited.</p><div className="message-rules"><span><i />Maximum 1,800 characters</span><span><i />Five messages per 10 minutes</span><span><i />Explicit review before sending</span></div></div>
            <form className="dm-form" onSubmit={(event) => { event.preventDefault(); setDmReview(true); }}>
              <label>Discord User ID<input value={dm.userId} onChange={(event) => setDm({ ...dm, userId: event.target.value.replace(/\D/g, "").slice(0, 25) })} placeholder="123456789012345678" inputMode="numeric" required minLength={15} maxLength={25}/></label>
              <label>Message<textarea value={dm.content} onChange={(event) => setDm({ ...dm, content: event.target.value.slice(0, 1800) })} placeholder="Write the private message…" rows={7} required maxLength={1800}/><span>{dm.content.length} / 1800</span></label>
              <button type="submit" disabled={!agent.online || Boolean(busy)}>Review message <span>→</span></button>
            </form>
          </section>

          <section id="audit" className="admin-section">
            <div className="section-title"><div><span>IMMUTABLE HISTORY</span><h2>Recent activity</h2></div><p>Actions are recorded without storing plaintext DM content in the audit log.</p></div>
            <div className="audit-table">
              <div className="audit-row audit-head"><span>ACTION</span><span>TARGET</span><span>STATUS</span><span>WHEN</span></div>
              {(data?.commands || []).length ? data.commands.slice(0, 12).map((command) => (
                <div className="audit-row" key={command.id}><span><i />{commandLabel(command)}</span><span>{command.target ? BOT_LABELS[command.target]?.title || command.target : "Control agent"}</span><span><b className={`command-status ${command.status}`}>{command.status}</b>{command.errorMessage && <small>{command.errorMessage}</small>}</span><time>{timeAgo(command.createdAt)}</time></div>
              )) : <p className="empty-state">No control actions yet.</p>}
            </div>
          </section>
        </div>
      </div>

      {confirmAction && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmAction(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span className="modal-icon"><Icon name="shield"/></span><h2 id="confirm-title">Confirm {confirmAction.type.endsWith("stop") ? "stop" : "restart"}</h2><p>This will {confirmAction.type.endsWith("stop") ? "take" : "briefly take"} <b>{confirmAction.title}</b> offline. The action will be added to the audit trail.</p><div><button onClick={() => setConfirmAction(null)}>Cancel</button><button className="confirm-danger" onClick={() => queueCommand(confirmAction)} disabled={Boolean(busy)}>Confirm action</button></div></div></div>}

      {dmReview && <div className="modal-backdrop" role="presentation"><div className="confirm-modal dm-review" role="dialog" aria-modal="true" aria-labelledby="dm-review-title"><span className="modal-icon message"><Icon name="message"/></span><h2 id="dm-review-title">Review private message</h2><p>Recipient <b>{dm.userId}</b></p><blockquote>{dm.content}</blockquote><div><button onClick={() => setDmReview(false)}>Edit message</button><button className="confirm-send" onClick={() => queueCommand({ type: "dm.send", target: "lobby-games-bot", payload: dm })} disabled={Boolean(busy)}>{busy ? "Queuing…" : "Encrypt & send"}</button></div></div></div>}

      {toast && <div className={`admin-toast ${toast.kind}`} role="status">{toast.text}</div>}
    </main>
  );
}
