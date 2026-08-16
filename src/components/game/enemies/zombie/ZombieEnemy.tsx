"use client";

import { useRef, useState } from "react";

import { useFrame } from "@react-three/fiber";

import {
  BallCollider,
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";

import ZombieModel, { type ZombieAnimationState } from "./ZombieModel";

import {
  ZOMBIE_ATTACK_DAMAGE,
  ZOMBIE_ATTACK_HIT_RATIO,
  ZOMBIE_ATTACK_RANGE,
  ZOMBIE_COLLIDER_HALF_HEIGHT,
  ZOMBIE_COLLIDER_RADIUS,
  ZOMBIE_CRAWLER_COLLIDER_HALF_HEIGHT,
  ZOMBIE_CRAWLER_COLLIDER_RADIUS,
  ZOMBIE_CRAWL_SPEED,
  ZOMBIE_DETECTION_RADIUS,
  ZOMBIE_RUN_SPEED,
  ZOMBIE_WALK_SPEED,
  ZOMBIE_ATTACK_DURATION,
} from "./zombieConfig";

// ========================================
// Types
// ========================================

type Vector3Tuple = [number, number, number];

type ZombieVariant = "normal" | "crawler";

type ZombieEnemyProps = {
  position: Vector3Tuple;

  patrolDistance?: number;

  variant?: ZombieVariant;

  onAttackHit?: (damage: number) => void;
};

// ========================================
// Zombie Enemy
// ========================================

export default function ZombieEnemy({
  position,

  patrolDistance = 4,

  variant = "normal",

  onAttackHit,
}: ZombieEnemyProps) {
  const bodyRef = useRef<RapierRigidBody>(null);

  const playerBodyRef = useRef<RapierRigidBody | null>(null);

  const spawnXRef = useRef(position[0]);

  const patrolDirectionRef = useRef<1 | -1>(1);

  const alertedRef = useRef(false);

  const screamTimerRef = useRef(0);

  const attackTimerRef = useRef(0);

  const attackHitRef = useRef(false);

  const [direction, setDirection] = useState<1 | -1>(1);

  const [animation, setAnimation] = useState<ZombieAnimationState>(
    variant === "crawler" ? "crawl" : "walk",
  );

  /*
   * ใช้ restart animation
   * โดยเฉพาะ Attack ที่เล่นซ้ำ
   */
  const [animationKey, setAnimationKey] = useState(0);

  // ========================================
  // Animation Change
  // ========================================

  function changeAnimation(
    next: ZombieAnimationState,

    restart = false,
  ) {
    setAnimation((current) => {
      if (current === next) {
        if (restart) {
          setAnimationKey((key) => key + 1);
        }

        return current;
      }

      return next;
    });
  }

  // ========================================
  // Enemy AI
  // ========================================

  useFrame((_, delta) => {
    const body = bodyRef.current;

    if (!body) {
      return;
    }

    const safeDelta = Math.min(delta, 0.1);

    const position = body.translation();

    const velocity = body.linvel();

    // =================================
    // SCREAM
    // =================================

    if (animation === "scream") {
      screamTimerRef.current += safeDelta;

      body.setLinvel(
        {
          x: 0,
          y: velocity.y,
          z: 0,
        },
        true,
      );

      /*
       * ตอนนี้ใช้ประมาณ
       * 1.2 วินาทีก่อน
       *
       * ถ้า Animation ร้อง
       * ยาว/สั้นกว่านี้
       * ค่อยปรับได้
       */
      if (screamTimerRef.current >= 1.2) {
        screamTimerRef.current = 0;

        changeAnimation(variant === "crawler" ? "crawl" : "run");
      }

      return;
    }

    const playerBody = playerBodyRef.current;

    // =================================
    // Player ถูกตรวจพบแล้ว
    // =================================

    if (alertedRef.current && playerBody) {
      const playerPosition = playerBody.translation();

      const deltaX = playerPosition.x - position.x;

      const distanceX = Math.abs(deltaX);

      const nextDirection: 1 | -1 = deltaX >= 0 ? 1 : -1;

      setDirection(nextDirection);

      // =============================
      // ATTACK
      // =============================

      if (animation === "attack") {
        body.setLinvel(
          {
            x: 0,
            y: velocity.y,
            z: 0,
          },
          true,
        );

        attackTimerRef.current += safeDelta;

        const attackDuration = ZOMBIE_ATTACK_DURATION;

        const hitTime = attackDuration * ZOMBIE_ATTACK_HIT_RATIO;

        if (!attackHitRef.current && attackTimerRef.current >= hitTime) {
          attackHitRef.current = true;

          /*
           * เช็กอีกทีตอนมือ Zombie
           * ฟาดจริง
           */
          if (distanceX <= ZOMBIE_ATTACK_RANGE + 0.35) {
            onAttackHit?.(ZOMBIE_ATTACK_DAMAGE);
          }
        }

        if (attackTimerRef.current >= attackDuration) {
          attackTimerRef.current = 0;

          attackHitRef.current = false;

          if (distanceX <= ZOMBIE_ATTACK_RANGE) {
            changeAnimation("attack", true);
          } else {
            changeAnimation(variant === "crawler" ? "crawl" : "run");
          }
        }

        return;
      }

      // =============================
      // เริ่ม Attack
      // =============================

      if (distanceX <= ZOMBIE_ATTACK_RANGE) {
        body.setLinvel(
          {
            x: 0,
            y: velocity.y,
            z: 0,
          },
          true,
        );

        attackTimerRef.current = 0;

        attackHitRef.current = false;

        changeAnimation("attack", true);

        return;
      }

      // =============================
      // CHASE
      // =============================

      const chaseSpeed =
        variant === "crawler" ? ZOMBIE_CRAWL_SPEED : ZOMBIE_RUN_SPEED;

      body.setLinvel(
        {
          x: nextDirection * chaseSpeed,

          y: velocity.y,

          z: 0,
        },
        true,
      );

      changeAnimation(variant === "crawler" ? "crawl" : "run");

      return;
    }

    // =================================
    // PATROL
    // =================================

    const patrolMinX = spawnXRef.current - patrolDistance;

    const patrolMaxX = spawnXRef.current + patrolDistance;

    if (position.x >= patrolMaxX) {
      patrolDirectionRef.current = -1;
    }

    if (position.x <= patrolMinX) {
      patrolDirectionRef.current = 1;
    }

    const patrolDirection = patrolDirectionRef.current;

    setDirection(patrolDirection);

    const patrolSpeed =
      variant === "crawler" ? ZOMBIE_CRAWL_SPEED : ZOMBIE_WALK_SPEED;

    body.setLinvel(
      {
        x: patrolDirection * patrolSpeed,

        y: velocity.y,

        z: 0,
      },
      true,
    );

    changeAnimation(variant === "crawler" ? "crawl" : "walk");
  });

  return (
    <RigidBody
      ref={bodyRef}
      name="zombie"
      position={position}
      colliders={false}
      lockRotations
      ccd
      linearDamping={0.5}
    >
      {/* =================================
                Zombie Physical Body
            ================================= */}

      <CapsuleCollider
        args={[
          variant === "crawler"
            ? ZOMBIE_CRAWLER_COLLIDER_HALF_HEIGHT
            : ZOMBIE_COLLIDER_HALF_HEIGHT,
          variant === "crawler"
            ? ZOMBIE_CRAWLER_COLLIDER_RADIUS
            : ZOMBIE_COLLIDER_RADIUS,
        ]}
        friction={0.8}
      />

      {/* =================================
                Player Detection
            ================================= */}

      <BallCollider
        sensor
        args={[ZOMBIE_DETECTION_RADIUS]}
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name !== "player") {
            return;
          }

          if (!other.rigidBody) {
            return;
          }

          playerBodyRef.current = other.rigidBody;

          /*
           * เจอครั้งแรก
           */
          if (!alertedRef.current) {
            alertedRef.current = true;

            screamTimerRef.current = 0;

            changeAnimation("scream", true);
          }
        }}
      />

      {/* =================================
                Visual
            ================================= */}

      <ZombieModel
        animation={animation}
        animationKey={animationKey}
        direction={direction}
        variant={variant}
      />
    </RigidBody>
  );
}
