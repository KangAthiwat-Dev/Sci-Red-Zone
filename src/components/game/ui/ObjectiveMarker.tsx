"use client";

import {
    Html,
} from "@react-three/drei";

import {
    useFrame,
    useThree,
} from "@react-three/fiber";

import {
    useRef,
} from "react";

import * as THREE from "three";

type Vector3Tuple = [
    number,
    number,
    number,
];

type ObjectiveMarkerProps = {
    target:
        | Vector3Tuple
        | null;
};

// ========================================
// Config
// ========================================

const EDGE_PADDING_X = 40;
const EDGE_PADDING_Y = 70;

/*
 * Marker ลอยเหนือ Origin ของ Object
 */
const TARGET_OFFSET_Y = 1.4;

/*
 * ถ้า Target หลุดออกด้านซ้าย/ขวาไกลขึ้น
 * จะค่อย ๆ เลื่อน Marker Y เข้าหากลางจอ
 *
 * ยิ่งค่าน้อย = เข้ากลางเร็ว
 */
const OFFSCREEN_BLEND_RANGE = 0.3;

/*
 * ทำให้ Marker ไม่กระตุกตอน Camera เคลื่อน
 */
const MARKER_FOLLOW_SPEED = 18;

export default function ObjectiveMarker({
    target,
}: ObjectiveMarkerProps) {
    const markerRef =
        useRef<HTMLDivElement>(
            null,
        );

    const {
        camera,
        size,
    } = useThree();

    const worldPosition =
        useRef(
            new THREE.Vector3(),
        );

    const projectedPosition =
        useRef(
            new THREE.Vector3(),
        );

    const cameraSpacePosition =
        useRef(
            new THREE.Vector3(),
        );

    /*
     * ตำแหน่ง Marker ปัจจุบัน
     * ใช้สำหรับ smoothing
     */
    const currentScreenX =
        useRef(0);

    const currentScreenY =
        useRef(0);

    const initialized =
        useRef(false);

    useFrame((_, delta) => {
        const marker =
            markerRef.current;

        if (!marker) {
            return;
        }

        // =====================================
        // ไม่มี Objective
        // =====================================

        if (!target) {
            marker.style.display =
                "none";

            initialized.current =
                false;

            return;
        }

        marker.style.display =
            "flex";

        // =====================================
        // สำคัญ
        //
        // Player เพิ่งขยับ Camera ใน useFrame
        // ให้ Matrix ของ Camera อัปเดตก่อน project
        // =====================================

        camera.updateMatrixWorld(
            true,
        );

        // =====================================
        // World Position
        // =====================================

        worldPosition.current.set(
            target[0],

            target[1] +
                TARGET_OFFSET_Y,

            target[2],
        );

        // =====================================
        // World → Camera Space
        // =====================================

        cameraSpacePosition.current
            .copy(
                worldPosition.current,
            )
            .applyMatrix4(
                camera.matrixWorldInverse,
            );

        const cameraSpace =
            cameraSpacePosition.current;

        /*
         * Three Camera มองไปทาง -Z
         */
        const isBehindCamera =
            cameraSpace.z >= 0;

        let desiredScreenX:
            number;

        let desiredScreenY:
            number;

        // =====================================
        // Target อยู่หลัง Camera
        // =====================================

        if (isBehindCamera) {
            /*
             * ใช้ Camera Space X
             * ไม่ใช้ World X
             *
             * จึงยังถูกแม้ Camera
             * มี Look Ahead / เอียง
             */
            const targetIsRight =
                cameraSpace.x >= 0;

            desiredScreenX =
                targetIsRight
                    ? size.width -
                      EDGE_PADDING_X
                    : EDGE_PADDING_X;

            desiredScreenY =
                size.height * 0.5;
        }

        // =====================================
        // Target อยู่ด้านหน้ากล้อง
        // =====================================

        else {
            projectedPosition.current
                .copy(
                    worldPosition.current,
                )
                .project(camera);

            const projected =
                projectedPosition.current;

            // =================================
            // NDC → Screen Pixels
            // =================================

            const rawScreenX =
                (
                    projected.x *
                        0.5 +
                    0.5
                ) *
                size.width;

            const rawScreenY =
                (
                    -projected.y *
                        0.5 +
                    0.5
                ) *
                size.height;

            // =================================
            // X
            //
            // อยู่ในจอ → ตำแหน่งจริง
            // หลุดจอ → ติดขอบ
            // =================================

            desiredScreenX =
                THREE.MathUtils.clamp(
                    rawScreenX,

                    EDGE_PADDING_X,

                    size.width -
                        EDGE_PADDING_X,
                );

            // =================================
            // Y
            // =================================

            const centerY =
                size.height * 0.5;

            /*
             * projected.x:
             *
             * -1 ... 1 = อยู่ในจอ
             *
             * > 1 = หลุดขวา
             * < -1 = หลุดซ้าย
             */

            const horizontalOverflow =
                Math.max(
                    0,

                    Math.abs(
                        projected.x,
                    ) - 1,
                );

            /*
             * เพิ่งหลุดนิดเดียว:
             *
             * ใช้ Y ใกล้ตำแหน่งจริง
             *
             * หลุดไกลมาก:
             *
             * ค่อย ๆ เข้ากลางจอ
             */
            const offscreenBlend =
                THREE.MathUtils.clamp(
                    horizontalOverflow /
                        OFFSCREEN_BLEND_RANGE,

                    0,
                    1,
                );

            const blendedY =
                THREE.MathUtils.lerp(
                    rawScreenY,
                    centerY,
                    offscreenBlend,
                );

            desiredScreenY =
                THREE.MathUtils.clamp(
                    blendedY,

                    EDGE_PADDING_Y,

                    size.height -
                        EDGE_PADDING_Y,
                );
        }

        // =====================================
        // First Frame
        // =====================================

        if (!initialized.current) {
            currentScreenX.current =
                desiredScreenX;

            currentScreenY.current =
                desiredScreenY;

            initialized.current =
                true;
        }

        // =====================================
        // Smooth Movement
        // =====================================

        const safeDelta =
            Math.min(
                delta,
                0.1,
            );

        const smoothing =
            1 -
            Math.exp(
                -MARKER_FOLLOW_SPEED *
                    safeDelta,
            );

        currentScreenX.current =
            THREE.MathUtils.lerp(
                currentScreenX.current,
                desiredScreenX,
                smoothing,
            );

        currentScreenY.current =
            THREE.MathUtils.lerp(
                currentScreenY.current,
                desiredScreenY,
                smoothing,
            );

        // =====================================
        // Apply DOM Position
        // =====================================

        marker.style.transform = `
            translate3d(
                ${currentScreenX.current}px,
                ${currentScreenY.current}px,
                0
            )
            translate(
                -50%,
                -50%
            )
        `;
    });

    return (
        <Html
            fullscreen
            style={{
                pointerEvents:
                    "none",
            }}
        >
            <div
                ref={
                    markerRef
                }
                className="
                    absolute
                    left-0
                    top-0
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    pointer-events-none
                    select-none
                "
                style={{
                    willChange:
                        "transform",
                }}
            >
                {/* Pulse */}

                <div
                    className="
                        absolute
                        h-9
                        w-9
                        animate-ping
                        rounded-full
                        border
                        border-white/40
                    "
                />

                {/* Outer Ring */}

                <div
                    className="
                        absolute
                        h-6
                        w-6
                        rounded-full
                        border
                        border-white/70
                    "
                />

                {/* Dot */}

                <div
                    className="
                        h-3
                        w-3
                        rounded-full
                        bg-white
                        shadow-[0_0_14px_rgba(255,255,255,0.95)]
                    "
                />
            </div>
        </Html>
    );
}