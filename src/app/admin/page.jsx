import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/control/auth";
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

  return <DashboardClient initialUser={user} />;
}
