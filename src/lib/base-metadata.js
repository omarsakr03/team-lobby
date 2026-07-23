export const baseMetadata = {
  metadataBase: new URL("https://team-lobby.ddns.net"),
  title: {
    default: "Team Lobby — كوّن فريقك",
    template: "%s | Team Lobby"
  },
  description: "اعثر على لاعبين يشاركونك ألعابك وأسلوبك، وكوّن فريقك داخل مجتمع ألعاب عربي احترافي على Discord.",
  keywords: ["Team Lobby", "مجتمع ألعاب عربي", "البحث عن لاعبين", "فرق ديسكورد", "لاعبون عرب"],
  openGraph: {
    title: "Team Lobby — كوّن فريقك وسيطر على اللوبي",
    description: "قابل لاعبين يناسبون لعبتك ورتبتك وأسلوبك، وكوّن فريقًا لا يتوقف.",
    type: "website",
    locale: "ar_AR",
    siteName: "Team Lobby"
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Lobby — كوّن فريقك",
    description: "قابل لاعبين، كوّن فريقك، والعبوا كفريق واحد."
  },
  robots: { index: true, follow: true }
};

export const baseViewport = {
  themeColor: "#05060a",
  colorScheme: "dark"
};
