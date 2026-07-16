import "../styles/globals.css";
import { baseMetadata, baseViewport } from "../../lib/base-metadata";
import { isLocale, localeDirection } from "../../lib/locale";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default async function PublicRootLayout({ children, params }) {
  const { locale } = await params;
  const language = isLocale(locale) ? locale : "en";

  return (
    <html lang={language} dir={localeDirection(language)}>
      <body>{children}</body>
    </html>
  );
}
