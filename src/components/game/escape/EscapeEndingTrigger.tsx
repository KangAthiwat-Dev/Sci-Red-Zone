"use client";

import {
    CuboidCollider,
    RigidBody,
} from "@react-three/rapier";

type EscapeEndingTriggerProps = {
    position: [
        number,
        number,
        number,
    ];

    halfExtents: [
        number,
        number,
        number,
    ];

    enabled?: boolean;

    onEnter: () => void;
};

export default function EscapeEndingTrigger({
    position,
    halfExtents,
    enabled = true,
    onEnter,
}: EscapeEndingTriggerProps) {
    if (!enabled) {
        return null;
    }

    return (
        <RigidBody
            type="fixed"
            colliders={false}
        >
            <CuboidCollider
                sensor
                position={position}
                args={halfExtents}
                onIntersectionEnter={({
                    other,
                }) => {
                    /*
                     * รับเฉพาะ Player
                     */
                    if (
                        other
                            .rigidBodyObject
                            ?.name !==
                        "player"
                    ) {
                        return;
                    }

                    onEnter();
                }}
            />
        </RigidBody>
    );
}