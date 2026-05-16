import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tabodis — Bienes raíces y gestión integral";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#f3ecdf",
          color: "#1c2747",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#4b5575",
          }}
        >
          Est. 2019 — Alicante, ES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 132,
              lineHeight: 1,
              fontWeight: 400,
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: -2,
            }}
          >
            Bienes raíces
          </div>
          <div
            style={{
              fontSize: 132,
              lineHeight: 1,
              fontWeight: 400,
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: -2,
            }}
          >
            y <span style={{ fontStyle: "italic", color: "#c97644" }}>gestión</span>{" "}
            integral.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 400,
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: -1.5,
            }}
          >
            Tabo<span style={{ fontStyle: "italic", color: "#e69664" }}>·</span>dis
            <span style={{ fontStyle: "italic", color: "#e69664" }}>.</span>
          </div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#4b5575",
            }}
          >
            www.tabodis.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
