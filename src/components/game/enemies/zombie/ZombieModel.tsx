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

import * as THREE from "three";

import {
    clone,
} from "three/examples/jsm/utils/SkeletonUtils.js";

import {
    ZOMBIE_ATTACK_ANIMATION_SPEED,
    ZOMBIE_CLIPS,
    ZOMBIE_COLLIDER_HALF_HEIGHT,
    ZOMBIE_COLLIDER_RADIUS,
    ZOMBIE_CRAWLER_COLLIDER_HALF_HEIGHT,
    ZOMBIE_CRAWLER_COLLIDER_RADIUS,
    ZOMBIE_CRAWL_MODEL_OFFSET_Y,
    ZOMBIE_FACE_RIGHT_Y,
    ZOMBIE_MODEL_OFFSET_Y,
    ZOMBIE_MODEL_SCALE,
    ZOMBIE_MODEL_URL,
} from "./zombieConfig";

// ========================================
// Types
// ========================================

export type ZombieAnimationState =
    | "walk"
    | "run"
    | "attack"
    | "crawl"
    | "scream";

type ZombieVariant = "normal" | "crawler";

type ZombieModelProps = {
    animation:
        ZombieAnimationState;

    direction:
        1 | -1;

    /*
     * ใช้ restart one-shot animation
     * เช่น Attack รอบใหม่
     */
    animationKey?: number;

    variant?: ZombieVariant;
};

// ========================================
// Config
// ========================================

const ANIMATION_FADE_DURATION =
    0.15;

// ========================================
// Animation Name Resolver
// ========================================

function getClipName(
    state:
        ZombieAnimationState,
): string {
    switch (state) {
        case "walk":
            return ZOMBIE_CLIPS.WALK;

        case "run":
            return ZOMBIE_CLIPS.RUN;

        case "attack":
            return ZOMBIE_CLIPS.ATTACK;

        case "crawl":
            /*
             * state ภายใน = "crawl"
             *
             * แต่ชื่อจริงใน GLB
             * จะถูก map จาก config
             * เช่น "Clawn"
             */
            return ZOMBIE_CLIPS.CRAWL;

        case "scream":
            return ZOMBIE_CLIPS.SCREAM;
    }
}

// ========================================
// Animation Time Scale
// ========================================

function getAnimationTimeScale(
    state:
        ZombieAnimationState,
) {
    if (
        state ===
        "attack"
    ) {
        return ZOMBIE_ATTACK_ANIMATION_SPEED;
    }

    return 1;
}

// ========================================
// Zombie Model
// ========================================

export default function ZombieModel({
    animation,

    direction,

    animationKey = 0,

    variant = "normal",
}: ZombieModelProps) {
    // ========================================
    // Refs
    // ========================================

    const groupRef =
        useRef<THREE.Group>(
            null,
        );

    const currentActionRef =
        useRef<
            THREE.AnimationAction |
            null
        >(null);

    // ========================================
    // GLTF
    // ========================================

    const {
        scene,
        animations,
    } =
        useGLTF(
            ZOMBIE_MODEL_URL,
        );

    // ========================================
    // Clone Scene
    // ========================================

    /*
     * SkeletonUtils.clone()
     *
     * สำคัญสำหรับ SkinnedMesh
     * เพราะ Zombie แต่ละตัว
     * ต้องมี Skeleton ของตัวเอง
     */
    const clonedScene =
        useMemo(() => {
            const cloned =
                clone(
                    scene,
                );

            cloned.traverse(
                (
                    object,
                ) => {
                    if (
                        object instanceof
                            THREE.Mesh ||
                        object instanceof
                            THREE.SkinnedMesh
                    ) {
                        object.castShadow =
                            true;

                        object.receiveShadow =
                            true;
                    }
                },
            );

            return cloned;
        }, [
            scene,
        ]);

    // ========================================
    // Model Bounds
    // ========================================

    /*
     * เราหาจุดต่ำสุดของโมเดล
     * จาก Bind Pose / Base Pose
     *
     * ใช้เป็น reference เท่านั้น
     *
     * ห้ามเอาค่าก้น Capsule
     * ไปใช้กับ Crawl โดยตรง
     * เพราะ Crawl ลดตัวลงจาก Animation
     */
    const modelBottomY =
        useMemo(() => {
            clonedScene.updateMatrixWorld(
                true,
            );

            const bounds =
                new THREE.Box3()
                    .setFromObject(
                        clonedScene,
                        true,
                    );

            /*
             * กัน model แปลก ๆ
             * ที่ไม่มี valid bounds
             */
            if (
                bounds.isEmpty() ||
                !Number.isFinite(
                    bounds.min.y,
                )
            ) {
                console.warn(
                    "[Zombie] ไม่สามารถคำนวณ Model Bounds ได้",
                );

                return 0;
            }

            return (
                bounds.min.y *
                ZOMBIE_MODEL_SCALE
            );
        }, [
            clonedScene,
        ]);

    // ========================================
    // Collider Bottom
    // ========================================

    /*
     * CapsuleCollider:
     *
     *       radius
     *        ___
     *      /     \
     *     |       |
     *     |       | halfHeight
     *      \_____/
     *
     * จุดล่างสุด:
     *
     * -(halfHeight + radius)
     */
    const isCrawler =
        variant === "crawler" ||
        animation === "crawl";

    const colliderBottomY =
        isCrawler
            ? -(
                  ZOMBIE_CRAWLER_COLLIDER_HALF_HEIGHT +
                  ZOMBIE_CRAWLER_COLLIDER_RADIUS
              )
            : -(
                  ZOMBIE_COLLIDER_HALF_HEIGHT +
                  ZOMBIE_COLLIDER_RADIUS
              );

    // ========================================
    // Visual Ground Offset
    // ========================================

    const modelGroundOffsetY =
        useMemo(() => {
            if (isCrawler) {
                return (
                    colliderBottomY +
                    ZOMBIE_CRAWL_MODEL_OFFSET_Y
                );
            }

            return (
                colliderBottomY -
                modelBottomY +
                ZOMBIE_MODEL_OFFSET_Y
            );
        }, [
            isCrawler,
            colliderBottomY,
            modelBottomY,
        ]);

    // ========================================
    // Animation Mixer
    // ========================================

    const {
        actions,
    } =
        useAnimations(
            animations,
            groupRef,
        );

    // ========================================
    // Debug Animation Names
    // ========================================

    useEffect(() => {
        console.log(
            "[Zombie] Available animations:",
            animations.map(
                (
                    clip,
                ) =>
                    clip.name,
            ),
        );
    }, [
        animations,
    ]);

    // ========================================
    // Animation Player
    // ========================================

    useEffect(() => {
        const clipName =
            getClipName(
                animation,
            );

        const nextAction =
            actions[
                clipName
            ];

        // ====================================
        // Clip Not Found
        // ====================================

        if (
            !nextAction
        ) {
            console.warn(
                `[Zombie] ไม่พบ Animation "${clipName}"`,
                {
                    state:
                        animation,

                    available:
                        animations.map(
                            (
                                clip,
                            ) =>
                                clip.name,
                        ),
                },
            );

            return;
        }

        // ====================================
        // Previous Animation
        // ====================================

        const previousAction =
            currentActionRef.current;

        if (
            previousAction &&
            previousAction !==
                nextAction
        ) {
            previousAction.fadeOut(
                ANIMATION_FADE_DURATION,
            );
        }

        // ====================================
        // One Shot
        // ====================================

        const isOneShot =
            animation ===
                "attack" ||
            animation ===
                "scream";

        // ====================================
        // Setup Action
        // ====================================

        nextAction.enabled =
            true;

        nextAction.clampWhenFinished =
            isOneShot;

        nextAction.setLoop(
            isOneShot
                ? THREE.LoopOnce
                : THREE.LoopRepeat,

            isOneShot
                ? 1
                : Infinity,
        );

        nextAction.setEffectiveTimeScale(
            getAnimationTimeScale(
                animation,
            ),
        );

        /*
         * reset สำคัญสำหรับ
         * Attack / Scream
         *
         * animationKey เปลี่ยน
         * Effect นี้จะรันใหม่
         * และเริ่มท่าจากต้น
         */
        nextAction
            .reset()
            .fadeIn(
                ANIMATION_FADE_DURATION,
            )
            .play();

        currentActionRef.current =
            nextAction;

        // ====================================
        // Cleanup
        // ====================================

        return () => {
            /*
             * ถ้า Effect ถูกเปลี่ยน
             * หรือ Component unmount
             *
             * ค่อย ๆ fade action นี้ออก
             */
            nextAction.fadeOut(
                ANIMATION_FADE_DURATION,
            );
        };
    }, [
        actions,
        animation,
        animationKey,
        animations,
    ]);

    // ========================================
    // Stop Animations On Unmount
    // ========================================

    useEffect(() => {
        return () => {
            /*
             * ป้องกัน mixer/action
             * ของ Zombie เก่าค้าง
             * ตอนเปลี่ยน Map
             */
            for (
                const action
                of Object.values(
                    actions,
                )
            ) {
                action?.stop();
            }

            currentActionRef.current =
                null;
        };
    }, [
        actions,
    ]);

    // ========================================
    // Facing
    // ========================================

    const rotationY =
        direction === 1
            ? ZOMBIE_FACE_RIGHT_Y
            : ZOMBIE_FACE_RIGHT_Y +
              Math.PI;

    // ========================================
    // Render
    // ========================================

    return (
        <group
            ref={
                groupRef
            }
            position={[
                0,
                modelGroundOffsetY,
                0,
            ]}
            scale={
                ZOMBIE_MODEL_SCALE
            }
            rotation={[
                0,
                rotationY,
                0,
            ]}
        >
            <primitive
                object={
                    clonedScene
                }
            />
        </group>
    );
}
