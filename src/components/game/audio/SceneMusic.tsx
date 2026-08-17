"use client";

import { useEffect, useRef } from "react";

import {
  SCENE_MUSIC,
  type GameMapId,
  type SceneMusicConfig,
} from "./sceneMusicConfig";

type SceneMusicProps = {
  mapId: string;

  masterVolume?: number;

  muted?: boolean;
};

export default function SceneMusic({
  mapId,
  masterVolume = 0.7,
  muted = false,
}: SceneMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const transitionIdRef = useRef(0);

  const currentTrackRef = useRef<SceneMusicConfig | undefined>(undefined);

  // ========================================
  // Fade
  // ========================================

  function fadeAudio(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    duration: number,
    transitionId: number,
  ) {
    return new Promise<void>((resolve) => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (duration <= 0) {
        audio.volume = Math.max(0, Math.min(1, to));

        resolve();

        return;
      }

      const startTime = performance.now();

      function update(currentTime: number) {
        /*
         * มี transition ใหม่แล้ว
         * ยกเลิกอันเก่า
         */
        if (transitionId !== transitionIdRef.current) {
          resolve();

          return;
        }

        const progress = Math.min((currentTime - startTime) / duration, 1);

        const nextVolume = from + (to - from) * progress;

        audio.volume = Math.max(0, Math.min(1, nextVolume));

        if (progress >= 1) {
          animationFrameRef.current = null;

          resolve();

          return;
        }

        animationFrameRef.current = requestAnimationFrame(update);
      }

      animationFrameRef.current = requestAnimationFrame(update);
    });
  }

  // ========================================
  // Create Audio
  // ========================================

  useEffect(() => {
    const audio = new Audio();

    audio.loop = true;

    audio.preload = "auto";

    audio.volume = 0;

    audioRef.current = audio;

    return () => {
      transitionIdRef.current += 1;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      audio.pause();

      audio.src = "";

      audioRef.current = null;
    };
  }, []);

  // ========================================
  // Change Scene Music
  // ========================================

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const config = SCENE_MUSIC[mapId as GameMapId];

    if (!config) {
      return;
    }

    transitionIdRef.current += 1;

    const transitionId = transitionIdRef.current;

    let cancelled = false;

    async function changeTrack() {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      const previousTrack = currentTrackRef.current;

      // =================================
      // FADE OUT TRACK เก่า
      // =================================

      if (previousTrack && !audio.paused) {
        await fadeAudio(
          audio,
          audio.volume,
          0,
          previousTrack.fadeOutMs,
          transitionId,
        );
      }

      if (cancelled || transitionId !== transitionIdRef.current) {
        return;
      }

      // =================================
      // CHANGE TRACK
      // =================================

      audio.pause();

      audio.src = config.src;

      audio.currentTime = 0;

      audio.volume = 0;

      audio.loop = true;

      currentTrackRef.current = config;

      try {
        await audio.play();
      } catch {
        /*
         * Browser อาจ block autoplay
         * ก่อนผู้เล่น click/กด keyboard
         */

        function unlockAudio() {
          const currentAudio = audioRef.current;

          if (!currentAudio) {
            return;
          }

          currentAudio.play().catch(() => {});

          window.removeEventListener("pointerdown", unlockAudio);

          window.removeEventListener("keydown", unlockAudio);
        }

        window.addEventListener("pointerdown", unlockAudio, {
          once: true,
        });

        window.addEventListener("keydown", unlockAudio, {
          once: true,
        });
      }

      if (cancelled || transitionId !== transitionIdRef.current) {
        return;
      }

      // =================================
      // FADE IN TRACK ใหม่
      // =================================

      const targetVolume = muted ? 0 : config.volume * masterVolume;

      await fadeAudio(audio, 0, targetVolume, config.fadeInMs, transitionId);
    }

    changeTrack();

    return () => {
      cancelled = true;
    };
  }, [mapId]);

  // ========================================
  // Volume / Mute Change
  // ========================================

  useEffect(() => {
    const audio = audioRef.current;

    const config = currentTrackRef.current;

    if (!audio || !config) {
      return;
    }

    const targetVolume = muted ? 0 : config.volume * masterVolume;

    transitionIdRef.current += 1;

    const transitionId = transitionIdRef.current;

    fadeAudio(audio, audio.volume, targetVolume, 300, transitionId);
  }, [masterVolume, muted]);

  return null;
}
