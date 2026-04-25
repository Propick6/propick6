import { ImageResponse } from "next/og";

// 180x180 PNG — iOS home-screen icon when "Add to Home Screen" is used.
// iOS does NOT use the manifest for the install icon, so this file is
// what makes the iPhone install look polished.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 112,
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
