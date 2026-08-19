"use client";

import { Html } from "@react-three/drei";
import WoodenCrate from "./WoodenCrate";
import * as THREE from "three";
import {
  CuboidCollider,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
  type RapierCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PushInteractionState } from "../interactions/push/pushTypes";
import { resolvePushConstraint } from "../interactions/push/pushConstraint";

type ModelPrinterProps = {
  position?: [number, number, number];

  onPushStateChange?: (state: PushInteractionState) => void;

  onPlaced?: () => void;
};

// ============================
// Grab Settings
// ============================

// ระยะจากจุดกึ่งกลาง Player ถึงผิวหน้า Printer ตอนดัน
// ตรงกับระยะยื่นมือของคลิป Pushing โดยให้มือแตะขอบเล็กน้อย
// แต่กันศีรษะ/ลำตัวไม่ให้จมเข้าโมเดล
const PUSH_HAND_CONTACT_DISTANCE = 1.4;
const GRAB_DISTANCE_RANGE = 0.3;

// ความแรงในการรักษาระยะมือกับ Printer ระหว่างดัน
const FOLLOW_STRENGTH = 12;

// จำกัดไม่ให้ Printer พุ่งเร็วเกิน
// ต้องมากกว่าความเร็ววิ่งของ Player เล็กน้อย
const MAX_FOLLOW_SPEED = 12;

// ============================
// Printer Lane
// ============================

// ตำแหน่งปกติ เครื่องพิมพ์หลบออกจากทาง Player
const PRINTER_STORAGE_Z = -1.2;

// ตำแหน่งเดียวกับ Player
const PLAYER_LANE_Z = 0;

// X ที่ต้องดันเครื่องพิมพ์ไปถึง
const PRINTER_TARGET_X = 60.5;

// ระยะยอมรับว่าถึงจุดแล้ว
const PRINTER_TARGET_TOLERANCE = 0.25;

// ความเร็วสูงสุดตอนเลื่อนเครื่องพิมพ์เข้าทางเดิน
const PRINTER_LANE_MOVE_SPEED = 4;

// ความแรงที่ใช้พาเครื่องพิมพ์ตาม Z เป้าหมายระหว่างดัน
const PRINTER_LANE_FOLLOW_STRENGTH = 12;

// ความเร็วเก็บตำแหน่ง X/Z ช่วงสุดท้าย
const PRINTER_FINAL_MOVE_SPEED = 4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function moveTowards(current: number, target: number, maxDistance: number) {
  const distance = target - current;

  if (Math.abs(distance) <= maxDistance) {
    return target;
  }

  return current + Math.sign(distance) * maxDistance;
}

function getPlacementProgress(currentX: number, startX: number) {
  const totalDistance = PRINTER_TARGET_X - startX;

  if (Math.abs(totalDistance) < 0.001) {
    return 1;
  }

  return clamp((currentX - startX) / totalDistance, 0, 1);
}

export default function WoodenCrateModel({
  position = [14, 1.35, PRINTER_STORAGE_Z],
  onPushStateChange,
  onPlaced,
}: ModelPrinterProps) {
  // ========================================
  // Wooden Crate Size
  // ========================================

  const CRATE_SCALE = 1.65;

  const CRATE_WIDTH = 1.3 * CRATE_SCALE;

  const CRATE_HEIGHT = 1.2 * CRATE_SCALE;

  const CRATE_DEPTH = 1.0 * CRATE_SCALE;

  const crateHalfExtents: [number, number, number] = [
    CRATE_WIDTH / 2,
    CRATE_HEIGHT / 2,
    CRATE_DEPTH / 2,
  ];

  const minGrabDistance = crateHalfExtents[0] + PUSH_HAND_CONTACT_DISTANCE;

  const maxGrabDistance = minGrabDistance + GRAB_DISTANCE_RANGE;

  const printerColliderHalfHeight = crateHalfExtents[1];

  const printerColliderOffsetY = 0;

  /*
   * Sensor จับอยู่ข้างตัวเครื่อง
   * ลดความสูงลงเล็กน้อยเพื่อไม่ให้ครอบผิวด้านบน
   * ที่ Player ใช้ยืน
   */
  const interactionSensorHalfHeight = Math.max(
    printerColliderHalfHeight - 0.2,
    0.1,
  );

  const interactionSensorArgs: [number, number, number] = [
    crateHalfExtents[0] + 1.5,
    interactionSensorHalfHeight,
    0.5,
  ];

  const promptOffsetY = crateHalfExtents[1] + 0.4;

  // ============================
  // Physics
  // ============================

  const bodyRef = useRef<RapierRigidBody | null>(null);

  const interactionSensorRef = useRef<RapierCollider | null>(null);

  const promptAnchorRef = useRef<THREE.Group | null>(null);

  const lastLaneOffsetZRef = useRef<number | null>(null);

  const { rapier } = useRapier();

  // Player ที่กำลังอยู่ใน Sensor
  const nearbyPlayerRef = useRef<RapierRigidBody | null>(null);

  // Player ที่กำลังจับ Printer
  const grabbedPlayerRef = useRef<RapierRigidBody | null>(null);

  // ระยะตอนเริ่มจับ
  const grabDistanceRef = useRef(1);

  // Printer อยู่ด้านไหนของ Player ตอนเริ่มจับ
  // 1 = ขวา
  // -1 = ซ้าย
  const grabSideRef = useRef<1 | -1>(1);

  // ============================
  // UI State
  // ============================

  const [isPlayerNear, setIsPlayerNear] = useState(false);

  const [isGrabbed, setIsGrabbed] = useState(false);

  const [isPlaced, setIsPlaced] = useState(false);

  /*
   * ใช้ Ref คู่กับ State
   * เพราะ keyboard / physics
   * ต้องอ่านค่าปัจจุบันทันที
   */
  const isGrabbedRef = useRef(false);

  /*
   * Player มี Collider หลายตัว
   * เลยจำ collider ที่อยู่ใน
   * Sensor ไว้ทั้งหมด
   */
  const playerColliders = useRef<Set<number>>(new Set());

  const isPlacedRef = useRef(false);

  const isPushingRef = useRef(false);

  const onPlacedRef = useRef(onPlaced);

  useEffect(() => {
    onPlacedRef.current =
      onPlaced;
  }, [onPlaced]);

  const setPushing = useCallback(
    (nextPushing: boolean) => {
      if (isPushingRef.current === nextPushing) {
        return;
      }

      isPushingRef.current = nextPushing;

      onPushStateChange?.({
        active: nextPushing,
        facingDirection: grabSideRef.current,
      });
    },
    [onPushStateChange],
  );

  useEffect(() => {
    return () => {
      setPushing(false);
    };
  }, [setPushing]);

  // ============================
  // E = Grab / Release
  // ============================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE") {
        return;
      }

      /*
       * ป้องกันการกดค้าง E
       * แล้ว browser ยิง keydown
       * ซ้ำ ๆ
       */
      if (event.repeat) {
        return;
      }

      const printer = bodyRef.current;

      if (!printer) {
        return;
      }

      // วางสำเร็จแล้ว ห้ามจับซ้ำ
      if (isPlacedRef.current) {
        return;
      }

      // ========================
      // กำลังจับอยู่
      // → กด E = ปล่อย
      // ========================

      if (isGrabbedRef.current) {
        setPushing(false);

        isGrabbedRef.current = false;

        setIsGrabbed(false);

        grabbedPlayerRef.current = null;

        if (playerColliders.current.size === 0) {
          nearbyPlayerRef.current = null;
        }

        const velocity = printer.linvel();

        /*
         * ปล่อยแล้วหยุด
         * ความเร็วแนวนอนของ Printer
         */
        printer.setLinvel(
          {
            x: 0,
            y: velocity.y,
            z: 0,
          },
          true,
        );

        return;
      }

      // ========================
      // ยังไม่ได้จับ
      // ========================

      if (playerColliders.current.size === 0) {
        return;
      }

      const player = nearbyPlayerRef.current;

      if (!player) {
        return;
      }

      const playerPosition = player.translation();

      const printerPosition = printer.translation();

      const playerVelocity = player.linvel();

      // ไม่ให้กด E จับตอนกำลังกระโดด/ตก
      if (Math.abs(playerVelocity.y) > 0.25) {
        return;
      }

      // จำว่า Printer อยู่ด้านไหนของ Player
      grabSideRef.current = printerPosition.x >= playerPosition.x ? 1 : -1;

      // ========================
      // จำระยะปัจจุบัน
      //
      // จะได้ไม่ snap ตอนกด E
      // ========================

      grabDistanceRef.current = clamp(
        Math.abs(printerPosition.x - playerPosition.x),
        minGrabDistance,
        maxGrabDistance,
      );

      grabbedPlayerRef.current = player;

      isGrabbedRef.current = true;
      setPushing(true);
      setIsGrabbed(true);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [maxGrabDistance, minGrabDistance, setPushing]);

  // ============================
  // Printer Follow Player
  // ============================

  useBeforePhysicsStep((world) => {
    const printer = bodyRef.current;

    if (!printer) {
      return;
    }

    const printerPosition = printer.translation();

    const physicsDelta = Math.min(world.timestep, 1 / 30);

    // ============================
    // 1. เครื่องพิมพ์ถูกวางเข้าจุดแล้ว
    // ============================

    if (isPlacedRef.current) {
      setPushing(false);

      const maxDistance = PRINTER_FINAL_MOVE_SPEED * physicsDelta;

      const nextX = moveTowards(
        printerPosition.x,
        PRINTER_TARGET_X,
        maxDistance,
      );

      const nextZ = moveTowards(printerPosition.z, PLAYER_LANE_Z, maxDistance);

      /*
       * Kinematic translation ทำให้ Rapier
       * รับรู้ความเร็วและการชนระหว่างทาง
       * ต่างจาก setTranslation ที่เป็นการวาร์ป
       */
      printer.setNextKinematicTranslation({
        x: nextX,
        y: printerPosition.y,
        z: nextZ,
      });

      return;
    }

    /*
     * Sensor และข้อความ E ต้องอยู่ที่ lane Z = 0
     * แม้ตัวเครื่องพิมพ์กำลังค่อย ๆ เลื่อนเข้ามา
     */
    const laneOffsetZ = PLAYER_LANE_Z - printerPosition.z;

    const previousLaneOffsetZ = lastLaneOffsetZRef.current;

    /*
     * อัปเดต Collider เฉพาะตอน
     * Printer ขยับในแกน Z จริง ๆ
     */
    if (
      previousLaneOffsetZ === null ||
      Math.abs(laneOffsetZ - previousLaneOffsetZ) > 0.001
    ) {
      interactionSensorRef.current?.setTranslationWrtParent({
        x: 0,
        y: printerColliderOffsetY,
        z: laneOffsetZ,
      });

      if (promptAnchorRef.current) {
        promptAnchorRef.current.position.z = laneOffsetZ;
      }

      lastLaneOffsetZRef.current = laneOffsetZ;
    }

    /*
     * ตรวจถึงจุดหมายก่อนเช็กสถานะจับ
     * เพื่อปิด race ที่ปล่อย E ในเฟรมเดียวกับ
     * ที่ Printer เลื่อนข้ามเส้นเป้าหมาย
     */
    const isTargetOnRight = PRINTER_TARGET_X >= position[0];

    const reachedTargetX = isTargetOnRight
      ? printerPosition.x >= PRINTER_TARGET_X - PRINTER_TARGET_TOLERANCE
      : printerPosition.x <= PRINTER_TARGET_X + PRINTER_TARGET_TOLERANCE;

    if (reachedTargetX) {
      setPushing(false);

      isPlacedRef.current = true;
      setIsPlaced(true);

      isGrabbedRef.current = false;
      setIsGrabbed(false);

      grabbedPlayerRef.current = null;
      nearbyPlayerRef.current = null;
      playerColliders.current.clear();
      setIsPlayerNear(false);

      interactionSensorRef.current?.setEnabled(false);

      onPlacedRef.current?.();

      printer.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true);

      printer.setNextKinematicTranslation(printerPosition);

      return;
    }

    // ============================
    // 2. ถ้ายังไม่ได้จับ
    //    ไม่ต้อง Follow Player
    // ============================

    if (!isGrabbedRef.current) {
      setPushing(false);
      return;
    }

    const player = grabbedPlayerRef.current;

    if (!player) {
      setPushing(false);
      return;
    }

    const playerPosition = player.translation();

    const playerVelocity = player.linvel();

    const printerVelocity = printer.linvel();

    // ============================
    // 3. ค่อย ๆ เข้า Player lane
    //    ตามระยะที่ดันจริง
    // ============================

    const placementProgress = getPlacementProgress(
      printerPosition.x,
      position[0],
    );

    // Smoothstep ลดอาการกระชากช่วงเริ่ม/จบ
    const easedProgress =
      placementProgress * placementProgress * (3 - 2 * placementProgress);

    const targetPrinterZ =
      position[2] + (PLAYER_LANE_Z - position[2]) * easedProgress;

    const targetVelocityZ = clamp(
      (targetPrinterZ - printerPosition.z) * PRINTER_LANE_FOLLOW_STRENGTH,
      -PRINTER_LANE_MOVE_SPEED,
      PRINTER_LANE_MOVE_SPEED,
    );

    // ============================
    // 4. Player <-> Printer Lock
    // ============================

    const { objectVelocityX, playerLockVelocityX } = resolvePushConstraint({
      playerX: playerPosition.x,
      playerVelocityX: playerVelocity.x,

      objectX: printerPosition.x,

      grabSide: grabSideRef.current,

      grabDistance: grabDistanceRef.current,

      followStrength: FOLLOW_STRENGTH,

      maxFollowSpeed: MAX_FOLLOW_SPEED,

      targetX: PRINTER_TARGET_X,

      targetOnRight: isTargetOnRight,

      delta: physicsDelta,
    });

    printer.setLinvel(
      {
        x: objectVelocityX,
        y: printerVelocity.y,
        z: targetVelocityZ,
      },
      true,
    );

    // ถ้า Printer ตามไม่ทัน / ติดกำแพง
    // ห้าม Player เดินแยกออกจาก Printer
    if (playerLockVelocityX !== null) {
      player.setLinvel(
        {
          x: playerLockVelocityX,
          y: playerVelocity.y,
          z: 0,
        },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      name="model-printer"
      type={isPlaced ? "kinematicPosition" : "dynamic"}
      position={position}
      enabledTranslations={[true, true, true]}
      enabledRotations={[false, false, false]}
      ccd={isGrabbed}
      canSleep
      colliders={false}
    >
      {/* ========================
    Wooden Crate Visual
======================== */}

      <WoodenCrate
        width={CRATE_WIDTH}
        height={CRATE_HEIGHT}
        depth={CRATE_DEPTH}
      />

      {/* ========================
                Printer Physics Collider
            ======================== */}

      <CuboidCollider
        args={[
          crateHalfExtents[0],
          printerColliderHalfHeight,
          crateHalfExtents[2],
        ]}
        position={[0, printerColliderOffsetY, 0]}
        friction={1}
        restitution={0}
      />

      {/* ========================
          Interaction Sensor

          Sensor รักษาตำแหน่งโลกไว้ที่ Z = 0
          ซึ่งเป็น lane ของ Player
      ======================== */}

      <CuboidCollider
        ref={interactionSensorRef}
        args={interactionSensorArgs}
        position={[0, printerColliderOffsetY, PLAYER_LANE_Z - position[2]]}
        sensor
        density={0}
        onIntersectionEnter={({ other }) => {
          if (isPlacedRef.current) {
            return;
          }

          if (other.rigidBodyObject?.name !== "player") {
            return;
          }

          playerColliders.current.add(other.collider.handle);

          if (other.rigidBody) {
            nearbyPlayerRef.current = other.rigidBody;
          }

          setIsPlayerNear(true);
        }}
        onIntersectionExit={({ other }) => {
          if (isPlacedRef.current) {
            return;
          }

          if (other.rigidBodyObject?.name !== "player") {
            return;
          }

          playerColliders.current.delete(other.collider.handle);

          if (playerColliders.current.size === 0) {
            setIsPlayerNear(false);

            if (!isGrabbedRef.current) {
              nearbyPlayerRef.current = null;
            }
          }
        }}
      />

      {/* ========================
          UI
      ======================== */}

      {/* ========================
    UI
======================== */}

      <group
        ref={promptAnchorRef}
        position={[0, promptOffsetY, PLAYER_LANE_Z - position[2]]}
        visible={!isPlaced && isPlayerNear && !isGrabbed}
      >
        <Html center>
          <div
            style={{
              opacity: !isPlaced && isPlayerNear && !isGrabbed ? 1 : 0,

              pointerEvents: "none",
            }}
            className="
                whitespace-nowrap
                rounded-md
                bg-black/80
                px-3
                py-2
                text-sm
                text-white
                select-none
            "
          >
            <span className="font-bold">E</span>
          </div>
        </Html>
      </group>
    </RigidBody>
  );
}
