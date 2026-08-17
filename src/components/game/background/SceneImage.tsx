"use client";

import {
  useEffect,
} from "react";

import {
  useTexture,
} from "@react-three/drei";

import {
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

type SceneImageProps = {
  src: string;

  position: [
    number,
    number,
    number,
  ];

  size: [
    number,
    number,
  ];

  rotation?: [
    number,
    number,
    number,
  ];

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
  const texture =
    useTexture(src);

  const gl =
    useThree(
      (state) => state.gl,
    );

  // ========================================
  // Texture Optimization + GPU Warmup
  // ========================================

  useEffect(() => {
    /*
     * Decoration พวกนี้เป็นภาพ 2D
     * ไม่จำเป็นต้องสร้าง mipmap หลายระดับ
     *
     * ลดทั้ง memory และงานตอน upload
     */
    texture.generateMipmaps =
      false;

    texture.minFilter =
      THREE.LinearFilter;

    texture.magFilter =
      THREE.LinearFilter;

    /*
     * บังคับส่ง Texture เข้า GPU
     * ตั้งแต่ SceneImage mount
     *
     * แทนที่จะรอจน Player
     * เดินมาเห็นภาพครั้งแรก
     */
    gl.initTexture(
      texture,
    );
  }, [
    gl,
    texture,
  ]);

  return (
    <mesh
      position={
        position
      }
      rotation={
        rotation
      }
      scale={[
        flipX
          ? -1
          : 1,
        1,
        1,
      ]}
      renderOrder={
        renderOrder
      }
    >
      <planeGeometry
        args={[
          size[0],
          size[1],
        ]}
      />

      <meshBasicMaterial
        map={
          texture
        }
        transparent
        opacity={
          opacity
        }
        alphaTest={
          0.03
        }
        depthWrite={
          false
        }
        toneMapped={
          false
        }
      />
    </mesh>
  );
}