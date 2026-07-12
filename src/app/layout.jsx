import "../styles/globals.css";

export const metadata = {
  title: "Team Lobby | Gaming Community",
  description: "Find teams, play games and join the lobby community."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}