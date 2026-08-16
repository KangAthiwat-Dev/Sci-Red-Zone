"use client";

import { useEffect } from "react";

import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

import * as THREE from "three";
import PushDoor from "../../objects/PushDoor";

export default function LaboratoryCollision() {
  // ==============================
  // Visual Map
  // ==============================

  const visual = useGLTF("/maps/laboratory/visual.glb");

  // ==============================
  // Collision Map
  // ==============================

  const collision = useGLTF("/maps/laboratory/collision.glb");

  // ==============================
  // Shadow settings
  // ==============================

  useEffect(() => {
    visual.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.SkinnedMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [visual.scene]);

  return (
    <>
      {/* Visual */}

      <primitive object={visual.scene} />

      {/* Collision */}

      <RigidBody type="fixed" colliders="trimesh" includeInvisible>
        <primitive object={collision.scene} visible={false} />
      </RigidBody>

      {/* =========================
            Laboratory Push Door
        ========================= */}
      <PushDoor
        position={[8, 2.5, 0]}
        rotation={[0,Math.PI / 2, 0]}
        width={2.5}
        height={5}
        thickness={0.14}
        autoCloseDelay={600}
      />
      <PushDoor
        position={[30.3, 2.5, 0]}
        rotation={[0,Math.PI / 2, 0]}
        width={4}
        height={5}
        thickness={0.14}
        autoCloseDelay={600}
      />
      <PushDoor
        position={[43.3, 2.5, 0]}
        rotation={[0,Math.PI / 2, 0]}
        width={4}
        height={5}
        thickness={0.14}
        autoCloseDelay={600}
      />
      <PushDoor
        position={[72.7, 2.5, 0]}
        rotation={[0,Math.PI / 2, 0]}
        width={4}
        height={5}
        thickness={0.14}
        autoCloseDelay={600}
      />
      <PushDoor
        position={[85.7, 2.5, 0]}
        rotation={[0,Math.PI / 2, 0]}
        width={4}
        height={5}
        thickness={0.14}
        autoCloseDelay={600}
      />
      <PushDoor
        position={[110.3, 2.5, 0]}
        rotation={[0,Math.PI / 2, 0]}
        width={2.5}
        height={5}
        thickness={0.14}
        autoCloseDelay={600}
      />
    </>
  );
}

useGLTF.preload("/maps/laboratory/visual.glb");

useGLTF.preload("/maps/laboratory/collision.glb");
