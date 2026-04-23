import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Pro Pick 6 — Daily Sports Picks Marketplace",
  description:
    "Unlock the hottest cappers' daily picks. 6 picks minimum, $5 per unlock, today only.",
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
