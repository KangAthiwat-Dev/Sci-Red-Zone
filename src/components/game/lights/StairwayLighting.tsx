"use client";

import LightBeam from "./LightBeam";
import HangingLamp from "../objects/HangingLamp";
import {
    BUILDING_CEILING_Y,
    HANGING_LAMP_OFFSET_Y,
    CEILING_LIGHT_Z,
    DEFAULT_LIGHT_TARGET_Y,
} from "./lightingConfig";
import WallEmergencyLight from "../objects/WallEmergencyLight";

// ========================================
// Ceiling Lamp
// ========================================

type CeilingLampProps = {
    x: number;
    intensity?: number;
    flicker?: boolean;
    castShadow?: boolean;
};

function CeilingLamp({
    x,
    intensity = 100,
    flicker = false,
    castShadow = false,
}: CeilingLampProps) {
    const lampY =
        BUILDING_CEILING_Y;

    return (
        <>
            {/* =========================
                Hanging Lamp
            ========================= */}

            <HangingLamp
                position={[
                    x,

                    lampY +
                    HANGING_LAMP_OFFSET_Y,

                    CEILING_LIGHT_Z,
                ]}
            />

            {/* =========================
                Light + Beam
            ========================= */}

            <LightBeam
                position={[
                    x,
                    lampY - 0.05,
                    CEILING_LIGHT_Z,
                ]}
                target={[
                    x,
                    DEFAULT_LIGHT_TARGET_Y,
                    0,
                ]}
                color="#ffe1ad"
                intensity={
                    intensity
                }
                distance={25}
                angle={0.48}
                penumbra={0.96}
                outerRadius={2.4}
                beamOpacity={0.04}
                castShadow={
                    castShadow
                }
                shadowMapSize={
                    512
                }
                flicker={
                    flicker
                }
            />
        </>
    );
}

// ========================================
// Stairway Lighting
// ========================================

export default function StairwayLighting() {
    return (
        <>
            {/* =================================
                Environment
            ================================= */}

            <color
                attach="background"
                args={[
                    "#040609",
                ]}
            />

            <fog
                attach="fog"
                args={[
                    "#080a0e",
                    7,
                    28,
                ]}
            />

            {/* =================================
                Base Fill
            ================================= */}

            <ambientLight
                intensity={0.48}
                color="#80796f"
            />

            <hemisphereLight
                intensity={0.43}
                color="#a59782"
                groundColor="#070809"
            />

            <directionalLight
                position={[
                    -12,
                    12,
                    -8,
                ]}
                color="#F2F2F2"
                intensity={0.45}
            />

            <CeilingLamp
                x={-5.5}
                intensity={34}
            />

            <CeilingLamp
                x={10}
                intensity={34}
            />

            <CeilingLamp
                x={25}
                intensity={34}
            />

            <CeilingLamp
                x={48.5}
                intensity={38}
            />

            <CeilingLamp
                x={82}
                intensity={38}
            />

            <CeilingLamp
                x={111}
                intensity={38}
            />

            {/* =================================
                Exit / Danger
            ================================= */}
            <WallEmergencyLight
                position={[82, 5, -2]}
                rotation={[0, 0, 0]}
            />
        </>
    );
}