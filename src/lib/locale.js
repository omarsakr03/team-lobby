export const SUPPORTED_LOCALES = ["ar", "en"];
export const DEFAULT_LOCALE = "ar";
export const LOCALE_COOKIE = "team-lobby-locale";
export const LOCALE_STORAGE_KEY = "team-lobby-locale";
export const LEGACY_LOCALE_STORAGE_KEY = "team-lobby-control-locale";

export function isLocale(value) {
  return SUPPORTED_LOCALES.includes(value);
}

export function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  return isLocale(value) ? value : fallback;
}

export function localeDirection(locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localeFromAcceptLanguage(value) {
  const languages = String(value || "")
    .split(",")
    .map((item) => item.trim().split(";")[0].toLowerCase());

  for (const language of languages) {
    if (language === "ar" || language.startsWith("ar-")) return "ar";
    if (language === "en" || language.startsWith("en-")) return "en";
  }

  return DEFAULT_LOCALE;
}

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const item = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : "";
}

export function readClientLocale(fallback = DEFAULT_LOCALE) {
  if (typeof window === "undefined") return fallback;

  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    || window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY)
    || readCookie(LOCALE_COOKIE);

  return normalizeLocale(saved, fallback);
}

export function persistClientLocale(value) {
  if (typeof window === "undefined") return;

  const locale = normalizeLocale(value);
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.documentElement.lang = locale;
  document.documentElement.dir = localeDirection(locale);
}
