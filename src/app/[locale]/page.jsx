import Image from "next/image";
import { notFound } from "next/navigation";
import LocaleSwitcher from "../locale-switcher";
import { isLocale, localeDirection, SUPPORTED_LOCALES } from "../../lib/locale";
import { SITE_COPY } from "../../lib/site-copy";

const DISCORD_URL = "https://discord.gg/bt6HsKsDqS";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = SITE_COPY[locale];
  const oppositeLocale = locale === "ar" ? "en_US" : "ar_AR";

  return {
    title: { absolute: t.meta.title },
    description: t.meta.description,
    keywords: t.meta.keywords,
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/ar" }
    },
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.description,
      type: "website",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: [oppositeLocale],
      url: `/${locale}`,
      siteName: "Team Lobby"
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description
    }
  };
}

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
    message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 10h8M8 14h5" /></>
  };
  return <svg className={`icon ${name === "arrow" ? "icon--arrow" : ""}`} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
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

export default async function Home({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = SITE_COPY[locale];
  const direction = localeDirection(locale);

  return (
    <main className="site-shell" lang={locale} dir={direction}>
      <header className="site-header">
        <a href="#top" aria-label={t.aria.home}><Brand compact /></a>
        <nav className="desktop-nav" aria-label={t.aria.mainNavigation}>
          <a className="active" href="#top">{t.nav.home}</a>
          <a href="#find-players">{t.nav.players}</a>
          <a href="#games">{t.nav.games}</a>
          <a href="#community">{t.nav.community}</a>
          <a href="/admin">{t.nav.control}</a>
        </nav>
        <div className="header-actions">
          <LocaleSwitcher locale={locale} label={t.language.button} ariaLabel={t.language.aria} />
          <a className="discord-status" href={DISCORD_URL} target="_blank" rel="noreferrer">
            <DiscordIcon />
            <span><b>{t.discord.title}</b><small><i /> {t.discord.status}</small></span>
            <Icon name="arrow" />
          </a>
        </div>
        <details className="mobile-menu">
          <summary aria-label={t.aria.openNavigation}><span /><span /></summary>
          <nav aria-label={t.aria.mobileNavigation}>
            <a href="#top">{t.nav.home}</a>
            <a href="#find-players">{t.nav.players}</a>
            <a href="#games">{t.nav.games}</a>
            <a href="#community">{t.nav.community}</a>
            <a href="/admin">{t.nav.adminControl}</a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">{t.nav.join}</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow--violet" />
        <div className="hero-glow hero-glow--cyan" />
        <div className="hero-copy">
          <span className="eyebrow"><i /> {t.hero.eyebrow}</span>
          <h1>{t.hero.title}<span>{t.hero.titleAccent}</span></h1>
          <p>{t.hero.text}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#find-players"><Icon name="users" />{t.hero.find}<Icon name="arrow" /></a>
            <a className="button button--secondary" href={DISCORD_URL} target="_blank" rel="noreferrer"><DiscordIcon />{t.hero.join}</a>
          </div>
          <div className="hero-trust" aria-label={t.aria.communityBenefits}>
            <span><Icon name="spark" />{t.hero.trust[0]}</span>
            <span><Icon name="shield" />{t.hero.trust[1]}</span>
            <span><Icon name="calendar" />{t.hero.trust[2]}</span>
          </div>
        </div>

        <div className="hero-console" aria-label={t.aria.activeSquad}>
          <div className="console-halo" />
          <div className="console-frame">
            <div className="console-topbar">
              <div><span className="console-emblem">TL</span><b>{t.console.title}</b></div>
              <span className="party-status"><i /> {t.console.party} <b>4 / 5</b></span>
            </div>
            <div className="console-body">
              <aside aria-label={t.aria.squadNavigation}>
                <span className="selected"><Icon name="users" /></span>
                <span><Icon name="match" /></span>
                <span><Icon name="calendar" /></span>
                <span><Icon name="chart" /></span>
              </aside>
              <div className="player-list">
                {t.console.players.map((player) => (
                  <article className={`player-row player-row--${player.accent}`} key={player.name}>
                    <div className="player-photo"><Image src={player.image} alt="" width={74} height={74} /></div>
                    <div className="player-copy"><strong><bdi>{player.name}</bdi><em>✓</em></strong><span>{player.role}</span></div>
                    <div className="player-rank"><b>{player.rank}</b><small>{t.console.competitive}</small></div>
                    <span className="online"><i /> {t.console.online}</span>
                  </article>
                ))}
                <div className="next-match">
                  <div className="arena-image"><Image src="/images/neon-arena.webp" alt={t.aria.arena} fill sizes="(max-width: 900px) 80vw, 360px" /></div>
                  <div><span>{t.console.upNext}</span><strong>{t.console.arena}</strong><small>{t.console.arenaMode}</small></div>
                  <div className="countdown"><span>{t.console.startsIn}</span><strong>02:45</strong><small>{t.console.ready}</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pulse-bar" aria-label={t.aria.highlights}>
        {t.pulse.map((item, index) => <span className="pulse-item" key={item}>{item}{index < t.pulse.length - 1 && <i />}</span>)}
      </section>

      <section className="section lobby-section" id="find-players">
        <SectionHeading eyebrow={t.lobbiesSection.eyebrow} title={t.lobbiesSection.title} text={t.lobbiesSection.text} />
        <div className="lobby-grid">
          {t.lobbies.map((lobby) => (
            <article className={`lobby-card lobby-card--${lobby.tone}`} key={lobby.name}>
              <div className="lobby-card-top"><span className="live-label"><i /> {t.lobbiesSection.live}</span><span><bdi>{lobby.spots}</bdi> {t.lobbiesSection.players}</span></div>
              <div className="lobby-game"><span>{lobby.game.slice(0, 2)}</span><div><small>{lobby.game}</small><h3>{lobby.name}</h3></div></div>
              <div className="lobby-tags"><span>{lobby.mode}</span><span>{lobby.rank}</span><span>{t.lobbiesSection.voice}</span></div>
              <div className="lobby-members" aria-hidden="true"><i>N</i><i>K</i><i>V</i><i>L</i><i>+</i></div>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">{t.lobbiesSection.view} <Icon name="arrow" /></a>
            </article>
          ))}
        </div>
        <p className="section-note"><i /> {t.lobbiesSection.note}</p>
      </section>

      <section className="games-section" id="games">
        <div className="section">
          <SectionHeading eyebrow={t.gamesSection.eyebrow} title={t.gamesSection.title} text={t.gamesSection.text} />
          <div className="game-grid">
            {t.games.map((game) => (
              <article className={`game-card game-card--${game.tone}`} key={game.name}>
                <span>{game.mark}</span><div><h3>{game.name}</h3><p>{game.genre}</p></div><Icon name="arrow" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section why-section">
        <SectionHeading eyebrow={t.featuresSection.eyebrow} title={t.featuresSection.title} text={t.featuresSection.text} />
        <div className="feature-grid">
          {t.features.map((feature, index) => (
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
            <span className="eyebrow"><i /> {t.journey.eyebrow}</span>
            <h2>{t.journey.title}</h2>
            <p>{t.journey.text}</p>
            <a className="button button--primary" href={DISCORD_URL} target="_blank" rel="noreferrer"><DiscordIcon />{t.journey.action}<Icon name="arrow" /></a>
          </div>
          <div className="journey-steps">
            {t.journey.steps.map((step, index) => <article key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="section control-section">
        <div className="control-shell">
          <div className="control-copy">
            <span className="eyebrow"><i /> {t.control.eyebrow}</span>
            <h2>{t.control.title}</h2>
            <p>{t.control.text}</p>
            <ul><li><Icon name="bot" />{t.control.benefits[0]}</li><li><Icon name="chart" />{t.control.benefits[1]}</li><li><Icon name="message" />{t.control.benefits[2]}</li></ul>
            <a className="text-link" href="/admin">{t.control.action} <Icon name="arrow" /></a>
          </div>
          <div className="dashboard-preview" aria-label={t.aria.dashboardPreview}>
            <div className="dash-sidebar"><Brand compact /><span className="active"><Icon name="chart" /></span><span><Icon name="bot" /></span><span><Icon name="message" /></span></div>
            <div className="dash-content">
              <div className="dash-head"><div><small>TEAM LOBBY</small><strong>{t.control.commandCenter}</strong></div><span><i /> {t.control.systemsOnline}</span></div>
              <div className="dash-stats"><article><small>{t.control.activeMembers}</small><strong>{t.control.live}</strong><span>{t.control.communityOverview}</span></article><article><small>{t.control.botStatus}</small><strong>{t.control.healthy}</strong><span>{t.control.automationsRunning}</span></article></div>
              <div className="dash-chart"><div><small>{t.control.serverActivity}</small><b>{t.control.lastDays}</b></div><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="dash-activity"><small>{t.control.recentActivity}</small><p><i /> {t.control.activityOne} <span>{t.control.now}</span></p><p><i /> {t.control.activityTwo} <span>12m</span></p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-cta" id="community">
        <div className="cta-grid" />
        <Brand />
        <span className="eyebrow"><i /> {t.cta.eyebrow}</span>
        <h2>{t.cta.title}<span>{t.cta.titleAccent}</span></h2>
        <p>{t.cta.text}</p>
        <a className="button button--light" href={DISCORD_URL} target="_blank" rel="noreferrer"><DiscordIcon />{t.cta.action}<Icon name="arrow" /></a>
      </section>

      <section className="section faq-section">
        <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />
        <div className="faq-list">
          {t.faq.items.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <footer>
        <Brand compact />
        <p>{t.footer.copyright}</p>
        <nav aria-label={t.aria.footerNavigation}><a href="#find-players">{t.footer.players}</a><a href="#games">{t.footer.games}</a><a href={DISCORD_URL} target="_blank" rel="noreferrer">{t.footer.discord}</a><a href="/admin">{t.footer.admin}</a></nav>
      </footer>
    </main>
  );
}
