"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type LayerPlaneProps = {
  url: string;
  position: [number, number, number];
  size: [number, number];
  opacity?: number;
  color?: string;
  rotation?: [number, number, number];
};

export default function LayerPlane({
  url,
  position,
  size,
  opacity = 1,
  color = "#ffffff",
  rotation = [0, 0, 0],
}: LayerPlaneProps) {
  const texture = useTexture(url);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        color={color}
        alphaTest={0.03}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}