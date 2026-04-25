import type { MetadataRoute } from "next";

// PWA manifest. Tells Android Chrome (and any other Chromium-based mobile
// browser) that this is an installable web app, and what icon / colors /
// display mode to use when the user taps "Install app" or "Add to Home screen".
//
// iOS does NOT use this manifest for the install icon — it reads
// /apple-icon (from app/apple-icon.tsx) instead. iOS DOES respect the
// theme_color via a meta tag in layout.tsx, but the rest of this file is
// effectively Android-only.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pro Pick 6",
    short_name: "Pro Pick 6",
    description:
      "Daily sports picks marketplace — unlock the hottest cappers' picks.",
    start_url: "/",
    display: "standalone", // launches without browser chrome — feels native
    orientation: "portrait",
    background_color: "#07090D", // matches the app's dark bg → seamless splash
    theme_color: "#00E676", // green status bar / address bar accent
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
