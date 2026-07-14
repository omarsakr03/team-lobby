import LoginPanel from "./login-panel";
import "./login.css";

export const metadata = {
  title: "Team Lobby Control · Sign in",
  robots: { index: false, follow: false }
};

export default async function AdminLogin({ searchParams }) {
  const params = await searchParams;

  return <LoginPanel reason={params?.error || ""} />;
}
