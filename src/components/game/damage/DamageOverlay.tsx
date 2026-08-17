"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type DamageOverlayProps = {
  hitKey: number;
};

const DAMAGE_SOUND =
  "/sounds/player/hurt.mp3";

const DAMAGE_SOUND_VOLUME =
  0.55;

export default function DamageOverlay({
  hitKey,
}: DamageOverlayProps) {
  const [
    visible,
    setVisible,
  ] = useState(false);

  const hurtAudioRef =
    useRef<HTMLAudioElement | null>(
      null,
    );

  // ========================================
  // Load Damage Sound
  // ========================================

  useEffect(() => {
    const audio =
      new Audio(
        DAMAGE_SOUND,
      );

    audio.preload =
      "auto";

    audio.volume =
      DAMAGE_SOUND_VOLUME;

    hurtAudioRef.current =
      audio;

    return () => {
      audio.pause();
      audio.src = "";

      hurtAudioRef.current =
        null;
    };
  }, []);

  // ========================================
  // Damage Effect
  // ========================================

  useEffect(() => {
    if (hitKey <= 0) {
      return;
    }

    // ======================================
    // Damage Sound
    // ======================================

    const audio =
      hurtAudioRef.current;

    if (audio) {
      /*
       * ถ้าโดนตีซ้ำ
       * ให้เริ่มเสียงใหม่ทันที
       */
      audio.currentTime = 0;

      audio
        .play()
        .catch(() => {
          /*
           * Browser อาจ block
           * ก่อนมี user interaction
           */
        });
    }

    // ======================================
    // Red Damage Overlay
    // ======================================

    setVisible(true);

    const timer =
      window.setTimeout(
        () => {
          setVisible(false);
        },
        90,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    hitKey,
  ]);

  return (
    <div
      className={`
        pointer-events-none
        fixed
        inset-0
        z-[7500]

        ${
          visible
            ? "opacity-100"
            : "opacity-0"
        }
      `}
      style={{
        background: `
          radial-gradient(
            circle at center,
            rgba(255, 0, 0, 0) 30%,
            rgba(150, 0, 0, 0.10) 55%,
            rgba(180, 0, 0, 0.35) 78%,
            rgba(255, 20, 20, 0.72) 100%
          )
        `,

        boxShadow:
          "inset 0 0 130px rgba(255,0,0,0.38)",

        transition: visible
          ? "opacity 35ms ease-out"
          : "opacity 650ms ease-out",
      }}
    />
  );
}