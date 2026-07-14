"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SignInButton from "./sign-in-button";

const copy = {
  en: {
    back: "Back to Team Lobby",
    eyebrow: "Secure control plane",
    title: "Command center access.",
    description: "Sign in with the authorized Discord account to manage bots, configure approved commands, inspect safe logs, and review every action.",
    unauthorized: "This Discord account is not on the admin allowlist.",
    oauth: "Discord sign in did not complete. Please try again.",
    checks: ["Discord identity verified", "Owner allowlist enforced", "No public control endpoints"],
    footer: "Protected admin surface · Team Lobby © 2026",
    toggle: "العربية"
  },
  ar: {
    back: "العودة إلى Team Lobby",
    eyebrow: "منظومة تحكم آمنة",
    title: "الدخول إلى مركز التحكم.",
    description: "سجّل الدخول بحساب Discord المصرّح به لإدارة البوتات، وضبط الأوامر المعتمدة، ومراجعة السجلات الآمنة وكل العمليات.",
    unauthorized: "حساب Discord هذا غير موجود في قائمة المشرفين المصرّح لهم.",
    oauth: "لم يكتمل تسجيل الدخول عبر Discord. حاول مرة أخرى.",
    checks: ["التحقق من هوية Discord", "تطبيق قائمة المالكين المصرّح لهم", "لا توجد نقاط تحكم عامة"],
    footer: "واجهة إدارة محمية · Team Lobby © 2026",
    toggle: "English"
  }
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

export default function LoginPanel({ reason }) {
  const [language, setLanguage] = useState("en");
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem("team-lobby-control-locale");
    if (saved === "ar" || saved === "en") setLanguage(saved);
  }, []);

  function toggleLanguage() {
    const next = language === "en" ? "ar" : "en";
    setLanguage(next);
    window.localStorage.setItem("team-lobby-control-locale", next);
  }

  return (
    <main className="login-page" dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <div className="login-grid" />
      <div className="login-glow login-glow--one" />
      <div className="login-glow login-glow--two" />

      <div className="login-topbar">
        <Link className="login-back" href="/">← {t.back}</Link>
        <button className="login-language" type="button" onClick={toggleLanguage}>
          <span aria-hidden="true">◎</span> {t.toggle}
        </button>
      </div>

      <section className="login-card">
        <div className="login-brand"><BrandMark /><span>TEAM <b>LOBBY</b></span></div>
        <span className="login-eyebrow"><i /> {t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.description}</p>

        {reason === "unauthorized" && (
          <div className="login-alert" role="alert">{t.unauthorized}</div>
        )}
        {reason === "oauth" && (
          <div className="login-alert" role="alert">{t.oauth}</div>
        )}

        <SignInButton language={language} />

        <div className="login-security">
          {t.checks.map((item) => <span key={item}><i /> {item}</span>)}
        </div>
      </section>

      <p className="login-foot">{t.footer}</p>
    </main>
  );
}
