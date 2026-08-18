"use client";

import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useInteractionLocked } from "../interactions/InteractionLockContext";

import {
  ESCAPE_CONTROL_POSITION,
  ESCAPE_CONTROL_TRIGGER_SIZE,
  ESCAPE_SCAN_COMPLETE_PERCENTAGE,
  ESCAPE_SCAN_DURATION,
} from "./escapeConfig";

type EscapeControlConsoleProps = {
  enabled: boolean;

  onHoldingChange?: (holding: boolean) => void;

  onComplete: () => void;
};

function buildGraphPoints(percentage: number) {
  const width = 184;

  const height = 54;

  const left = 8;

  const top = 8;

  return Array.from({ length: 9 }, (_, index) => {
    const progress = index / 8;

    const value =
      100 - (100 - percentage) * progress + Math.sin(index * 1.7) * 1.8;

    const clampedValue = Math.max(
      ESCAPE_SCAN_COMPLETE_PERCENTAGE,
      Math.min(100, value),
    );

    const x = left + width * progress;

    const y =
      top +
      ((100 - clampedValue) / (100 - ESCAPE_SCAN_COMPLETE_PERCENTAGE)) *
        height;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export default function EscapeControlConsole({
  enabled,
  onHoldingChange,
  onComplete,
}: EscapeControlConsoleProps) {
  const interactionLocked =
    useInteractionLocked();

  const [playerNear, setPlayerNear] =
    useState(false);

  const [isHolding, setIsHolding] =
    useState(false);

  const [percentage, setPercentage] =
    useState(100);

  const [completed, setCompleted] =
    useState(false);

  const playerNearRef =
    useRef(false);

  const holdingRef =
    useRef(false);

  const completedRef =
    useRef(false);

  const percentageRef =
    useRef(100);

  const onHoldingChangeRef =
    useRef(onHoldingChange);

  const onCompleteRef =
    useRef(onComplete);

  const graphPoints = useMemo(
    () => buildGraphPoints(percentage),
    [percentage],
  );

  const progress =
    ((percentage - ESCAPE_SCAN_COMPLETE_PERCENTAGE) /
      (100 - ESCAPE_SCAN_COMPLETE_PERCENTAGE)) *
    100;

  useEffect(() => {
    onHoldingChangeRef.current =
      onHoldingChange;
  }, [onHoldingChange]);

  useEffect(() => {
    onCompleteRef.current =
      onComplete;
  }, [onComplete]);

  const setHolding =
    useCallback((next: boolean) => {
      if (holdingRef.current === next) {
        return;
      }

      holdingRef.current = next;

      setIsHolding(next);

      onHoldingChangeRef.current?.(next);
    }, []);

  const stopHolding =
    useCallback(() => {
      setHolding(false);
    }, [setHolding]);

  useEffect(() => {
    if (!enabled) {
      stopHolding();
    }
  }, [enabled, stopHolding]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "KeyE") {
        return;
      }

      if (event.repeat) {
        return;
      }

      if (
        !enabled ||
        completedRef.current ||
        interactionLocked ||
        !playerNearRef.current
      ) {
        return;
      }

      setHolding(true);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code !== "KeyE") {
        return;
      }

      stopHolding();
    }

    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("keyup", handleKeyUp);

    window.addEventListener("blur", stopHolding);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      window.removeEventListener("keyup", handleKeyUp);

      window.removeEventListener("blur", stopHolding);
    };
  }, [
    enabled,
    interactionLocked,
    setHolding,
    stopHolding,
  ]);

  useFrame((_, delta) => {
    if (
      !enabled ||
      completedRef.current ||
      !holdingRef.current ||
      !playerNearRef.current
    ) {
      return;
    }

    const safeDelta =
      Math.min(delta, 0.1);

    const decreasePerSecond =
      (100 - ESCAPE_SCAN_COMPLETE_PERCENTAGE) /
      (ESCAPE_SCAN_DURATION / 1000);

    const nextPercentage =
      Math.max(
        ESCAPE_SCAN_COMPLETE_PERCENTAGE,
        percentageRef.current - decreasePerSecond * safeDelta,
      );

    percentageRef.current =
      nextPercentage;

    setPercentage(
      Math.round(nextPercentage),
    );

    if (nextPercentage > ESCAPE_SCAN_COMPLETE_PERCENTAGE) {
      return;
    }

    completedRef.current = true;

    percentageRef.current =
      ESCAPE_SCAN_COMPLETE_PERCENTAGE;

    setCompleted(true);

    setPercentage(
      ESCAPE_SCAN_COMPLETE_PERCENTAGE,
    );

    stopHolding();

    onCompleteRef.current();
  });

  if (!enabled) {
    return null;
  }

  return (
    <RigidBody
  type="fixed"
  colliders={false}
>
  <CuboidCollider
    sensor
    args={ESCAPE_CONTROL_TRIGGER_SIZE}
    position={ESCAPE_CONTROL_POSITION}
    onIntersectionEnter={({ other }) => {
      if (other.rigidBodyObject?.name !== "player") {
        return;
      }

      playerNearRef.current = true;
      setPlayerNear(true);
    }}
    onIntersectionExit={({ other }) => {
      if (other.rigidBodyObject?.name !== "player") {
        return;
      }

      playerNearRef.current = false;
      setPlayerNear(false);

      stopHolding();
    }}
  />

  {playerNear && !completed && (
    <group position={ESCAPE_CONTROL_POSITION}>
      <Html
        transform
        sprite
        center
        distanceFactor={7}
        position={[0, 2.65, 0]}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          className="
            w-80
            select-none
            overflow-hidden
            border
            border-cyan-300/25
            bg-slate-950/90
            font-mono
            text-white
            shadow-2xl
            backdrop-blur-md
          "
        >
          {/* HEADER */}
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-white/10
              px-4
              py-3
            "
          >
            <div>
              <div
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.24em]
                  text-cyan-300
                "
              >
                Infection Dashboard
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  font-bold
                  text-white/75
                "
              >
                ผู้ติดเชื้อคงเหลือ
              </div>
            </div>

            <div
              className={`
                h-2.5
                w-2.5
                rounded-full
                ${
                  isHolding
                    ? "animate-pulse bg-cyan-300"
                    : "bg-white/35"
                }
              `}
            />
          </div>

          {/* PERCENTAGE */}
          <div className="px-4 pt-4">
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="
                    flex
                    items-start
                    text-red-400
                  "
                >
                  <span
                    className="
                      text-5xl
                      font-black
                      leading-none
                    "
                  >
                    {percentage}
                  </span>

                  <span
                    className="
                      ml-1
                      mt-1
                      text-xl
                      font-bold
                      text-red-300
                    "
                  >
                    %
                  </span>
                </div>

                <div
                  className="
                    mt-2
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-white/40
                  "
                >
                  infected remaining
                </div>
              </div>

              <div
                className={`
                  mb-1
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  ${
                    isHolding
                      ? "text-cyan-300"
                      : "text-white/35"
                  }
                `}
              >
                {isHolding ? "Decreasing" : "Standby"}
              </div>
            </div>
          </div>

          {/* AREA GRAPH */}
          <div className="relative mt-3">
            <svg
              viewBox="0 0 200 90"
              className="
                h-[110px]
                w-full
                overflow-visible
              "
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                {/* พื้นที่ใต้กราฟ */}
                <linearGradient
                  id="escape-infection-area"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#f87171"
                    stopOpacity="0.55"
                  />

                  <stop
                    offset="45%"
                    stopColor="#fb7185"
                    stopOpacity="0.25"
                  />

                  <stop
                    offset="100%"
                    stopColor="#22d3ee"
                    stopOpacity="0"
                  />
                </linearGradient>

                {/* สีเส้น */}
                <linearGradient
                  id="escape-infection-line"
                  x1="0"
                  x2="1"
                  y1="0"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="#f87171"
                  />

                  <stop
                    offset="55%"
                    stopColor="#fb7185"
                  />

                  <stop
                    offset="100%"
                    stopColor="#22d3ee"
                  />
                </linearGradient>

                {/* Glow */}
                <filter
                  id="escape-infection-glow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feGaussianBlur
                    stdDeviation="2"
                    result="blur"
                  />

                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* GRID */}
              <line
                x1="0"
                y1="18"
                x2="200"
                y2="18"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />

              <line
                x1="0"
                y1="45"
                x2="200"
                y2="45"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />

              <line
                x1="0"
                y1="72"
                x2="200"
                y2="72"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />

              {/* AREA */}
              <polygon
                points={`${graphPoints} 192,90 8,90`}
                fill="url(#escape-infection-area)"
              />

              {/* GRAPH LINE */}
              <polyline
                points={graphPoints}
                fill="none"
                stroke="url(#escape-infection-line)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                filter="url(#escape-infection-glow)"
              />

              {/* BOTTOM LINE */}
              <line
                x1="0"
                y1="89"
                x2="200"
                y2="89"
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="1"
              />
            </svg>

            {/* FADE ด้านล่าง */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-8
                bg-gradient-to-t
                from-slate-950/80
                to-transparent
              "
            />
          </div>

          {/* STATUS */}
          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-white/10
              px-4
              py-3
            "
          >
            <div
              className={`
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                ${
                  isHolding
                    ? "text-cyan-300"
                    : "text-white/45"
                }
              `}
            >
              {isHolding
                ? "ลดจำนวนผู้ติดเชื้อ..."
                : "กด E ค้างเพื่อเริ่มลดค่า"}
            </div>

            <div
              className="
                text-[9px]
                uppercase
                tracking-wider
                text-white/25
              "
            >
              ESC-01
            </div>
          </div>
        </div>
      </Html>
    </group>
  )}
</RigidBody>
  );
}
