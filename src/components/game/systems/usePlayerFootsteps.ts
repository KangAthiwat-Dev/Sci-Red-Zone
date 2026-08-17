"use client";

import {
    useEffect,
    useRef,
    type MutableRefObject,
} from "react";

import {
    useFrame,
} from "@react-three/fiber";

import type {
    PlayerAnimation,
} from "../player/PlayerModel";

type UsePlayerFootstepsOptions = {
    animation: PlayerAnimation;

    groundedRef:
        MutableRefObject<boolean>;

    enabled?: boolean;
};

const JOG_STEP_INTERVAL =
    0.42;

const FOOTSTEP_VOLUME =
    0.35;

const FOOTSTEP_SOUNDS = [
    "/sounds/player/footsteps/step-1.mp3",
    // "/sounds/player/footsteps/step-2.mp3",
    // "/sounds/player/footsteps/step-3.mp3",
];

export function usePlayerFootsteps({
    animation,
    groundedRef,
    enabled = true,
}: UsePlayerFootstepsOptions) {
    const soundsRef =
        useRef<HTMLAudioElement[]>(
            [],
        );

    const stepTimerRef =
        useRef(0);

    const lastSoundIndexRef =
        useRef(-1);

    // ========================================
    // Load Sounds
    // ========================================

    useEffect(() => {
        const sounds =
            FOOTSTEP_SOUNDS.map(
                (src) => {
                    const audio =
                        new Audio(src);

                    audio.preload =
                        "auto";

                    audio.volume =
                        FOOTSTEP_VOLUME;

                    return audio;
                },
            );

        soundsRef.current =
            sounds;

        return () => {
            sounds.forEach(
                (audio) => {
                    audio.pause();

                    audio.src = "";
                },
            );

            soundsRef.current =
                [];
        };
    }, []);

    // ========================================
    // Reset ตอนออกจาก Jog
    // ========================================

    useEffect(() => {
        if (
            animation === "Jog"
        ) {
            /*
             * ให้เท้าแรกดังเร็วหน่อย
             * ไม่ต้องรอ 0.42 วิเต็ม
             */
            stepTimerRef.current =
                JOG_STEP_INTERVAL *
                0.65;

            return;
        }

        stepTimerRef.current = 0;
    }, [
        animation,
    ]);

    // ========================================
    // Footstep Loop
    // ========================================

    useFrame((_, delta) => {
        if (!enabled) {
            return;
        }

        if (
            animation !== "Jog"
        ) {
            return;
        }

        if (
            !groundedRef.current
        ) {
            return;
        }

        const safeDelta =
            Math.min(
                delta,
                0.1,
            );

        stepTimerRef.current +=
            safeDelta;

        if (
            stepTimerRef.current <
            JOG_STEP_INTERVAL
        ) {
            return;
        }

        stepTimerRef.current = 0;

        const sounds =
            soundsRef.current;

        if (
            sounds.length === 0
        ) {
            return;
        }

        // ====================================
        // สุ่มเสียง
        // แต่ไม่ใช้เสียงเดิมติดกัน
        // ====================================

        let nextIndex =
            Math.floor(
                Math.random() *
                    sounds.length,
            );

        if (
            sounds.length > 1 &&
            nextIndex ===
                lastSoundIndexRef.current
        ) {
            nextIndex =
                (
                    nextIndex +
                    1
                ) %
                sounds.length;
        }

        lastSoundIndexRef.current =
            nextIndex;

        const audio =
            sounds[nextIndex];

        /*
         * เล่นใหม่ตั้งแต่ต้น
         */
        audio.currentTime = 0;

        audio
            .play()
            .catch(() => {
                /*
                 * Browser อาจ block audio
                 * ก่อนมี user interaction
                 */
            });
    });
}