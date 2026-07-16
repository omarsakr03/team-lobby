import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/control/auth";
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale } from "../../lib/locale";
import DashboardClient from "./dashboard-client";
import "./admin.css";

export const metadata = {
  title: "Command Center",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let user;

  try {
    user = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value, DEFAULT_LOCALE);

  return <DashboardClient initialUser={user} initialLocale={initialLocale} />;
}
