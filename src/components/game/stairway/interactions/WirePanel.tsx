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
                !enabled ||
                completed ||
                !playerNear
            ) {
                return;
            }

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
        completed,
        enabled,
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

                    setPlayerNear(
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

                    setPlayerNear(
                        false,
                    );
                }}
            />

            {/* =========================
            Interaction UI
        ========================= */}
            {enabled &&
                !completed &&
                playerNear && (
                    <group
                        position={[
                            0,
                            1,
                            0,
                        ]}
                    >
                        <Html
                            center
                        >
                            <div
                                className="
                                    whitespace-nowrap
                                    rounded-lg
                                    bg-black/80
                                    px-4
                                    py-2
                                    text-sm
                                    text-white
                                    pointer-events-none
                                    select-none
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