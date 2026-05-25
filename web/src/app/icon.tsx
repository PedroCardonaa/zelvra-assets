import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#04100a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        {/* Phosphor dot inside a faint ring — radar mark */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            border: "1.5px solid rgba(74,222,128,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#4ade80",
              boxShadow: "0 0 8px #4ade80",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
