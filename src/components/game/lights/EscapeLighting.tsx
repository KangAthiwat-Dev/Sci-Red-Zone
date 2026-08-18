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
                distance={26}
                angle={0.5}
                penumbra={0.96}
                outerRadius={2.8}
                beamOpacity={0.045}
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
// Escape Lighting
// ========================================

export default function EscapeLighting() {
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
                    30,
                ]}
            />

            {/* =================================
                Base Fill
            ================================= */}

            <ambientLight
                intensity={0.28}
                color="#80796f"
            />

            <hemisphereLight
                intensity={0.23}
                color="#a59782"
                groundColor="#070809"
            />

            {/* =================================
                Cold Outdoor Fill
            ================================= */}

            <directionalLight
                position={[
                    -18,
                    16,
                    -10,
                ]}
                color="#F2F2F2"
                intensity={0.25}
            />

            {/* =================================
                CEILING / PATH LIGHTS

                ใช้ pattern เดียวกับ Stairway
            ================================= */}

            <CeilingLamp
                x={-5.5}
                intensity={28}
            />

            <CeilingLamp
                x={22}
                intensity={40}
            />

            <CeilingLamp
                x={43}
                intensity={70}
            />

            {/* =================================
                Broken Light
            ================================= */}

            <CeilingLamp
                x={67}
                intensity={40}
            />

            <CeilingLamp
                x={88}
                intensity={38}
            />

            <CeilingLamp
                x={115}
                intensity={48}
            />

            {/* =================================
                Exit / Danger
            ================================= */}
            <WallEmergencyLight
                position={[
                    117.7,
                    5,
                    6,
                ]}
                rotation={[
                    0,
                    -Math.PI / 2,
                    0,
                ]}
            />
        </>
    );
}