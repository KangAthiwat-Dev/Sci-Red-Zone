"use client";

import { useEffect } from "react";

import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

import * as THREE from "three";

export default function StairwayCollision() {
  // ==============================
  // Visual Map
  // ==============================

  const visual = useGLTF("/maps/stairway/visual.glb");

  // ==============================
  // Collision Map
  // ==============================

  const collision = useGLTF("/maps/stairway/collision.glb");

  // ==============================
  // Shadow settings
  // ==============================

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
      {/* =========================
                Visual Map
            ========================= */}

      <primitive object={visual.scene} />

      {/* =========================
                Physics Collision

                ซ่อน mesh collision
                แต่ยังให้ Rapier ใช้งาน
            ========================= */}

      <RigidBody type="fixed" colliders="trimesh" includeInvisible>
        <primitive object={collision.scene} visible={false} />
      </RigidBody>
    </>
  );
}

useGLTF.preload("/maps/stairway/visual.glb");

useGLTF.preload("/maps/stairway/collision.glb");
