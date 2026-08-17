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

  showBeam?: boolean;
};

function CeilingLamp({
  x,
  intensity = 18,
  showBeam = false,
}: CeilingLampProps) {
  const lampY = BUILDING_CEILING_Y;

  return (
    <>
      {/* =========================
                Lamp Model
            ========================= */}

      <HangingLamp
        position={[x, lampY + HANGING_LAMP_OFFSET_Y, CEILING_LIGHT_Z]}
      />

      {/* =========================
                Beam

                Low spec:
                เปิดเฉพาะบางดวง
            ========================= */}

      {showBeam && (
        <LightBeam
          position={[x, lampY - 0.05, CEILING_LIGHT_Z]}
          target={[x, DEFAULT_LIGHT_TARGET_Y, 0]}
          color="#c6dcff"
          intensity={15}
          distance={14}
          angle={0.48}
          penumbra={1}
          outerRadius={2.8}
          beamOpacity={0.045}
          castShadow={false}
          shadowMapSize={128}
          flicker={false}
        />
      )}
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

      <color attach="background" args={["#06080d"]} />

      {/* =========================
                Fog

                เก็บไว้ได้
                ไม่ใช่ตัวหนักหลัก
            ========================= */}

      <fog attach="fog" args={["#0a0d14", 8, 26]} />

      {/* =========================
                Base Lighting
            ========================= */}

      <ambientLight intensity={0.32} color="#788ba6" />

      <hemisphereLight intensity={0.62} color="#9bb4d1" groundColor="#080b10" />

      {/* =========================
                General Direction Light

                ไม่มี Shadow
            ========================= */}

      <directionalLight
        position={[-12, 12, -8]}
        color="#7895bd"
        intensity={0.22}
        castShadow={false}
      />

      {/* =========================
                Ceiling Lamps

                เดิมมี Beam หลายดวง
                ตอนนี้ให้ Model อยู่
                แต่เปิด Beam แค่บางดวง
            ========================= */}

      <CeilingLamp x={-10} showBeam intensity={15} />

      <CeilingLamp x={6} showBeam intensity={15} />

      <CeilingLamp x={25} showBeam intensity={15} />

      <CeilingLamp x={46} showBeam intensity={14} />

      <CeilingLamp x={60} showBeam intensity={14} />

      <CeilingLamp x={70} intensity={14} />

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
