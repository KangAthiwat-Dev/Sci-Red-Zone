"use client";

import { useEffect } from "react";

import { useGLTF } from "@react-three/drei";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import * as THREE from "three";

export default function EscapeCollision() {
  const visual = useGLTF("/maps/escape/visual.glb");

  const collision = useGLTF("/maps/escape/collision.glb");

  // ========================================
  // Visual Shadow Setup
  // ========================================

  useEffect(() => {
    visual.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
      }
    });
  }, [visual.scene]);

  return (
    <>
      {/* =================================
                Visual Map
            ================================= */}

      <primitive object={visual.scene} />

      {/* =================================
                Collision Map
            ================================= */}

      <RigidBody type="fixed" colliders="trimesh" includeInvisible>
        <primitive object={collision.scene} visible={false} />
      </RigidBody>

      {/* =================================
    DEBUG FLOOR
    เอาไว้ทดสอบ Zombie เท่านั้น
================================= */}

      {/* <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[80, 0.25, 3]} position={[60, 0, 0]} />
      </RigidBody> */}
    </>
  );
}

// ========================================
// Preload
// ========================================

useGLTF.preload("/maps/escape/visual.glb");

useGLTF.preload("/maps/escape/collision.glb");
