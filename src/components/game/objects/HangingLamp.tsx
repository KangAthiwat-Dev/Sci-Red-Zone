"use client";

import * as THREE from "three";

type HangingLampProps = {
  position?: [number, number, number];
  cableHeight?: number;
  shadeRadius?: number;
  bulbRadius?: number;
  color?: string;
};

export default function HangingLamp({
  position = [0, 5, 0],
  cableHeight = 3,
  shadeRadius = 0.35,
  bulbRadius = 0.11,
  color = "#f3f6ff",
}: HangingLampProps) {
  return (
    <group position={position}>
      {/* สายไฟ */}
      <mesh position={[0, -cableHeight / 2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, cableHeight, 10]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>

      {/* จานครอบ */}
      <mesh
        position={[0, -cableHeight - 0.06, 0]}
        rotation={[0, 0, 0]}
      >
        <coneGeometry args={[shadeRadius, 0.28, 32, 1, true]} />
        <meshStandardMaterial
          color="#d9dde3"
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ขั้วหลอด */}
      <mesh position={[0, -cableHeight - 0.02, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#444444" roughness={0.8} />
      </mesh>

      {/* หลอดไฟกลม */}
      <mesh position={[0, -cableHeight - 0.14, 0]}>
        <sphereGeometry args={[bulbRadius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={8.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}