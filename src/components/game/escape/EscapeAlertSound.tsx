"use client";

import { useEffect, useRef } from "react";

import {
  ESCAPE_ALERT_FALLBACK_DURATION,
  ESCAPE_ALERT_SOUND_SRC,
} from "./escapeConfig";

type EscapeAlertSoundProps = {
  active: boolean;

  volume?: number;

  onEnded: () => void;
};

export default function EscapeAlertSound({
  active,
  volume = 0.85,
  onEnded,
}: EscapeAlertSoundProps) {
  const onEndedRef =
    useRef(onEnded);

  useEffect(() => {
    onEndedRef.current =
      onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const audio =
      new Audio(ESCAPE_ALERT_SOUND_SRC);

    audio.preload = "auto";

    audio.loop = false;

    audio.volume = volume;

    let completed = false;

    let fallbackTimer:
      | number
      | null = null;

    function clearFallbackTimer() {
      if (fallbackTimer === null) {
        return;
      }

      window.clearTimeout(fallbackTimer);

      fallbackTimer = null;
    }

    function complete() {
      if (completed) {
        return;
      }

      completed = true;

      clearFallbackTimer();

      onEndedRef.current();
    }

    function scheduleFallback(durationMs: number) {
      clearFallbackTimer();

      fallbackTimer =
        window.setTimeout(
          complete,
          durationMs,
        );
    }

    function handleMetadata() {
      if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        scheduleFallback(
          audio.duration * 1000 + 150,
        );
      }
    }

    audio.addEventListener(
      "ended",
      complete,
    );

    audio.addEventListener(
      "loadedmetadata",
      handleMetadata,
    );

    scheduleFallback(
      ESCAPE_ALERT_FALLBACK_DURATION,
    );

    audio.play().catch(() => {
      scheduleFallback(
        ESCAPE_ALERT_FALLBACK_DURATION,
      );
    });

    return () => {
      completed = true;

      clearFallbackTimer();

      audio.removeEventListener(
        "ended",
        complete,
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleMetadata,
      );

      audio.pause();

      audio.currentTime = 0;
    };
  }, [active, volume]);

  return null;
}
