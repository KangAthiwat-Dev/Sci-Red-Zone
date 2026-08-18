"use client";

import { Html } from "@react-three/drei";

import {
  ESCAPE_SCAN_COMPLETE_PERCENTAGE,
  ESCAPE_SCAN_UI_POSITION,
} from "./escapeConfig";

type EscapeScanDisplayProps = {
  active: boolean;
};

export default function EscapeScanDisplay({
  active,
}: EscapeScanDisplayProps) {
  if (!active) {
    return null;
  }

  return (
    <group
      position={
        ESCAPE_SCAN_UI_POSITION
      }
    >
      <Html
        transform
        sprite
        center
        distanceFactor={7}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          className="
            w-70
            select-none
            border
            border-red-400/35
            bg-black/90
            px-5
            py-4
            font-mono
            text-white
            shadow-2xl
            backdrop-blur-md
          "
        >
          <div
            className="
              text-center
            "
          >
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-red-400
              "
            >
              ⚠ ANOMALY DETECTED
            </div>

            <div
              className="
                mt-4
                text-4xl
                font-black
                text-red-400
              "
            >
              {ESCAPE_SCAN_COMPLETE_PERCENTAGE}%
            </div>

            <div
              className="
                mt-4
                border-y
                border-red-500/30
                py-3
              "
            >
              <div
                className="
                  text-sm
                  font-bold
                  text-red-300
                "
              >
                ตรวจพบสิ่งผิดปกติ
              </div>

              <div
                className="
                  mt-1
                  text-lg
                  font-black
                  text-white
                "
              >
                ตรวจพบเชื้อกลายพันธุ์
              </div>
            </div>

            <div
              className="
                mt-3
                animate-pulse
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-red-400
              "
            >
              CONTAINMENT FAILURE
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
