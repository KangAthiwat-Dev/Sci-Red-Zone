"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// ========================================
// Types
// ========================================

type Vector3Tuple = [number, number, number];

type PushDoorProps = {
  position: Vector3Tuple;

  rotation?: Vector3Tuple;

  width?: number;

  height?: number;

  thickness?: number;

  openDirection?: 1 | -1;

  autoCloseDelay?: number;
};

// ========================================
// Config
// ========================================

const OPEN_ANGLE = Math.PI / 2;

const OPEN_SPEED = 5;

// ========================================
// Door Frame Config
// ========================================

const FRAME_SIZE = 0.35;

// ========================================
// Push Door
// ========================================

export default function PushDoor({
  position,

  rotation = [0, 0, 0],

  width = 1.5,

  height = 3,

  thickness = 0.18,

  openDirection = 1,

  autoCloseDelay = 700,
}: PushDoorProps) {
  // ========================================
  // Ref
  // ========================================

  const doorVisualRef = useRef<THREE.Group>(null);

  const currentAngleRef = useRef(0);

  const rootRef = useRef<THREE.Group>(null);
  /*
   * ทิศเปิดจริงของประตู
   * จะเลือกใหม่ทุกครั้งที่ Player เดินเข้ามา
   */
  const openDirectionRef = useRef<1 | -1>(1);

  const closeTimerRef = useRef<number | null>(null);

  const bodiesInsideRef = useRef(0);

  // ========================================
  // State
  // ========================================

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);
  // ========================================
  // Door Animation
  // ========================================

  useFrame((_, delta) => {
    if (!doorVisualRef.current) {
      return;
    }

    const targetAngle = opened ? OPEN_ANGLE * openDirectionRef.current : 0;

    currentAngleRef.current = THREE.MathUtils.damp(
      currentAngleRef.current,

      targetAngle,

      OPEN_SPEED,

      delta,
    );

    /*
     * หมุน Group ที่บานพับ
     * ไม่หมุน RigidBody
     */
    doorVisualRef.current.rotation.y = currentAngleRef.current;
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      {/* =================================
    Door Frame - Left
================================= */}

      <mesh
        position={[-width / 2 - FRAME_SIZE / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[FRAME_SIZE, height + FRAME_SIZE, FRAME_SIZE]} />

        <meshStandardMaterial
          color="#171c22"
          roughness={0.8}
          metalness={0.25}
        />
      </mesh>

      {/* =================================
    Door Frame - Right
================================= */}

      <mesh
        position={[width / 2 + FRAME_SIZE / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[FRAME_SIZE, height + FRAME_SIZE, FRAME_SIZE]} />

        <meshStandardMaterial
          color="#171c22"
          roughness={0.8}
          metalness={0.25}
        />
      </mesh>

      {/* =================================
    Top Frame
================================= */}

      <mesh
        position={[0, height / 2 + FRAME_SIZE / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width + FRAME_SIZE * 2, FRAME_SIZE, FRAME_SIZE]} />

        <meshStandardMaterial
          color="#171c22"
          roughness={0.8}
          metalness={0.25}
        />
      </mesh>

      {/* =================================
                Closed Door Collision

                ตอนยังไม่เปิดเท่านั้น
            ================================= */}

      {!opened && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[width / 2, height / 2, thickness / 2 + 0.04]}
          />
        </RigidBody>
      )}

      {/* =================================
                Door Visual

                Origin = Left Hinge
            ================================= */}

      <group position={[-width / 2, 0, 0]} ref={doorVisualRef}>
        {/* Door */}

        <mesh position={[width / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, thickness]} />

          <meshStandardMaterial
            color="#20272e"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        {/* =================================
                    Front Panel
                ================================= */}

        <mesh position={[width / 2, 0, thickness / 2 + 0.01]} castShadow>
          <boxGeometry args={[width * 0.76, height * 0.78, 0.025]} />

          <meshStandardMaterial color="#151a1f" roughness={0.9} />
        </mesh>

        {/* =================================
                    Handle
                ================================= */}

        <mesh
          position={[width * 0.82, 0, thickness / 2 + 0.08]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.035, 0.18, 10]} />

          <meshStandardMaterial
            color="#929aa0"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* =================================
                    Hinge #1
                ================================= */}

        <mesh position={[0, height * 0.3, thickness / 2 + 0.03]}>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 10]} />

          <meshStandardMaterial
            color="#555d63"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* =================================
                    Hinge #2
                ================================= */}

        <mesh position={[0, -height * 0.3, thickness / 2 + 0.03]}>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 10]} />

          <meshStandardMaterial
            color="#555d63"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* =================================
                Player Sensor

                ยื่นออกมาหน้าประตู
                Player จะเข้าถึงก่อนชนประตู
            ================================= */}

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          sensor
          args={[width / 2 + 0.35, height / 2 - 0.1, 0.8]}
          onIntersectionEnter={(event) => {
            const otherBody = event.other.rigidBody;

            if (!otherBody || !otherBody.isDynamic()) {
              return;
            }

            // ==============================
            // หาว่า Player อยู่ฝั่งไหน
            // ==============================

            const root = rootRef.current;

            if (root) {
              const playerPosition = otherBody.translation();

              /*
               * แปลงตำแหน่ง Player
               * จาก World Space
               * เป็น Local Space ของประตู
               *
               * ทำให้ต่อให้ PushDoor มี rotation
               * ก็ยังเช็กซ้าย/ขวาถูก
               */
              const localPlayerPosition = root.worldToLocal(
                new THREE.Vector3(
                  playerPosition.x,
                  playerPosition.y,
                  playerPosition.z,
                ),
              );

              /*
               * Player มาจากซ้าย
               * → เปิดไปอีกด้าน
               *
               * Player มาจากขวา
               * → เปิดกลับอีกทาง
               */
              openDirectionRef.current = localPlayerPosition.x < 0 ? -1 : 1;
            }

            // ==============================
            // Player เข้า Sensor
            // ==============================

            bodiesInsideRef.current += 1;

            // ยกเลิก timer ปิด
            if (closeTimerRef.current !== null) {
              window.clearTimeout(closeTimerRef.current);

              closeTimerRef.current = null;
            }

            // เปิดประตู
            setOpened(true);
          }}
          onIntersectionExit={(event) => {
            const otherBody = event.other.rigidBody;

            if (!otherBody || !otherBody.isDynamic()) {
              return;
            }

            bodiesInsideRef.current = Math.max(0, bodiesInsideRef.current - 1);

            /*
             * ยังมี Player / Dynamic Body
             * อยู่ใน Sensor
             * ยังไม่ปิด
             */
            if (bodiesInsideRef.current > 0) {
              return;
            }

            /*
             * เดินพ้นประตูแล้ว
             * รอสักครู่แล้วปิด
             */
            closeTimerRef.current = window.setTimeout(() => {
              setOpened(false);

              closeTimerRef.current = null;
            }, autoCloseDelay);
          }}
        />
      </RigidBody>
    </group>
  );
}
