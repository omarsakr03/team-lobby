import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/control/auth";
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale } from "../../../lib/locale";
import DashboardClient from "../dashboard-client";

export const metadata = {
  title: "Command Center",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

const SECTIONS = new Set([
  "bots",
  "security",
  "games",
  "members",
  "commands",
  "logs",
  "permissions",
  "settings",
  "profile"
]);

export default async function AdminSectionPage({ params }) {
  const { section } = await params;
  if (!SECTIONS.has(section)) notFound();

  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    DEFAULT_LOCALE
  );

  return (
    <DashboardClient
      initialUser={user}
      initialLocale={initialLocale}
      initialView={section}
    />
  );
}
