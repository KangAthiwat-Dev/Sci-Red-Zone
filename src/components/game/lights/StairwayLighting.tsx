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
                    30,
                ]}
            />

            {/* =================================
                Base Fill
            ================================= */}

            <ambientLight
                intensity={0.32}
                color="#80796f"
            />

            <hemisphereLight
                intensity={0.13}
                color="#a59782"
                groundColor="#070809"
            />

            {/* =================================
                Cold Background Fill
            ================================= */}

            <directionalLight
                position={[
                    -12,
                    12,
                    -8,
                ]}
                color="#667d9e"
                intensity={0.2}
            />


            {/* =================================
                CEILING LIGHTS

                Map นี้เป็นทางเรียบ
                Beam ทุกดวงยิงลงพื้น Y เดียวกัน
            ================================= */}

            <CeilingLamp
                x={-5.5}
                intensity={34}
            />

            <CeilingLamp
                x={6}
                intensity={31}
                castShadow
            />

            <CeilingLamp
                x={25}
                intensity={35}
            />

            {/* =================================
                Broken Light
            ================================= */}

            <CeilingLamp
                x={48.5}
                intensity={38}
            />

            {/* =================================
                Dark Gap

                จงใจเว้นช่วงมืด
                เพื่อให้ Player เดินผ่านความมืด
            ================================= */}

            <CeilingLamp
                x={100}
                intensity={24}
            />
            <CeilingLamp
                x={112}
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