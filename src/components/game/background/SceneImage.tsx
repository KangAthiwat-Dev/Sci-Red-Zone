"use client";

import { useTexture } from "@react-three/drei";

type SceneImageProps = {
  src: string;

  position: [number, number, number];

  size: [number, number];

  rotation?: [number, number, number];

  opacity?: number;

  flipX?: boolean;

  renderOrder?: number;
};

export default function SceneImage({
  src,
  position,
  size,
  rotation = [0, 0, 0],
  opacity = 1,
  flipX = false,
  renderOrder = 0,
}: SceneImageProps) {
  const texture = useTexture(src);

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={[flipX ? -1 : 1, 1, 1]}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[size[0], size[1]]} />

      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        alphaTest={0.03}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
