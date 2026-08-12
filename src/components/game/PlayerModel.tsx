"use client";

import {
    useEffect,
    useMemo,
    useRef,
} from "react";

import {
    useAnimations,
    useGLTF,
} from "@react-three/drei";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

export type PlayerAnimation =
    | "Idle"
    | "Jog"
    | "Run"
    | "RunningJump"
    | "Jump"
    | "Falling"
    | "Landing"
    | "RunningSlide"
    | "Crouch"
    | "CrouchWalking"
    | "Hang"
    | "Climb";
type PlayerModelProps = {
    animation: PlayerAnimation;
};

// ========================================
// ชื่อ Animation จริงใน GLB
// ========================================

const CLIP_NAMES: Record<
    PlayerAnimation,
    string
> = {
    Idle: "Idle",
    Jog: "Jog",
    // ชื่อใน GLB สะกดว่า Spint
    Run: "Spint",
    RunningJump: "RunningJump",
    Jump: "Jump",
    Falling: "Falling",
    Landing: "Landing",
    RunningSlide: "RunningSlide",
    Crouch: "Crouch",
    CrouchWalking: "CrouchWalking",
    Hang: "HangingIdle",
    Climb: "BracedHangCrouch",
};

// ========================================
// Model settings
// ========================================

export const PLAYER_MODEL_SCALE = 1.67;
const MODEL_ROTATION_Y = 0;
const MODEL_OFFSET_Y = -0.9;

/*
 * Rig ในไฟล์ GLB ใช้ scale 0.01
 * ค่านี้ใช้แปลง offset แนวตั้งใน World กลับเป็น local Z ของ Hips
 */
const RIG_POSITION_TO_WORLD_SCALE =
    0.01 * PLAYER_MODEL_SCALE;

/*
 * คลิป HangingIdle / BracedHangCrouch ชุดใหม่มี Hips baseline
 * สูงกว่าคลิปเดิม จึงชดเชยเฉพาะภาพให้มืออยู่ตรงขอบเดิม
 * โดยไม่เปลี่ยนตำแหน่ง Body, Collider หรือ Ray ของระบบปีน
 */
const HANG_VISUAL_OFFSET_Y = -1.52;
const CLIMB_VISUAL_START_OFFSET_Y = -1.4;
const CLIMB_VISUAL_END_OFFSET_Y = -0.85;
const CLIMB_VISUAL_SETTLE_START = 0.7;

// ต้องตรงกับ safeDelta สูงสุดใน Player
const CLIMB_MAX_FRAME_DELTA = 0.1;

/*
 * Physics Climb ใน Player ใช้เวลา 3.85 วินาที
 * คลิปใหม่สั้นกว่า จึง stretch เวลา Animation ให้จบพร้อม Body
 * โดยไม่เปลี่ยนความเร็วหรือเส้นทางของระบบปีนเดิม
 */
const CLIMB_PLAYBACK_DURATION = 3.85;

const ANIMATION_FADE_DURATION = 0.15;
/*
 * คลิปปีนชุดใหม่วางเท้าตรงกับ Idle/Spint อยู่แล้ว
 * จึงไม่ยกทั้งโมเดลตอนจบเหมือน asset ชุดเก่า
 */
const CLIMB_EXIT_IDLE_FOOT_LIFT = 0;
const CLIMB_EXIT_LOCOMOTION_FOOT_LIFT = 0;

// ช่วงที่เท้าเริ่มแตะพื้นในคลิป Landing
const LANDING_CLIP_START_TIME = 0.5;
const SLIDE_ANIMATION_DURATION = 0.75;

type ClimbExitLiftMode =
    | "idle"
    | "locomotion"
    | "mixed";

function getIdleClimbExitFootLift(
    progress: number,
) {
    return (
        Math.sin(Math.PI * progress) *
        CLIMB_EXIT_IDLE_FOOT_LIFT
    );
}

function getLocomotionClimbExitFootLift(
    progress: number,
) {
    const rise =
        THREE.MathUtils.smoothstep(
            progress,
            0,
            0.6,
        );

    const fall =
        1 -
        THREE.MathUtils.smoothstep(
            progress,
            0.8,
            1,
        );

    return (
        Math.min(rise, fall) *
        CLIMB_EXIT_LOCOMOTION_FOOT_LIFT
    );
}

function getClimbExitFootLift(
    mode: ClimbExitLiftMode,
    progress: number,
) {
    const idleLift =
        getIdleClimbExitFootLift(
            progress,
        );

    const locomotionLift =
        getLocomotionClimbExitFootLift(
            progress,
        );

    if (mode === "locomotion") {
        return locomotionLift;
    }

    if (mode === "mixed") {
        return Math.max(
            idleLift,
            locomotionLift,
        );
    }

    return idleLift;
}

// ========================================
// Animation ที่ต้องลบ Root Motion
// ========================================
const IN_PLACE_CLIPS = new Set([
    "Jog",
    "Spint",
    "RunningJump",
    "Jump",
    "Falling",
    "Landing",
    "RunningSlide",
    "Crouch",
    "CrouchWalking",
    "HangingIdle",
    "BracedHangCrouch",
]);

/*
 * BracedHangCrouch ถูก export ไปผูกกับ Armature สำรอง (_2)
 * ที่ไม่มี SkinnedMesh แสดงผล จึง rebind เฉพาะ track กระดูก
 * กลับมายังชื่อ rig หลัก โดยไม่แก้ไฟล์ GLB ต้นฉบับ
 */
function rebindClimbTracksToVisibleRig(
    clip: THREE.AnimationClip,
) {
    if (
        clip.name !==
        CLIP_NAMES.Climb
    ) {
        return;
    }

    clip.tracks = clip.tracks.flatMap(
        (track) => {
            const propertySeparator =
                track.name.lastIndexOf(".");

            if (propertySeparator < 0) {
                return [];
            }

            const sourceNodeName =
                track.name.slice(
                    0,
                    propertySeparator,
                );

            if (
                !sourceNodeName.endsWith("_2")
            ) {
                return [];
            }

            const targetNodeName =
                sourceNodeName.slice(0, -2);

            const reboundTrack =
                track.clone();

            reboundTrack.name =
                targetNodeName +
                track.name.slice(
                    propertySeparator,
                );

            return [reboundTrack];
        },
    );
}

function removeRootMotion(
    sourceClip: THREE.AnimationClip,
) {
    const clip = sourceClip.clone();

    rebindClimbTracksToVisibleRig(
        clip,
    );

    if (!IN_PLACE_CLIPS.has(clip.name)) {
        return clip;
    }

    for (const track of clip.tracks) {
        if (
            !(track instanceof THREE.VectorKeyframeTrack)
        ) {
            continue;
        }

        const name = track.name.toLowerCase();

        if (!name.endsWith(".position")) {
            continue;
        }

        const values = track.values;

        if (values.length < 3) {
            continue;
        }

        const startX = values[0];
        const startY = values[1];
        const startZ = values[2];

        const isHips =
            name.includes("hips");

        const isRoot =
            name.includes("root") ||
            name.includes("armature");

        const isLandingHips =
            clip.name === "Landing" &&
            isHips;

        const isSlideHips =
            clip.name ===
                CLIP_NAMES.RunningSlide &&
            isHips;

        const isClimbHips =
            clip.name ===
                CLIP_NAMES.Climb &&
            isHips;

        const isHangHips =
            clip.name ===
                CLIP_NAMES.Hang &&
            isHips;

        // ===================================
        // สำคัญ: เช็ก Hips ก่อน Root
        // ===================================

        if (isHips) {
            for (
                let i = 0;
                i < values.length;
                i += 3
            ) {
                /*
                 * ห้าม Hips พาตัวละครเดิน
                 */
                values[i] = startX;

                if (
                    isClimbHips ||
                    isHangHips ||
                    isSlideHips
                ) {
                    values[i + 1] = startY;
                }

                /*
                 * Rig หมุนแกน X อยู่ 90 องศา
                 * local Z จึงเป็นความสูงใน World
                 * Landing ต้องเก็บ Curve นี้ไว้
                 * เพื่อให้เท้าวางพื้นระหว่างรับแรง
                 */
                if (isClimbHips) {
                    /*
                     * Body เป็นตัวเคลื่อนผ่านกำแพง
                     * ส่วน Curve นี้ชดเชยเฉพาะท่าทาง:
                     * มือเริ่มตรงขอบและเท้าจบตรงพื้น
                     */
                    const keyIndex = i / 3;
                    const clipProgress =
                        clip.duration > 0
                            ? track.times[keyIndex] /
                            clip.duration
                            : 1;

                    const settleProgress =
                        THREE.MathUtils.smoothstep(
                            clipProgress,
                            CLIMB_VISUAL_SETTLE_START,
                            1,
                        );

                    const visualOffsetY =
                        THREE.MathUtils.lerp(
                            CLIMB_VISUAL_START_OFFSET_Y,
                            CLIMB_VISUAL_END_OFFSET_Y,
                            settleProgress,
                        );

                    values[i + 2] =
                        startZ -
                        visualOffsetY /
                        RIG_POSITION_TO_WORLD_SCALE;
                } else if (isHangHips) {
                    values[i + 2] =
                        startZ -
                        HANG_VISUAL_OFFSET_Y /
                        RIG_POSITION_TO_WORLD_SCALE;
                } else if (
                    !isLandingHips &&
                    !isSlideHips
                ) {
                    values[i + 2] = startZ;
                }
            }

            continue;
        }

        // ===================================
        // Root / Armature
        // ===================================

        if (isRoot) {
            for (
                let i = 0;
                i < values.length;
                i += 3
            ) {
                /*
                 * ล็อก Root ไม่ให้พา Model เคลื่อน
                 */
                values[i] = startX;
                values[i + 2] = startZ;
            }
        }
    }

    return clip;
}

export default function PlayerModel({
    animation,
}: PlayerModelProps) {
    const modelRef =
        useRef<THREE.Group>(null);

    const previousAction =
        useRef<THREE.AnimationAction | null>(
            null,
        );

    const climbExitBlendTime =
        useRef<number | null>(null);

    const climbExitLiftMode =
        useRef<ClimbExitLiftMode>(
            "idle",
        );

    const climbAnimationElapsed =
        useRef(0);

    const climbActionRef =
        useRef<THREE.AnimationAction | null>(
            null,
        );

    const latestSafeDelta =
        useRef(0);

    const climbExitLiftAdjustment =
        useRef(0);

    const climbExitLiftAdjustmentStart =
        useRef(0);

    const {
        scene,
        animations,
    } = useGLTF(
        "/player/student.glb",
    );

    // ========================================
    // ทำ Animation ให้เป็น In Place
    // ========================================

    const inPlaceAnimations =
        useMemo(() => {
            return animations.map(
                removeRootMotion,
            );
        }, [animations]);

    const {
        actions,
        names,
    } = useAnimations(
        inPlaceAnimations,
        modelRef,
    );

    useEffect(() => {
        climbActionRef.current =
            actions[CLIP_NAMES.Climb] ??
            null;
    }, [actions]);

    /*
     * Drei เดิน AnimationMixer ด้วย delta จริง
     * แต่ physics ของ Player จำกัด delta ไว้ที่ 0.1
     * จึงกำหนดเวลา Climb จาก clock เดียวกับ physics
     */
    useFrame((_, delta) => {
        const safeDelta =
            Math.min(
                delta,
                CLIMB_MAX_FRAME_DELTA,
            );

        latestSafeDelta.current =
            safeDelta;

        const climbAction =
            climbActionRef.current;

        if (climbAction) {
            if (animation === "Climb") {
                const clipDuration =
                    climbAction.getClip()
                        .duration;

                climbAnimationElapsed.current =
                    Math.min(
                        climbAnimationElapsed
                            .current +
                        safeDelta,
                        CLIMB_PLAYBACK_DURATION,
                    );

                const climbProgress =
                    CLIMB_PLAYBACK_DURATION > 0
                        ? climbAnimationElapsed
                            .current /
                        CLIMB_PLAYBACK_DURATION
                        : 1;

                climbAction.time =
                    clipDuration *
                    climbProgress;

                climbAction.setEffectiveTimeScale(
                    0,
                );
            } else {
                climbAction.setEffectiveTimeScale(
                    1,
                );
            }
        }

        const model = modelRef.current;
        const exitTime =
            climbExitBlendTime.current;

        if (!model) {
            return;
        }

        if (exitTime === null) {
            model.position.y =
                MODEL_OFFSET_Y;
            return;
        }

        const nextExitTime =
            Math.min(
                exitTime + delta,
                ANIMATION_FADE_DURATION,
            );

        const exitProgress =
            nextExitTime /
            ANIMATION_FADE_DURATION;

        const baseFootLift =
            getClimbExitFootLift(
                climbExitLiftMode.current,
                exitProgress,
            );

        const adjustmentStart =
            climbExitLiftAdjustmentStart
                .current;

        let liftAdjustment = 0;

        if (adjustmentStart < 1) {
            const adjustmentProgress =
                THREE.MathUtils.smoothstep(
                    exitProgress,
                    adjustmentStart,
                    1,
                );

            liftAdjustment =
                THREE.MathUtils.lerp(
                    climbExitLiftAdjustment
                        .current,
                    0,
                    adjustmentProgress,
                );
        }

        model.position.y =
            MODEL_OFFSET_Y +
            baseFootLift +
            liftAdjustment;

        if (
            nextExitTime >=
            ANIMATION_FADE_DURATION
        ) {
            climbExitBlendTime.current =
                null;
            model.position.y =
                MODEL_OFFSET_Y;
        } else {
            climbExitBlendTime.current =
                nextExitTime;
        }
    }, -1);

    // ========================================
    // Mesh settings
    // ========================================

    useEffect(() => {
        scene.traverse((object) => {
            if (
                object instanceof THREE.Mesh ||
                object instanceof
                THREE.SkinnedMesh
            ) {
                object.castShadow = true;
                object.receiveShadow = true;

                object.frustumCulled = false;
            }
        });
    }, [scene]);

    // ========================================
    // Debug รายชื่อ Animation
    // ========================================

    useEffect(() => {
        console.log(
            "Animations:",
            names,
        );
    }, [names]);

    // ========================================
    // เล่น Animation
    // ========================================

    useEffect(() => {
        const clipName =
            CLIP_NAMES[animation];

        const nextAction =
            actions[clipName];

        if (!nextAction) {
            console.warn(
                `ไม่พบ Animation: ${clipName}`,
                names,
            );

            return;
        }

        // ถ้าเป็นตัวเดิม ไม่ต้อง restart
        if (
            previousAction.current ===
            nextAction
        ) {
            return;
        }

        const oldAction =
            previousAction.current;

        if (animation === "Climb") {
            climbExitBlendTime.current =
                null;
            climbExitLiftMode.current =
                "idle";
            climbAnimationElapsed.current =
                latestSafeDelta.current;
            climbExitLiftAdjustment.current =
                0;
            climbExitLiftAdjustmentStart.current =
                0;

            if (modelRef.current) {
                modelRef.current.position.y =
                    MODEL_OFFSET_Y;
            }
        } else if (
            oldAction?.getClip().name ===
            CLIP_NAMES.Climb
        ) {
            climbExitBlendTime.current = 0;
            climbExitLiftMode.current =
                animation === "Jog" ||
                animation === "Run"
                    ? "locomotion"
                    : "idle";
            climbExitLiftAdjustment.current =
                0;
            climbExitLiftAdjustmentStart.current =
                0;
        } else if (
            climbExitBlendTime.current !==
            null
        ) {
            const usesLocomotionLift =
                animation === "Jog" ||
                animation === "Run";

            if (
                (
                    climbExitLiftMode.current ===
                    "idle" &&
                    usesLocomotionLift
                ) ||
                (
                    climbExitLiftMode.current ===
                    "locomotion" &&
                    !usesLocomotionLift
                )
            ) {
                const exitProgress =
                    climbExitBlendTime.current /
                    ANIMATION_FADE_DURATION;

                const previousBaseLift =
                    getClimbExitFootLift(
                        climbExitLiftMode.current,
                        exitProgress,
                    );

                const previousAdjustmentProgress =
                    THREE.MathUtils.smoothstep(
                        exitProgress,
                        climbExitLiftAdjustmentStart
                            .current,
                        1,
                    );

                const previousAdjustment =
                    THREE.MathUtils.lerp(
                        climbExitLiftAdjustment
                            .current,
                        0,
                        previousAdjustmentProgress,
                    );

                const previousLift =
                    previousBaseLift +
                    previousAdjustment;

                const mixedLift =
                    getClimbExitFootLift(
                        "mixed",
                        exitProgress,
                    );

                climbExitLiftMode.current =
                    "mixed";
                climbExitLiftAdjustment.current =
                    previousLift -
                    mixedLift;
                climbExitLiftAdjustmentStart.current =
                    exitProgress;
            }
        }

        // ----------------------------
        // Jump
        // ----------------------------
        const isOneShot =
            animation === "Jump" ||
            animation === "RunningJump" ||
            animation === "Landing" ||
            animation === "RunningSlide" ||
            animation === "Climb";
        if (isOneShot) {
            nextAction.setLoop(
                THREE.LoopOnce,
                1,
            );

            nextAction.clampWhenFinished = true;
        }

        // ----------------------------
        // Loop animation ทั่วไป
        // ----------------------------

        else {
            nextAction.setLoop(
                THREE.LoopRepeat,
                Infinity,
            );

            nextAction.clampWhenFinished =
                false;
        }

        nextAction.reset();

        if (
            animation === "Landing" &&
            nextAction.getClip().duration >
            LANDING_CLIP_START_TIME
        ) {
            nextAction.time =
                LANDING_CLIP_START_TIME;
        }

        const playbackTimeScale =
            animation === "RunningSlide"
                ? nextAction.getClip().duration /
                    SLIDE_ANIMATION_DURATION
                : 1;

        nextAction
            .setEffectiveTimeScale(
                playbackTimeScale,
            )
            .setEffectiveWeight(1)
            .fadeIn(
                ANIMATION_FADE_DURATION,
            )
            .play();

        if (
            oldAction &&
            oldAction !== nextAction
        ) {
            /*
             * ถ้า Action เก่ายัง fadeIn ไม่จบ
             * ให้ fadeOut ต่อจากน้ำหนักจริงปัจจุบัน
             * ไม่เด้งกลับไปเริ่มที่ weight 1
             */
            const oldWeight =
                oldAction.getEffectiveWeight();

            oldAction
                .setEffectiveWeight(
                    oldWeight,
                )
                .fadeOut(
                    ANIMATION_FADE_DURATION,
                );
        }

        previousAction.current =
            nextAction;
    }, [
        actions,
        animation,
        names,
    ]);

    // ========================================
    // Cleanup
    // ========================================

    useEffect(() => {
        return () => {
            Object.values(
                actions,
            ).forEach((action) => {
                action?.stop();
            });
        };
    }, [actions]);

    return (
        <group
            ref={modelRef}
            position={[
                0,
                MODEL_OFFSET_Y,
                0,
            ]}
            rotation={[
                0,
                MODEL_ROTATION_Y,
                0,
            ]}
            scale={PLAYER_MODEL_SCALE}
        >
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(
    "/player/student.glb",
);
