import Link from "next/link";
import SignInButton from "./sign-in-button";
import "./login.css";

export const metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false }
};

function BrandMark() {
  return (
    <svg className="login-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 3 42 13v22L24 45 6 35V13L24 3Z" />
      <path d="m24 10 11 6v14l-11 8-11-8V16l11-6Z" />
      <path d="M17 18h14v5h-4.5v9h-5v-9H17v-5Z" />
    </svg>
  );
}

export default async function AdminLogin({ searchParams }) {
  const params = await searchParams;
  const reason = params?.error;

  return (
    <main className="login-page">
      <div className="login-grid" />
      <div className="login-glow login-glow--one" />
      <div className="login-glow login-glow--two" />

      <Link className="login-back" href="/">← Back to Team Lobby</Link>

      <section className="login-card">
        <div className="login-brand"><BrandMark /><span>TEAM <b>LOBBY</b></span></div>
        <span className="login-eyebrow"><i /> Secure control plane</span>
        <h1>Command center access.</h1>
        <p>Sign in with the authorized Discord account to manage bots, inspect health, read safe logs, and send approved direct messages.</p>

        {reason === "unauthorized" && (
          <div className="login-alert" role="alert">This Discord account is not on the admin allowlist.</div>
        )}
        {reason === "oauth" && (
          <div className="login-alert" role="alert">Discord sign in did not complete. Please try again.</div>
        )}

        <SignInButton />

        <div className="login-security">
          <span><i /> Discord identity verified</span>
          <span><i /> Owner allowlist enforced</span>
          <span><i /> No public control endpoints</span>
        </div>
      </section>

      <p className="login-foot">Protected admin surface · Team Lobby © 2026</p>
    </main>
  );
}
