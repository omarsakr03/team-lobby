"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 5.3A16 16 0 0 0 15 4.1l-.5 1a14 14 0 0 0-5 0l-.5-1a16 16 0 0 0-4 1.2C2.5 9 1.8 12.5 2.1 16a16 16 0 0 0 4.8 2.4l1.2-1.6-1.7-.8.4-.3a11.5 11.5 0 0 0 10.4 0l.4.3-1.7.8 1.2 1.6A16 16 0 0 0 21.9 16c.4-4.1-.7-7.6-3-10.7ZM8.5 14.2c-1 0-1.8-1-1.8-2.1S7.5 10 8.5 10s1.8 1 1.8 2.1-.8 2.1-1.8 2.1Zm7 0c-1 0-1.8-1-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1Z" />
    </svg>
  );
}

export default function SignInButton({ language = "ar" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setBusy(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          scopes: "identify"
        }
      });

      if (authError) {
        throw authError;
      }
    } catch (authError) {
      setError(authError?.message || (language === "ar"
        ? "تعذر بدء تسجيل الدخول عبر Discord."
        : "Could not start Discord sign in."));
      setBusy(false);
    }
  }

  return (
    <div className="login-action">
      <button type="button" onClick={signIn} disabled={busy}>
        <DiscordIcon />
        {busy
          ? (language === "ar" ? "جارٍ فتح Discord…" : "Opening Discord…")
          : (language === "ar" ? "المتابعة عبر Discord" : "Continue with Discord")}
        <span>→</span>
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
