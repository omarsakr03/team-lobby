import { cookies } from "next/headers";
import "../styles/globals.css";
import { baseMetadata, baseViewport } from "../../lib/base-metadata";
import { DEFAULT_LOCALE, LOCALE_COOKIE, localeDirection, normalizeLocale } from "../../lib/locale";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default async function AdminRootLayout({ children }) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value, DEFAULT_LOCALE);

  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
