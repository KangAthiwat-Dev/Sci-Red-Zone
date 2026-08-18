"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import {
  ESCAPE_ZOMBIE_INTRO_CAMERA_FOV,
  ESCAPE_ZOMBIE_INTRO_CAMERA_POSITION,
  ESCAPE_ZOMBIE_INTRO_CAMERA_SPEED,
  ESCAPE_ZOMBIE_INTRO_CAMERA_TARGET,
} from "./escapeConfig";

const cameraPosition =
  new THREE.Vector3(
    ...ESCAPE_ZOMBIE_INTRO_CAMERA_POSITION,
  );

const cameraTarget =
  new THREE.Vector3(
    ...ESCAPE_ZOMBIE_INTRO_CAMERA_TARGET,
  );

export default function EscapeZombieIntroCamera({
  active,
}: {
  active: boolean;
}) {
  const { camera } = useThree();

  const cameraRef =
    useRef(camera);

  useEffect(() => {
    cameraRef.current =
      camera;
  }, [camera]);

  useFrame((_, delta) => {
    if (!active) {
      return;
    }

    const activeCamera =
      cameraRef.current;

    const safeDelta =
      Math.min(delta, 0.1);

    const smoothing =
      1 -
      Math.exp(
        -ESCAPE_ZOMBIE_INTRO_CAMERA_SPEED *
          safeDelta,
      );

    activeCamera.position.lerp(
      cameraPosition,
      smoothing,
    );

    if (
      activeCamera instanceof
      THREE.PerspectiveCamera
    ) {
      activeCamera.fov =
        THREE.MathUtils.lerp(
          activeCamera.fov,
          ESCAPE_ZOMBIE_INTRO_CAMERA_FOV,
          smoothing,
        );

      activeCamera.updateProjectionMatrix();
    }

    activeCamera.lookAt(cameraTarget);
  });

  return null;
}
