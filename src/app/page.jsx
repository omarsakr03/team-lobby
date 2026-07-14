import Image from "next/image";

const DISCORD_URL = "https://discord.gg/b53TkmpW2R";

const players = [
  { name: "NovaKite", role: "Duelist", rank: "Diamond II", image: "/images/nova.webp", accent: "violet" },
  { name: "Kairo", role: "Controller", rank: "Ascendant I", image: "/images/kairo.webp", accent: "cyan" },
  { name: "Vexa", role: "Initiator", rank: "Diamond III", image: "/images/vexa.webp", accent: "violet" },
  { name: "Lyra", role: "Sentinel", rank: "Platinum III", image: "/images/lyra.webp", accent: "cyan" },
];

const lobbies = [
  { name: "Midnight Crew", game: "VALORANT", mode: "Competitive", rank: "Plat+", spots: "4/5", tone: "violet" },
  { name: "Ranked Rush", game: "ROCKET LEAGUE", mode: "Ranked 3v3", rank: "Diamond", spots: "2/3", tone: "cyan" },
  { name: "Weekend Raiders", game: "FORTNITE", mode: "Zero Build", rank: "Any rank", spots: "3/4", tone: "blue" },
];

const games = [
  { mark: "V", name: "VALORANT", genre: "Tactical FPS", tone: "violet" },
  { mark: "RL", name: "ROCKET LEAGUE", genre: "Sports • Racing", tone: "cyan" },
  { mark: "F", name: "FORTNITE", genre: "Battle Royale", tone: "blue" },
  { mark: "P", name: "PUBG", genre: "Battle Royale", tone: "gold" },
  { mark: "A", name: "APEX LEGENDS", genre: "Hero Shooter", tone: "red" },
  { mark: "FC", name: "EA SPORTS FC", genre: "Football", tone: "green" },
];

const features = [
  { icon: "match", title: "Match by playstyle", text: "Find players who match your game, rank, role, language, and competitive energy." },
  { icon: "shield", title: "Safer communities", text: "Clear roles, active moderation, and a culture built around playing well together." },
  { icon: "spark", title: "More reasons to play", text: "Weekly events, challenges, XP, seasonal rewards, and a squad that keeps coming back." },
];

function Brand({ compact = false }) {
  return (
    <span className={compact ? "brand brand--compact" : "brand"}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="M24 3 42 13v22L24 45 6 35V13L24 3Z" />
          <path d="m24 10 11 6v14l-11 8-11-8V16l11-6Z" />
          <path d="M17 18h14v5h-4.5v9h-5v-9H17v-5Z" />
        </svg>
      </span>
      <span className="brand-name">TEAM <b>LOBBY</b></span>
    </span>
  );
}

function Icon({ name }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />,
    match: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="16" r="3" /><path d="m10.5 10.5 3 3M14 6h5v5M10 18H5v-5" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 16 4-5 3 3 5-7" /></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3" /><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" /></>,
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 10h8M8 14h5" /></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function DiscordIcon() {
  return (
    <svg className="discord-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 5.3A16 16 0 0 0 15 4.1l-.5 1a14 14 0 0 0-5 0l-.5-1a16 16 0 0 0-4 1.2C2.5 9 1.8 12.5 2.1 16a16 16 0 0 0 4.8 2.4l1.2-1.6-1.7-.8.4-.3a11.5 11.5 0 0 0 10.4 0l.4.3-1.7.8 1.2 1.6A16 16 0 0 0 21.9 16c.4-4.1-.7-7.6-3-10.7ZM8.5 14.2c-1 0-1.8-1-1.8-2.1S7.5 10 8.5 10s1.8 1 1.8 2.1-.8 2.1-1.8 2.1Zm7 0c-1 0-1.8-1-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1Z" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <div>
        <span className="eyebrow"><i />{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a href="#top" aria-label="Team Lobby home"><Brand compact /></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="active" href="#top">Home</a>
          <a href="#find-players">Find Players</a>
          <a href="#games">Games</a>
          <a href="#community">Community</a>
          <a href="/admin">Control</a>
        </nav>
        <a className="discord-status" href={DISCORD_URL} target="_blank" rel="noreferrer">
          <DiscordIcon />
          <span><b>Join our Discord</b><small><i /> Community live</small></span>
          <Icon name="arrow" />
        </a>
        <details className="mobile-menu">
          <summary aria-label="Open navigation"><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            <a href="#top">Home</a><a href="#find-players">Find Players</a><a href="#games">Games</a><a href="#community">Community</a><a href="/admin">Admin Control</a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow--violet" />
        <div className="hero-glow hero-glow--cyan" />
        <div className="hero-copy">
          <span className="eyebrow"><i /> Discord gaming community</span>
          <h1>FIND YOUR SQUAD.<span>OWN THE LOBBY.</span></h1>
          <p>Meet players who match your game, rank, and vibe. Build squads, join events, and never queue alone.</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#find-players"><Icon name="users" />Find teammates<Icon name="arrow" /></a>
            <a className="button button--secondary" href={DISCORD_URL} target="_blank" rel="noreferrer"><DiscordIcon />Join Discord</a>
          </div>
          <div className="hero-trust" aria-label="Community benefits">
            <span><Icon name="spark" />Always-on lobbies</span>
            <span><Icon name="shield" />Player-first culture</span>
            <span><Icon name="calendar" />Weekly events</span>
          </div>
        </div>

        <div className="hero-console" aria-label="Active squad preview">
          <div className="console-halo" />
          <div className="console-frame">
            <div className="console-topbar">
              <div><span className="console-emblem">TL</span><b>ACTIVE SQUAD</b></div>
              <span className="party-status"><i /> OPEN PARTY <b>4 / 5</b></span>
            </div>
            <div className="console-body">
              <aside aria-label="Squad navigation">
                <span className="selected"><Icon name="users" /></span>
                <span><Icon name="match" /></span>
                <span><Icon name="calendar" /></span>
                <span><Icon name="chart" /></span>
              </aside>
              <div className="player-list">
                {players.map((player) => (
                  <article className={`player-row player-row--${player.accent}`} key={player.name}>
                    <div className="player-photo"><Image src={player.image} alt="" width={74} height={74} /></div>
                    <div className="player-copy"><strong>{player.name}<em>✓</em></strong><span>{player.role}</span></div>
                    <div className="player-rank"><b>{player.rank}</b><small>Competitive</small></div>
                    <span className="online"><i /> Online</span>
                  </article>
                ))}
                <div className="next-match">
                  <div className="arena-image"><Image src="/images/neon-arena.webp" alt="Futuristic Team Lobby arena" fill sizes="(max-width: 900px) 80vw, 360px" /></div>
                  <div><span>UP NEXT</span><strong>Neon District</strong><small>Competitive • Ranked</small></div>
                  <div className="countdown"><span>LOBBY STARTS IN</span><strong>02:45</strong><small>4 / 5 READY</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pulse-bar" aria-label="Team Lobby highlights">
        <span>TEAMS</span><i /><span>PLAYER PROFILES</span><i /><span>RANKS &amp; XP</span><i /><span>COMMUNITY EVENTS</span><i /><span>BOT-POWERED</span>
      </section>

      <section className="section lobby-section" id="find-players">
        <SectionHeading eyebrow="LIVE LOBBIES" title="Your next squad is already online." text="Browse active groups, choose the energy that fits, and jump straight into the conversation on Discord." />
        <div className="lobby-grid">
          {lobbies.map((lobby) => (
            <article className={`lobby-card lobby-card--${lobby.tone}`} key={lobby.name}>
              <div className="lobby-card-top"><span className="live-label"><i /> LIVE</span><span>{lobby.spots} PLAYERS</span></div>
              <div className="lobby-game"><span>{lobby.game.slice(0, 2)}</span><div><small>{lobby.game}</small><h3>{lobby.name}</h3></div></div>
              <div className="lobby-tags"><span>{lobby.mode}</span><span>{lobby.rank}</span><span>Voice on</span></div>
              <div className="lobby-members" aria-hidden="true"><i>N</i><i>K</i><i>V</i><i>L</i><i>+</i></div>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">View lobby <Icon name="arrow" /></a>
            </article>
          ))}
        </div>
        <p className="section-note"><i /> Lobby availability changes in real time inside the Discord server.</p>
      </section>

      <section className="games-section" id="games">
        <div className="section">
          <SectionHeading eyebrow="ONE COMMUNITY. MORE GAMES." title="Whatever you play, find your people." text="Dedicated spaces make it easy to find the right teammates without digging through endless channels." />
          <div className="game-grid">
            {games.map((game) => (
              <article className={`game-card game-card--${game.tone}`} key={game.name}>
                <span>{game.mark}</span><div><h3>{game.name}</h3><p>{game.genre}</p></div><Icon name="arrow" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section why-section">
        <SectionHeading eyebrow="BUILT DIFFERENT" title="Less waiting. Better teammates." text="Team Lobby turns a noisy server list into a structured home for players, squads, and events." />
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-number">0{index + 1}</span>
              <div className="feature-icon"><Icon name={feature.icon} /></div>
              <h3>{feature.title}</h3><p>{feature.text}</p>
              <span className="feature-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="journey-section">
        <div className="section journey-grid">
          <div className="journey-copy">
            <span className="eyebrow"><i /> READY IN MINUTES</span>
            <h2>From solo queue to full squad.</h2>
            <p>Join once, set your games and role, then let the right people find you.</p>
            <a className="button button--primary" href={DISCORD_URL} target="_blank" rel="noreferrer"><DiscordIcon />Start your journey<Icon name="arrow" /></a>
          </div>
          <div className="journey-steps">
            <article><span>01</span><div><h3>Join the lobby</h3><p>Enter the Discord community and unlock the game spaces.</p></div></article>
            <article><span>02</span><div><h3>Build your profile</h3><p>Choose your games, rank, role, language, and playstyle.</p></div></article>
            <article><span>03</span><div><h3>Meet your squad</h3><p>Reply to an active lobby or create your own in seconds.</p></div></article>
          </div>
        </div>
      </section>

      <section className="section control-section">
        <div className="control-shell">
          <div className="control-copy">
            <span className="eyebrow"><i /> LOBBY CONTROL</span>
            <h2>Your community command center is live.</h2>
            <p>A private owner dashboard now connects bot controls, server health, safe runtime logs, and audited Discord DM workflows.</p>
            <ul><li><Icon name="bot" />Manage bots and automations</li><li><Icon name="chart" />Track server and member activity</li><li><Icon name="message" />Organize Discord DM workflows</li></ul>
            <a className="text-link" href="/admin">Open command center <Icon name="arrow" /></a>
          </div>
          <div className="dashboard-preview" aria-label="Future admin dashboard preview">
            <div className="dash-sidebar"><Brand compact /><span className="active"><Icon name="chart" /></span><span><Icon name="bot" /></span><span><Icon name="message" /></span></div>
            <div className="dash-content">
              <div className="dash-head"><div><small>TEAM LOBBY</small><strong>Command center</strong></div><span><i /> Systems online</span></div>
              <div className="dash-stats"><article><small>ACTIVE MEMBERS</small><strong>Live</strong><span>Community overview</span></article><article><small>BOT STATUS</small><strong>Healthy</strong><span>Automations running</span></article></div>
              <div className="dash-chart"><div><small>SERVER ACTIVITY</small><b>LAST 7 DAYS</b></div><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="dash-activity"><small>RECENT ACTIVITY</small><p><i /> New squad lobby created <span>now</span></p><p><i /> Weekly event reminder sent <span>12m</span></p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-cta" id="community">
        <div className="cta-grid" />
        <Brand />
        <span className="eyebrow"><i /> THE LOBBY IS OPEN</span>
        <h2>DON&apos;T QUEUE ALONE.<span>PLAY AS ONE.</span></h2>
        <p>Join Team Lobby and become part of an Arab gaming community built around better teammates and better nights online.</p>
        <a className="button button--light" href={DISCORD_URL} target="_blank" rel="noreferrer"><DiscordIcon />Join Team Lobby<Icon name="arrow" /></a>
      </section>

      <section className="section faq-section">
        <SectionHeading eyebrow="QUESTIONS, ANSWERED" title="Before you join." />
        <div className="faq-list">
          <details><summary>Is Team Lobby free to join?<span>+</span></summary><p>Yes. Joining the community, meeting players, and taking part in public events is free.</p></details>
          <details><summary>Can I join without a team?<span>+</span></summary><p>Absolutely. Team Lobby is designed to help solo players find people who match how they play.</p></details>
          <details><summary>Which games are supported?<span>+</span></summary><p>The server supports several popular competitive and social games, with new dedicated spaces added as the community grows.</p></details>
          <details><summary>Is the admin dashboard available now?<span>+</span></summary><p>Yes. The private command center is live for approved Team Lobby administrators and protected by Discord sign-in.</p></details>
        </div>
      </section>

      <footer>
        <Brand compact />
        <p>© 2026 Team Lobby. Built for the players.</p>
        <nav aria-label="Footer navigation"><a href="#find-players">Find Players</a><a href="#games">Games</a><a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a><a href="/admin">Admin</a></nav>
      </footer>
    </main>
  );
}
