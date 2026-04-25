import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Pro Pick 6 — Daily Sports Picks Marketplace",
  description:
    "Unlock the hottest cappers' daily picks. 6 picks minimum, $5 per unlock, today only.",
  // Tell iOS Safari to treat this as a standalone web app when the user
  // adds it to their home screen — the URL bar and Safari chrome go away,
  // and the app launches full-screen like a native app.
  appleWebApp: {
    capable: true,
    title: "Pro Pick 6",
    statusBarStyle: "black-translucent",
  },
};

// Viewport is its own export in Next.js 14 (moved out of metadata).
// themeColor sets the Android Chrome address bar color and the iOS
// status bar tint when launched as an installed app.
export const viewport: Viewport = {
  themeColor: "#07090D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text min-h-screen">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 pb-24 pt-4">{children}</main>
        <footer className="text-center text-muted text-xs py-8">
          © {new Date().getFullYear()} Pro Pick 6 — For entertainment only. 19+.
        </footer>
      </body>
    </html>
  );
}
