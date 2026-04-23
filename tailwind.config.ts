import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#07090D",
        panel: "#0E1218",
        panel2: "#141924",
        border: "#1F2632",
        text: "#E6E9EF",
        muted: "#8A92A3",
        green: "#00E676",
        gold: "#FFD700",
        blue: "#00C2FF",
        hot: "#FF5252",
        cold: "#4FC3F7",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "Impact", "sans-serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 230, 118, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
