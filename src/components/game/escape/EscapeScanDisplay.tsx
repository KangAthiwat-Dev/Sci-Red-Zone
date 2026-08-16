"use client";

import { Html } from "@react-three/drei";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ESCAPE_SCAN_DURATION,
  ESCAPE_SCAN_UI_POSITION,
  ESCAPE_WARNING_DURATION,
} from "./escapeConfig";

type EscapeScanDisplayProps = {
  active: boolean;
  onComplete: () => void;
};

type ScanStage =
  | "scan"
  | "warning";

export default function EscapeScanDisplay({
  active,
  onComplete,
}: EscapeScanDisplayProps) {
  const [percentage, setPercentage] =
    useState(100);

  const [stage, setStage] =
    useState<ScanStage>("scan");

  /*
   * กัน effect restart เพราะ
   * onComplete จาก GameScene เปลี่ยน reference
   */
  const onCompleteRef =
    useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current =
      onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setPercentage(100);
      setStage("scan");

      return;
    }

    setPercentage(100);
    setStage("scan");

    const startedAt =
      performance.now();

    let scanTimer:
      | number
      | null = null;

    let warningTimer:
      | number
      | null = null;

    const updateScan = () => {
      const elapsed =
        performance.now() -
        startedAt;

      const progress =
        Math.min(
          elapsed /
            ESCAPE_SCAN_DURATION,
          1,
        );

      /*
       * 100 → 10
       */
      const nextPercentage =
        Math.round(
          100 -
            progress * 90,
        );

      setPercentage(
        Math.max(
          10,
          nextPercentage,
        ),
      );

      if (progress >= 1) {
        if (scanTimer !== null) {
          window.clearInterval(
            scanTimer,
          );

          scanTimer = null;
        }

        setPercentage(10);
        setStage("warning");

        warningTimer =
          window.setTimeout(
            () => {
              onCompleteRef.current();
            },
            ESCAPE_WARNING_DURATION,
          );
      }
    };

    scanTimer =
      window.setInterval(
        updateScan,
        50,
      );

    updateScan();

    return () => {
      if (scanTimer !== null) {
        window.clearInterval(
          scanTimer,
        );
      }

      if (warningTimer !== null) {
        window.clearTimeout(
          warningTimer,
        );
      }
    };
  }, [active]);

  if (!active) {
    return null;
  }

  const barColor =
    percentage <= 30
      ? "bg-red-500"
      : percentage <= 60
        ? "bg-amber-400"
        : "bg-emerald-400";

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
            border-white/20
            bg-black/90
            px-5
            py-4
            font-mono
            text-white
            shadow-2xl
            backdrop-blur-md
          "
        >
          {stage === "scan" && (
            <>
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/10
                  pb-2
                "
              >
                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.28em]
                    text-emerald-300
                  "
                >
                  BIOLOGICAL SCAN
                </span>

                <span
                  className="
                    h-2
                    w-2
                    animate-pulse
                    rounded-full
                    bg-emerald-400
                  "
                />
              </div>

              <div
                className="
                  mt-4
                  text-center
                "
              >
                <div
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.22em]
                    text-white/50
                  "
                >
                  SAMPLE INTEGRITY
                </div>

                <div
                  className={`
                    mt-1
                    text-5xl
                    font-bold
                    ${
                      percentage <= 30
                        ? "text-red-400"
                        : percentage <= 60
                          ? "text-amber-300"
                          : "text-emerald-300"
                    }
                  `}
                >
                  {percentage}
                  <span
                    className="
                      ml-1
                      text-xl
                    "
                  >
                    %
                  </span>
                </div>
              </div>

              <div
                className="
                  mt-4
                  h-2
                  overflow-hidden
                  bg-white/10
                "
              >
                <div
                  className={`
                    h-full
                    transition-[width]
                    duration-100
                    ${barColor}
                  `}
                  style={{
                    width:
                      `${percentage}%`,
                  }}
                />
              </div>

              <div
                className="
                  mt-3
                  text-[9px]
                  uppercase
                  tracking-[0.16em]
                  text-white/40
                "
              >
                ANALYZING
                BIOLOGICAL SAMPLE...
              </div>
            </>
          )}

          {stage === "warning" && (
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
                10%
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
          )}
        </div>
      </Html>
    </group>
  );
}