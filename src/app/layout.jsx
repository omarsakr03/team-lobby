import "./styles/globals.css";

export const metadata = {
  metadataBase: new URL("https://team-lobby-phi.vercel.app"),
  title: {
    default: "Team Lobby — Find Your Squad",
    template: "%s | Team Lobby",
  },
  description: "Find teammates, build squads, and join an Arab gaming community built for better games together.",
  keywords: ["Team Lobby", "gaming community", "find teammates", "Discord gaming", "Arab gamers"],
  openGraph: {
    title: "Team Lobby — Find Your Squad. Own the Lobby.",
    description: "Meet players who match your game, rank, and vibe. Build squads, join events, and never queue alone.",
    type: "website",
    locale: "en_US",
    siteName: "Team Lobby",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Lobby — Find Your Squad",
    description: "Meet players, build squads, and play as one.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
