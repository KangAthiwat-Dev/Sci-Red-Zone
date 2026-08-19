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
// LOW SPEC
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
      {/* =========================
                Hanging Lamp
            ========================= */}

      <HangingLamp
        position={[x, lampY + HANGING_LAMP_OFFSET_Y, CEILING_LIGHT_Z]}
      />

      {/* =========================
                Light + Beam
            ========================= */}

      <LightBeam
        position={[x, lampY - 0.05, CEILING_LIGHT_Z]}
        target={[x, DEFAULT_LIGHT_TARGET_Y, 0]}
        color="#ffe1ad"
        intensity={intensity}
        distance={25}
        angle={0.48}
        penumbra={0.96}
        outerRadius={2.4}
        beamOpacity={0.04}
        castShadow={castShadow}
        shadowMapSize={512}
        flicker={flicker}
      />
    </>
  );
}

// ========================================
// Hall Lighting
// LOW SPEC
// ========================================

export default function HallLighting() {
  return (
    <>
      {/* =========================
                Background
            ========================= */}

      <color attach="background" args={["#040609"]} />

      <fog attach="fog" args={["#080a0e", 9, 28]} />

      {/* =========================
                Base Lighting
            ========================= */}

      <ambientLight intensity={0.48} color="#80796f" />

      <hemisphereLight intensity={0.43} color="#a59782" groundColor="#070809" />

      <directionalLight
        position={[-12, 12, -8]}
        color="#F2F2F2"
        intensity={0.45}
        castShadow={false}
      />

      {/* =========================
                Ceiling Lamps

                เดิมมี Beam หลายดวง
                ตอนนี้ให้ Model อยู่
                แต่เปิด Beam แค่บางดวง
            ========================= */}

      <CeilingLamp x={-10} intensity={25} />

      <CeilingLamp x={6} intensity={38} />

      <CeilingLamp x={25} intensity={25} />

      <CeilingLamp x={46} intensity={24} />

      <CeilingLamp x={60} intensity={24} />

      <CeilingLamp x={70} intensity={38} />

      {/* =========================
                Emergency Light
            ========================= */}

      <WallEmergencyLight
        position={[84, 4, -2.3]}
        rotation={[0, -Math.PI / 2, 0]}
      />
    </>
  );
}
