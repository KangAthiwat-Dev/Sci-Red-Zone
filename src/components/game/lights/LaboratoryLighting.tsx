"use client";

import LightBeam from "./LightBeam";
import HangingLamp from "../objects/HangingLamp";
import WallEmergencyLight from "../objects/WallEmergencyLight";

import {
    BUILDING_CEILING_Y,
    HANGING_LAMP_OFFSET_Y,
    CEILING_LIGHT_Z,
    DEFAULT_LIGHT_TARGET_Y,
} from "./lightingConfig";

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
    intensity = 30,
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
                angle={0.5}
                penumbra={0.94}
                outerRadius={2.5}
                beamOpacity={0.035}
                castShadow={
                    castShadow
                }
                shadowMapSize={512}
                flicker={
                    flicker
                }
            />
        </>
    );
}

// ========================================
// Laboratory Lighting
// ========================================

export default function LaboratoryLighting() {
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

                Lab ให้เย็นกว่าทางเดิน
                แต่ยังมืดแบบฉากก่อน
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

            {/* =================================
                Cold Background Fill
            ================================= */}

            <directionalLight
                position={[
                    -12,
                    12,
                    -8,
                ]}
                color="#F2F2F2"
                intensity={0.45}
            />

            {/* =================================
                CEILING LIGHTS
            ================================= */}

            <CeilingLamp
                x={-5.5}
                intensity={38}
            />

            <CeilingLamp
                x={19}
                intensity={38}
            />

            <CeilingLamp
                x={36.5}
                intensity={50}
            />

            <CeilingLamp
                x={58}
                intensity={38}
            />

            <CeilingLamp
                x={79}
                intensity={50}
            />

            <CeilingLamp
                x={99}
                intensity={38}
            />

            <CeilingLamp
                x={124.5}
                intensity={38}
            />

            <CeilingLamp
                x={141}
                intensity={48}
            />

            {/* =================================
                Exit / Danger
            ================================= */}

            <WallEmergencyLight
                position={[
                    144.5,
                    4,
                    -2,
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