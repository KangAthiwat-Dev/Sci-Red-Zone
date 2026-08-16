"use client";

import { Html } from "@react-three/drei";

import {
  CuboidCollider,
  RigidBody,
} from "@react-three/rapier";

import { useFrame } from "@react-three/fiber";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type HoldInteractionTriggerProps = {
  position: [
    number,
    number,
    number,
  ];

  halfExtents?: [
    number,
    number,
    number,
  ];

  label: string;

  enabled?: boolean;

  holdDuration?: number;

  onComplete: () => void;

  onHoldingChange?: (
    holding: boolean,
  ) => void;
};

// ========================================
// Circular Progress
// ========================================

const RING_RADIUS = 28;

const RING_CIRCUMFERENCE =
  2 * Math.PI * RING_RADIUS;

export default function HoldInteractionTrigger({
  position,
  halfExtents = [1.5, 2, 1.5],
  label,
  enabled = true,
  holdDuration = 1.5,
  onComplete,
  onHoldingChange,
}: HoldInteractionTriggerProps) {
  const playerCollidersRef =
    useRef<Set<number>>(
      new Set(),
    );

  const playerNearRef =
    useRef(false);

  const holdingRef =
    useRef(false);

  const holdTimeRef =
    useRef(0);

  const completedRef =
    useRef(false);

  /*
   * UI refs
   *
   * ไม่ใช้ setState ทุก frame แล้ว
   */
  const progressCircleRef =
    useRef<SVGCircleElement | null>(
      null,
    );

  const percentageRef =
    useRef<HTMLSpanElement | null>(
      null,
    );

  const [
    isPlayerNear,
    setIsPlayerNear,
  ] = useState(false);

  const [
    isHolding,
    setIsHolding,
  ] = useState(false);

  // ========================================
  // Reset Circular UI
  // ========================================

  function resetProgressUI() {
    if (
      progressCircleRef.current
    ) {
      progressCircleRef.current.style
        .strokeDashoffset =
        `${RING_CIRCUMFERENCE}`;
    }

    if (
      percentageRef.current
    ) {
      percentageRef.current.textContent =
        "0%";
    }
  }

  // ========================================
  // Stop Holding
  // ========================================

  function stopHolding() {
    holdingRef.current = false;

    holdTimeRef.current = 0;

    setIsHolding(false);

    resetProgressUI();

    onHoldingChange?.(false);
  }

  // ========================================
  // Keyboard
  // ========================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.code !== "KeyE" ||
        event.repeat
      ) {
        return;
      }

      if (!enabled) {
        return;
      }

      if (
        !playerNearRef.current
      ) {
        return;
      }

      if (
        completedRef.current
      ) {
        return;
      }

      event.preventDefault();

      /*
       * เริ่มใหม่จาก 0
       */
      holdTimeRef.current = 0;

      holdingRef.current = true;

      setIsHolding(true);

      resetProgressUI();

      onHoldingChange?.(true);
    }

    function handleKeyUp(
      event: KeyboardEvent,
    ) {
      if (
        event.code !== "KeyE"
      ) {
        return;
      }

      /*
       * ถ้าทำเสร็จแล้ว
       * ไม่ต้อง reset
       */
      if (
        completedRef.current
      ) {
        return;
      }

      stopHolding();
    }

    function handleBlur() {
      if (
        completedRef.current
      ) {
        return;
      }

      stopHolding();
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    window.addEventListener(
      "keyup",
      handleKeyUp,
    );

    window.addEventListener(
      "blur",
      handleBlur,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp,
      );

      window.removeEventListener(
        "blur",
        handleBlur,
      );
    };
  }, [
    enabled,
    onHoldingChange,
  ]);

  // ========================================
  // Hold Progress
  // ========================================

  useFrame((_, delta) => {
    if (
      !enabled ||
      completedRef.current ||
      !playerNearRef.current ||
      !holdingRef.current
    ) {
      return;
    }

    const safeDelta =
      Math.min(
        delta,
        0.1,
      );

    holdTimeRef.current +=
      safeDelta;

    const progress =
      Math.min(
        holdTimeRef.current /
          holdDuration,
        1,
      );

    // ========================================
    // Circular Ring
    // ========================================

    const offset =
      RING_CIRCUMFERENCE *
      (1 - progress);

    if (
      progressCircleRef.current
    ) {
      progressCircleRef.current.style
        .strokeDashoffset =
        `${offset}`;
    }

    // ========================================
    // Percentage
    // ========================================

    if (
      percentageRef.current
    ) {
      percentageRef.current.textContent =
        `${Math.round(
          progress * 100,
        )}%`;
    }

    // ========================================
    // ยังไม่เต็ม
    // ========================================

    if (progress < 1) {
      return;
    }

    // ========================================
    // Complete
    // ========================================

    completedRef.current = true;

    holdingRef.current = false;

    /*
     * บังคับวงให้เต็ม 100%
     */
    if (
      progressCircleRef.current
    ) {
      progressCircleRef.current.style
        .strokeDashoffset = "0";
    }

    if (
      percentageRef.current
    ) {
      percentageRef.current.textContent =
        "100%";
    }

    setIsHolding(false);

    onHoldingChange?.(false);

    onComplete();
  });

  // ========================================
  // Reset ถ้า disabled
  // ========================================

  useEffect(() => {
    if (enabled) {
      return;
    }

    if (
      completedRef.current
    ) {
      return;
    }

    holdingRef.current = false;

    holdTimeRef.current = 0;

    setIsHolding(false);

    resetProgressUI();
  }, [enabled]);

  return (
    <>
      {/* ======================================
          Sensor
      ====================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          sensor
          args={halfExtents}
          position={position}

          onIntersectionEnter={({
            other,
          }) => {
            if (
              other
                .rigidBodyObject
                ?.name !==
              "player"
            ) {
              return;
            }

            playerCollidersRef
              .current
              .add(
                other
                  .collider
                  .handle,
              );

            playerNearRef.current =
              true;

            setIsPlayerNear(true);
          }}

          onIntersectionExit={({
            other,
          }) => {
            if (
              other
                .rigidBodyObject
                ?.name !==
              "player"
            ) {
              return;
            }

            playerCollidersRef
              .current
              .delete(
                other
                  .collider
                  .handle,
              );

            if (
              playerCollidersRef
                .current
                .size !== 0
            ) {
              return;
            }

            playerNearRef.current =
              false;

            setIsPlayerNear(false);

            if (
              !completedRef.current
            ) {
              stopHolding();
            }
          }}
        />
      </RigidBody>

      {/* ======================================
          Interaction UI
      ====================================== */}

      {enabled &&
        isPlayerNear &&
        !completedRef.current && (
          <Html
            position={[
              position[0],
              position[1] + 2,
              position[2],
            ]}
            center
          >
            <div
              className="
                flex
                min-w-[270px]
                select-none
                items-center
                gap-4
                rounded-xl
                border
                border-white/10
                bg-black/90
                px-5
                py-4
                text-white
                shadow-2xl
                backdrop-blur-md
              "
            >
              {/* ==========================
                  Circular Progress
              ========================== */}

              <div
                className="
                  relative
                  h-[72px]
                  w-[72px]
                  shrink-0
                "
              >
                <svg
                  viewBox="0 0 72 72"
                  className="
                    h-full
                    w-full
                    -rotate-90
                  "
                >
                  {/* Background Ring */}

                  <circle
                    cx="36"
                    cy="36"
                    r={
                      RING_RADIUS
                    }
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="6"
                  />

                  {/* Progress Ring */}

                  <circle
                    ref={
                      progressCircleRef
                    }
                    cx="36"
                    cy="36"
                    r={
                      RING_RADIUS
                    }
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={
                      RING_CIRCUMFERENCE
                    }
                    strokeDashoffset={
                      RING_CIRCUMFERENCE
                    }
                  />
                </svg>

                {/* E / % ตรงกลาง */}

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                  "
                >
                  {!isHolding ? (
                    <span
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-xl
                        font-black
                        text-black
                      "
                    >
                      E
                    </span>
                  ) : (
                    <span
                      ref={
                        percentageRef
                      }
                      className="
                        text-xs
                        font-bold
                        text-emerald-300
                      "
                    >
                      0%
                    </span>
                  )}
                </div>
              </div>

              {/* ==========================
                  Text
              ========================== */}

              <div
                className="
                  min-w-0
                "
              >
                <div
                  className="
                    text-base
                    font-semibold
                    whitespace-nowrap
                  "
                >
                  {isHolding
                    ? "กำลังสังเคราะห์สาร..."
                    : label}
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-white/45
                  "
                >
                  {isHolding
                    ? "กรุณากด E ค้างไว้"
                    : "กด E ค้างเพื่อเริ่ม"}
                </div>
              </div>
            </div>
          </Html>
        )}
    </>
  );
}