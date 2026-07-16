import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale } from "../../../lib/locale";
import LoginPanel from "./login-panel";
import "./login.css";

export const metadata = {
  title: "Team Lobby Control · Sign in",
  robots: { index: false, follow: false }
};

export default async function AdminLogin({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const initialLanguage = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value, DEFAULT_LOCALE);

  return <LoginPanel reason={params?.error || ""} initialLanguage={initialLanguage} />;
}
