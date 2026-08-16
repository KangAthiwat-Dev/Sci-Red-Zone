"use client";

import {
    useState,
} from "react";

import {
    Html,
} from "@react-three/drei";

import {
    CuboidCollider,
} from "@react-three/rapier";

import type {
    StairwayProgress,
} from "../stairwayTypes";

import {
    STAIRWAY_DOOR_POSITION,
    STAIRWAY_DOOR_SENSOR_SIZE,
} from "../stairwayConfig";

type StairwayDoorStatusProps = {
    progress: StairwayProgress;

    onDoorInspected: () => void;

    onKeycardRequested: () => void;
};

export default function StairwayDoorStatus({
    progress,

    onDoorInspected,

    onKeycardRequested,
}: StairwayDoorStatusProps) {
    const [
        playerNear,
        setPlayerNear,
    ] = useState(false);

    function handlePlayerEnter() {
        setPlayerNear(true);

        // ==============================
        // Phase 1
        // ไฟฟ้ายังเสีย
        // ==============================

        if (
            !progress.powerRestored
        ) {
            onDoorInspected();

            return;
        }

        // ==============================
        // Phase 2
        // ไฟกลับมาแล้ว
        // แต่ยังไม่มี Keycard
        // ==============================

        if (
            !progress.keycardCollected
        ) {
            onKeycardRequested();
        }
    }

    function getMessage() {
        if (
            !progress.powerRestored
        ) {
            return {
                title:
                    "DOOR POWER FAILURE",

                detail:
                    "ระบบไฟฟ้าของประตูขัดข้อง",

                hint:
                    "ตรวจสอบแผงควบคุมไฟฟ้า",
            };
        }

        if (
            !progress.keycardCollected
        ) {
            return {
                title:
                    "ACCESS DENIED",

                detail:
                    "กรุณาใส่ Keycard",

                hint:
                    "ค้นหา Keycard เพื่อปลดล็อกประตู",
            };
        }

        return {
            title: "",
            detail: "",
            hint: "",
        };
    }

    const message =
        getMessage();

    return (
        <group
            position={
                STAIRWAY_DOOR_POSITION
            }
        >
            {/* =========================
                Door Sensor
            ========================= */}

            <CuboidCollider
                args={
                    STAIRWAY_DOOR_SENSOR_SIZE
                }
                sensor
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

                    handlePlayerEnter();
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

                    setPlayerNear(
                        false,
                    );
                }}
            />

            {/* =========================
                Message
            ========================= */}

            {playerNear &&
                !progress.keycardCollected && (
                    <group
                        position={[
                            0,
                            2.2,
                            0,
                        ]}
                    >
                        <Html
                            center
                            distanceFactor={
                                10
                            }
                        >
                            <div
                                className="
                                w-80
                                rounded-xl
                                border
                                border-white/15
                                bg-black/85
                                px-5
                                py-4
                                text-center
                                text-white
                                shadow-2xl
                                backdrop-blur-md
                                pointer-events-none
                                select-none
                            "
                            >
                                <div
                                    className="
                                    text-[10px]
                                    font-semibold
                                    tracking-[0.3em]
                                    text-red-400
                                "
                                >
                                    {
                                        message.title
                                    }
                                </div>

                                <div
                                    className="
                                    mt-2
                                    text-sm
                                    font-medium
                                "
                                >
                                    {
                                        message.detail
                                    }
                                </div>

                                <div
                                    className="
                                    mt-1
                                    text-xs
                                    text-white/50
                                "
                                >
                                    {
                                        message.hint
                                    }
                                </div>
                            </div>
                        </Html>
                    </group>
                )}
        </group>
    );
}