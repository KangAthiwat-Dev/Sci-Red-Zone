"use client";

import type {
    MapDefinition,
} from "./mapTypes";

type GameBackgroundProps = {
    background:
        MapDefinition["background"];
};

export default function GameBackground({
    background,
}: GameBackgroundProps) {
    return (
        <mesh
            position={
                background.position
            }
        >
            <planeGeometry
                args={
                    background.size
                }
            />

            <meshBasicMaterial
                color={
                    background.fallbackColor
                }
                toneMapped={false}
                depthWrite={false}
            />
        </mesh>
    );
}