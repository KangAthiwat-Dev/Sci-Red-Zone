"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Html,
} from "@react-three/drei";

import {
    CuboidCollider,
} from "@react-three/rapier";

import Keycard from "../../objects/Keycard";

import {
    KEYCARD_POSITION,
    KEYCARD_ROTATION,
    KEYCARD_SCALE,
    KEYCARD_SENSOR_SIZE,
} from "../stairwayConfig";

type KeycardPickupProps = {
    enabled: boolean;

    collected: boolean;

    onCollected: () => void;
};

export default function KeycardPickup({
    enabled,
    collected,
    onCollected,
}: KeycardPickupProps) {
    const [
        isPlayerNear,
        setIsPlayerNear,
    ] = useState(false);

    // ========================================
    // E = Collect
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

            if (
                !enabled ||
                collected ||
                !isPlayerNear
            ) {
                return;
            }

            onCollected();
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        enabled,
        collected,
        isPlayerNear,
        onCollected,
    ]);

    // ยังไม่ถึงขั้นค้นหา Keycard
    // หรือหยิบไปแล้ว
    if (
        !enabled ||
        collected
    ) {
        return null;
    }

    return (
        <group
            position={
                KEYCARD_POSITION
            }
            rotation={
                KEYCARD_ROTATION
            }
        >
            {/* =========================
                Keycard Object
            ========================= */}

            <Keycard
                scale={
                    KEYCARD_SCALE
                }
            />

            {/* =========================
                Sensor
            ========================= */}

            <CuboidCollider
                args={
                    KEYCARD_SENSOR_SIZE
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

                    setIsPlayerNear(
                        true,
                    );
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

                    setIsPlayerNear(
                        false,
                    );
                }}
            />

            {/* =========================
                UI
            ========================= */}

            {isPlayerNear && (
                <group
                    position={[
                        0,
                        0.7,
                        0,
                    ]}
                >
                    <Html center>
                        <div
                            className="
                                whitespace-nowrap
                                rounded-lg
                                border
                                border-white/10
                                bg-black/85
                                px-4
                                py-2
                                text-sm
                                text-white
                                shadow-xl
                                backdrop-blur-sm
                                pointer-events-none
                                select-none
                            "
                        >
                            <span className="font-bold">
                                E
                            </span>

                            {" "}

                            หยิบ Keycard
                        </div>
                    </Html>
                </group>
            )}
        </group>
    );
}