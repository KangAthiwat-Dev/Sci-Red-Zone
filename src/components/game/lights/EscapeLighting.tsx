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
                color="#d6e5f5"
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
                    1024
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
                    "#030608",
                ]}
            />

            <fog
                attach="fog"
                args={[
                    "#071017",
                    8,
                    34,
                ]}
            />

            {/* =================================
                Base Fill
            ================================= */}

            <ambientLight
                intensity={0.28}
                color="#66798a"
            />

            <hemisphereLight
                intensity={0.16}
                color="#8aa2b8"
                groundColor="#050708"
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
                color="#7696b5"
                intensity={0.26}
            />

            {/* =================================
                Moon / Exterior Beam
            ================================= */}

            {/* <LightBeam
                position={[
                    18,
                    10,
                    -4,
                ]}
                target={[
                    24,
                    DEFAULT_LIGHT_TARGET_Y,
                    0,
                ]}
                color="#a8c7e8"
                intensity={54}
                distance={28}
                angle={0.42}
                penumbra={1}
                outerRadius={4.5}
                beamOpacity={0.035}
                castShadow
                shadowMapSize={
                    1024
                }
            /> */}

            {/* =================================
                CEILING / PATH LIGHTS

                ใช้ pattern เดียวกับ Stairway
            ================================= */}

            <CeilingLamp
                x={-5.5}
                intensity={28}
            />

            <CeilingLamp
                x={13}
                intensity={30}
                castShadow
            />
            <CeilingLamp
                x={22}
                intensity={40}
                castShadow
            />

            <CeilingLamp
                x={30}
                intensity={27}
            />

            {/* =================================
                Broken Light
            ================================= */}

            <CeilingLamp
                x={52}
                intensity={34}
                flicker
            />

            {/* =================================
                Dark Gap
            ================================= */}

            <CeilingLamp
                x={82}
                intensity={22}
                castShadow
            />

            <CeilingLamp
                x={108}
                intensity={26}
            />

            {/* =================================
                Warm Accent
            ================================= */}

            <pointLight
                position={[
                    34,
                    2.4,
                    -1.3,
                ]}
                color="#a87345"
                intensity={3.5}
                distance={9}
                decay={2}
            />

            {/* =================================
                Cold Accent
            ================================= */}

            <pointLight
                position={[
                    92,
                    3,
                    -2,
                ]}
                color="#5f8eb8"
                intensity={4}
                distance={12}
                decay={2}
            />

            {/* =================================
                Exit / Danger
            ================================= */}

            <WallEmergencyLight
                position={[
                    118,
                    5,
                    -2,
                ]}
                rotation={[
                    0,
                    0,
                    0,
                ]}
            />

            <WallEmergencyLight
                position={[
                    142,
                    5,
                    0,
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