import { ImageResponse } from "next/og";

export const alt = "Zelvra — Watch what matters";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(74,222,128,0.18), transparent 40%), radial-gradient(circle at 80% 100%, rgba(45,212,191,0.10), transparent 40%), #04100a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "Georgia, serif",
          color: "#d8f2e3",
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(74,222,128,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#4ade80",
              boxShadow: "0 0 22px #4ade80",
            }}
          />
          <div
            style={{
              fontFamily: "monospace",
              letterSpacing: 10,
              fontSize: 22,
              color: "#4ade80",
            }}
          >
            ZELVRA
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: "auto",
            fontSize: 110,
            lineHeight: 1.05,
            letterSpacing: -2,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div>Watch what</div>
          <div style={{ color: "#4ade80" }}>matters.</div>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#7a9c89",
            maxWidth: 900,
            position: "relative",
          }}
        >
          AI-powered OSINT intelligence tracker — point it at any URL, get a
          summary when something actually changes.
        </div>

        {/* Footer rule */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "monospace",
            fontSize: 16,
            letterSpacing: 4,
            color: "#7a9c89",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 60,
              height: 2,
              background: "#4ade80",
              opacity: 0.6,
            }}
          />
          OSINT · v0.1
        </div>
      </div>
    ),
    { ...size },
  );
}
