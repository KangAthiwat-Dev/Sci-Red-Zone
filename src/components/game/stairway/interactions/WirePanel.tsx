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

import {
    WIRE_PANEL_POSITION,
    WIRE_PANEL_SENSOR_SIZE,
} from "../stairwayConfig";

import ElectricalPanel from "../../objects/ElectricalPanel";

import {
    useInteractionLocked,
} from "../../interactions/InteractionLockContext";

type WirePanelProps = {
    enabled: boolean;

    completed: boolean;

    onOpen: () => void;
};

export default function WirePanel({
    enabled,
    completed,
    onOpen,
}: WirePanelProps) {
    const [
        playerNear,
        setPlayerNear,
    ] = useState(false);

    // ========================================
    // Global Interaction Lock
    // ========================================

    const interactionLocked =
        useInteractionLocked();

    const canInteract =
        enabled &&
        !completed &&
        !interactionLocked;

    // ========================================
    // Keyboard
    // ========================================

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (
                event.code !==
                    "KeyE" ||
                event.repeat
            ) {
                return;
            }

            if (
                !canInteract ||
                !playerNear
            ) {
                return;
            }

            event.preventDefault();

            onOpen();
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
        canInteract,
        onOpen,
        playerNear,
    ]);

    return (
        <group
            position={
                WIRE_PANEL_POSITION
            }
        >
            {/* =========================
                Electrical Panel Object
            ========================= */}

            <ElectricalPanel
                completed={completed}
            />

            {/* =========================
                Interaction Sensor
            ========================= */}

            <CuboidCollider
                args={
                    WIRE_PANEL_SENSOR_SIZE
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

                    setPlayerNear(true);
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

                    setPlayerNear(false);
                }}
            />

            {/* =========================
                Interaction UI
            ========================= */}

            {canInteract &&
                playerNear && (
                    <group
                        position={[
                            0,
                            1,
                            0,
                        ]}
                    >
                        <Html center>
                            <div
                                className="
                                    pointer-events-none
                                    select-none
                                    whitespace-nowrap
                                    rounded-lg
                                    bg-black/80
                                    px-4
                                    py-2
                                    text-sm
                                    text-white
                                "
                            >
                                <span
                                    className="
                                        font-bold
                                    "
                                >
                                    E
                                </span>

                                {"  "}

                                ตรวจสอบแผงไฟ
                            </div>
                        </Html>
                    </group>
                )}
        </group>
    );
}