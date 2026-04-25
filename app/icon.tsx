import { ImageResponse } from "next/og";

// 192x192 PNG generated at build time. Doubles as favicon and the main
// Android home-screen icon when the app is installed as a PWA.
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090D",
          fontSize: 120,
          fontWeight: 900,
          letterSpacing: "-6px",
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ color: "#ffffff" }}>P</span>
        <span style={{ color: "#00E676" }}>6</span>
      </div>
    ),
    { ...size }
  );
}
