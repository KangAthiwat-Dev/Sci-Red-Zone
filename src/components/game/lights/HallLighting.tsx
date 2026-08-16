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
    const lampY = BUILDING_CEILING_Y;

    return (
        <>
            {/* =================================
                แสงลงพื้น
                ================================= */}
            <HangingLamp
                position={[x, lampY +
                    HANGING_LAMP_OFFSET_Y,
                    CEILING_LIGHT_Z,]}
            />
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
                color="#c6dcff"
                intensity={
                    intensity
                }
                distance={25}
                angle={0.48}
                penumbra={0.92}
                outerRadius={2.4}

                beamOpacity={
                    0.04
                }

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
// Hall Lighting
// ========================================

export default function HallLighting() {
    return (
        <>
            {/* =================================
                Environment
            ================================= */}

            <color
                attach="background"
                args={[
                    "#06080d",
                ]}
            />

            <fog
                attach="fog"
                args={["#0a0d14", 7, 28]}
            />

            {/* =================================
                Base Fill

                จงใจต่ำ
                เพื่อให้มีพื้นที่มืดจริง
            ================================= */}

            <ambientLight
                intensity={0.88}
                color="#788ba6"
            />

            <hemisphereLight
                intensity={0.14}
                color="#9bb4d1"
                groundColor="#080b10"
            />

            {/* =================================
                Moon / Cold General Fill

                ไม่ cast shadow
                ให้เป็นแค่แสงเสริม
            ================================= */}

            <directionalLight
                position={[
                    -12,
                    12,
                    -8,
                ]}
                color="#7895bd"
                intensity={0.28}
            />

            {/* =================================
                WINDOW / GOD RAYS

                แสงจาก background wall
                เฉียงลงมาหา Player lane
            ================================= */}

            {/* Window Beam #1 */}
            <LightBeam
                position={[18, 7.1, -3.0]}
                target={[24.5, 0.05, 0.8]}
                color="#cfe1ff"
                intensity={68}
                distance={22}
                angle={0.4}
                penumbra={1}
                outerRadius={4.3}
                beamOpacity={0.05}
                castShadow
                shadowMapSize={1024}
            />

            {/* =================================
                CEILING LIGHTS

                เว้นบางช่วงไว้ให้มืด
                จะดู cinematic กว่าเปิดทุกเมตร
            ================================= */}

            <CeilingLamp
                x={-10}
                intensity={23}
            />

            <CeilingLamp
                x={6}
                intensity={20}
            />

            {/* ช่วงนี้มี Shadow */}
            {/* <CeilingLamp
                x={25}
                intensity={24}
                castShadow
            /> */}

            {/* ไฟเสีย */}
            <CeilingLamp
                x={46}
                intensity={27}
                // flicker
            />

            {/* deliberately darker gap */}

            <CeilingLamp
                x={60}
                intensity={18}
            />

            <CeilingLamp
                x={70}
                intensity={16}
            />

            {/* =================================
                Exit / danger
            ================================= */}
            <WallEmergencyLight
                position={[84, 4, -2.3]}
                rotation={[0, -Math.PI / 2, 0]}
            />
        </>
    );
}