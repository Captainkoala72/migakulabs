import { ImageResponse } from "next/og";

export const alt = "MiGaKu Labs — practical AI instruments";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0E0F0F",
          color: "#ECEAE4",
          backgroundImage:
            "linear-gradient(rgba(236,234,228,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(236,234,228,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#82807A", letterSpacing: 4 }}>
          <span>MIGAKU LABS / INDEX</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12, color: "#FF5A1F" }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: "#FF5A1F" }} />
            EXP-001 LIVE
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 0.95, display: "flex", flexDirection: "column" }}>
            <span>Practical AI instruments,</span>
            <span style={{ color: "#56554F" }}>built in the open.</span>
          </div>
          <div style={{ fontSize: 30, color: "#B6B4AE" }}>First off the bench: Prompt Forge — Polish ↔ Optimize across 7 models.</div>
        </div>
        <div style={{ display: "flex", height: 6, background: "#FF5A1F", width: 240 }} />
      </div>
    ),
    size
  );
}
