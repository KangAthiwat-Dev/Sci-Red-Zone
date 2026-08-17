import { ImageResponse } from "next/og";

// ========================================
// Icon Metadata
// ========================================

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

// ========================================
// SCI Red Zone Icon
// ========================================

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
          background: "transparent",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle at 30% 30%, #1a1a1a 0%, #0b0f0c 55%, #061108 100%)",
            boxShadow:
              "0 0 12px rgba(34,197,94,0.35), inset 0 0 10px rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-1px",
              color: "#d1fae5",
              textShadow:
                "0 0 6px rgba(34,197,94,0.75)",
            }}
          >
            RZ
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}