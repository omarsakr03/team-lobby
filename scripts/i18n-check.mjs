import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  localeDirection,
  localeFromAcceptLanguage,
  normalizeLocale,
  SUPPORTED_LOCALES
} from "../src/lib/locale.js";
import { SITE_COPY } from "../src/lib/site-copy.js";

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]));
  }
  return typeof value;
}

function validateStrings(value, path = "copy") {
  if (typeof value === "string") {
    assert(value.trim(), `${path} must not be empty`);
    return;
  }

  if (Array.isArray(value)) {
    assert(value.length, `${path} must not be an empty array`);
    value.forEach((item, index) => validateStrings(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => validateStrings(item, `${path}.${key}`));
  }
}

assert.deepEqual(SUPPORTED_LOCALES, ["ar", "en"]);
assert.equal(localeDirection("ar"), "rtl");
assert.equal(localeDirection("en"), "ltr");
assert.equal(normalizeLocale("ar"), "ar");
assert.equal(normalizeLocale("unknown"), "ar");
assert.equal(localeFromAcceptLanguage("ar-EG,ar;q=0.9,en;q=0.8"), "ar");
assert.equal(localeFromAcceptLanguage("en-US,en;q=0.9"), "en");

assert.deepEqual(shape(SITE_COPY.en), shape(SITE_COPY.ar), "Arabic and English dictionaries must have identical shapes");
validateStrings(SITE_COPY.en, "SITE_COPY.en");
validateStrings(SITE_COPY.ar, "SITE_COPY.ar");
assert.match(JSON.stringify(SITE_COPY.ar), /[\u0600-\u06ff]/, "Arabic copy must contain Arabic text");

const publicPage = await readFile(new URL("../src/app/[locale]/page.jsx", import.meta.url), "utf8");
const publicLayout = await readFile(new URL("../src/app/[locale]/layout.jsx", import.meta.url), "utf8");
const redirectPage = await readFile(new URL("../src/app/(redirect)/page.jsx", import.meta.url), "utf8");
const dashboard = await readFile(new URL("../src/app/admin/dashboard-client.jsx", import.meta.url), "utf8");
const login = await readFile(new URL("../src/app/admin/login/login-panel.jsx", import.meta.url), "utf8");
const globalCss = await readFile(new URL("../src/app/styles/globals.css", import.meta.url), "utf8");

assert(publicPage.includes("SITE_COPY[locale]"));
assert(publicPage.includes("LocaleSwitcher"));
assert(publicPage.includes("languages: { ar: \"/ar\", en: \"/en\""));
assert(publicLayout.includes("<html lang={language} dir={localeDirection(language)}>"));
assert(redirectPage.includes("localeFromAcceptLanguage"));
assert(redirectPage.includes("LOCALE_COOKIE"));
assert(dashboard.includes("persistClientLocale(locale)"));
assert(dashboard.includes("href={`/${locale}`}"));
assert(login.includes("href={`/${language}`}"));
assert(globalCss.includes('.site-shell[lang="ar"]'));
assert(globalCss.includes('.site-shell[dir="rtl"] .icon--arrow'));

console.log("Arabic and English localization checks passed.");
