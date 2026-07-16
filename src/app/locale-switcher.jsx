"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { persistClientLocale } from "../lib/locale";

export default function LocaleSwitcher({ locale, label, ariaLabel }) {
  const router = useRouter();

  useEffect(() => {
    persistClientLocale(locale);
  }, [locale]);

  function switchLocale() {
    const nextLocale = locale === "ar" ? "en" : "ar";
    const hash = window.location.hash;
    persistClientLocale(nextLocale);
    router.push(`/${nextLocale}${hash}`);
  }

  return (
    <button className="locale-switcher" type="button" onClick={switchLocale} aria-label={ariaLabel}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
