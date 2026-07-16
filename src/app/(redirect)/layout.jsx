import "../styles/globals.css";
import { baseMetadata, baseViewport } from "../../lib/base-metadata";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function RedirectRootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
