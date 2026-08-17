"use client";

import { useEffect, useRef, useState } from "react";

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
// Config
// ========================================

const ZOMBIE_SCREAM_DURATION = 1.2;

const ZOMBIE_SCREAM_VOLUME = 0.65;

/*
 * Crawler ต้องเข้ามาใกล้จริง ๆ
 * ถึงจะสร้าง Damage
 */
const CRAWLER_CONTACT_RANGE = ZOMBIE_CRAWLER_COLLIDER_RADIUS + 0.65;

const CRAWLER_DAMAGE_COOLDOWN = 0.8;

// ========================================
// Zombie Enemy
// ========================================

export default function ZombieEnemy({
  position,

  patrolDistance = 4,

  variant = "normal",

  onAttackHit,
}: ZombieEnemyProps) {
  // ========================================
  // Physics refs
  // ========================================

  const bodyRef = useRef<RapierRigidBody>(null);

  const playerBodyRef = useRef<RapierRigidBody | null>(null);

  // ========================================
  // AI refs
  // ========================================

  const spawnXRef = useRef(position[0]);

  const patrolDirectionRef = useRef<1 | -1>(1);

  const alertedRef = useRef(false);

  const screamingRef = useRef(false);

  const screamTimerRef = useRef(0);

  const attackTimerRef = useRef(0);

  const attackHitRef = useRef(false);

  const crawlerHitCooldownRef = useRef(0);

  // ========================================
  // Audio refs
  // ========================================

  const screamAudioRef = useRef<HTMLAudioElement | null>(null);

  const crawlerScreamAudioRef = useRef<HTMLAudioElement | null>(null);

  /*
   * ค่า fallback ถ้า browser
   * ยังอ่านความยาวไฟล์เสียงไม่ได้
   */
  const screamDurationRef = useRef(1.2);

  // ========================================
  // Direction
  // ========================================

  const [direction, setDirection] = useState<1 | -1>(1);

  const directionRef = useRef<1 | -1>(1);

  // ========================================
  // Animation
  // ========================================

  const initialAnimation: ZombieAnimationState =
    variant === "crawler" ? "crawl" : "walk";

  const [animation, setAnimation] =
    useState<ZombieAnimationState>(initialAnimation);

  /*
   * เก็บ animation จริงใน ref
   *
   * useFrame อ่านได้ทันที
   * ไม่ต้องรอ React render
   */
  const animationRef = useRef<ZombieAnimationState>(initialAnimation);

  /*
   * ใช้ restart animation
   * เช่น Attack ซ้ำ
   */
  const [animationKey, setAnimationKey] = useState(0);

  // ========================================
  // Scream Audio
  // ========================================

  useEffect(() => {
    // =====================================
    // Normal Zombie Scream
    // =====================================

    const normalAudio = new Audio("/sounds/zombie/scream.mp3");

    normalAudio.preload = "auto";

    normalAudio.volume = 0.65;

    /*
     * อ่านความยาวไฟล์เสียงจริง
     * แล้วใช้เป็นเวลาที่ Zombie
     * ต้องยืน Scream
     */
    function handleMetadata() {
      if (Number.isFinite(normalAudio.duration) && normalAudio.duration > 0) {
        screamDurationRef.current = normalAudio.duration;
      }
    }

    normalAudio.addEventListener("loadedmetadata", handleMetadata);

    screamAudioRef.current = normalAudio;

    // =====================================
    // Crawler Scream
    // =====================================

    const crawlerAudio = new Audio("/sounds/zombie/crawler-scream.mp3");

    crawlerAudio.preload = "auto";

    crawlerAudio.volume = 0.6;

    crawlerScreamAudioRef.current = crawlerAudio;

    return () => {
      normalAudio.removeEventListener("loadedmetadata", handleMetadata);

      normalAudio.pause();

      crawlerAudio.pause();

      normalAudio.currentTime = 0;

      crawlerAudio.currentTime = 0;

      screamAudioRef.current = null;

      crawlerScreamAudioRef.current = null;
    };
  }, []);

  function playScreamSound() {
    const audio = screamAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();

    audio.currentTime = 0;

    audio.play().catch(() => {
      /*
       * ถ้า browser block audio
       * ไม่ให้เกม crash
       */
    });
  }

  function playCrawlerScreamSound() {
    const audio = crawlerScreamAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();

    audio.currentTime = 0;

    audio.play().catch(() => {});
  }

  // ========================================
  // Direction Change
  // ========================================

  function changeDirection(next: 1 | -1) {
    if (directionRef.current === next) {
      return;
    }

    directionRef.current = next;

    setDirection(next);
  }

  // ========================================
  // Animation Change
  // ========================================

  function changeAnimation(
    next: ZombieAnimationState,

    restart = false,
  ) {
    const current = animationRef.current;

    /*
     * Animation เดิม
     */
    if (current === next) {
      if (restart) {
        setAnimationKey((key) => key + 1);
      }

      return;
    }

    /*
     * เปลี่ยน ref ทันที
     * ก่อน React state
     */
    animationRef.current = next;

    setAnimation(next);

    if (restart) {
      setAnimationKey((key) => key + 1);
    }
  }

  // ========================================
  // Start Scream
  // ========================================

  function startScream() {
    /*
     * Crawler ไม่ร้อง
     */
    if (variant === "crawler") {
      return;
    }

    screamingRef.current = true;

    screamTimerRef.current = 0;

    changeAnimation("scream", true);

    playScreamSound();
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

    const bodyPosition = body.translation();

    const velocity = body.linvel();

    // =====================================
    // Cooldowns
    // =====================================

    crawlerHitCooldownRef.current = Math.max(
      0,

      crawlerHitCooldownRef.current - safeDelta,
    );

    // =====================================
    // NORMAL ZOMBIE SCREAM
    // =====================================

    if (screamingRef.current) {
      screamTimerRef.current += safeDelta;

      /*
       * หยุดนิ่งตอน Scream
       */
      body.setLinvel(
        {
          x: 0,

          y: velocity.y,

          z: 0,
        },
        true,
      );

      if (screamTimerRef.current < screamDurationRef.current) {
        return;
      }

      screamTimerRef.current = 0;

      screamingRef.current = false;

      changeAnimation("run");

      return;
    }

    const playerBody = playerBodyRef.current;

    // =====================================
    // PLAYER DETECTED
    // =====================================

    if (alertedRef.current && playerBody) {
      const playerPosition = playerBody.translation();

      const deltaX = playerPosition.x - bodyPosition.x;

      const distanceX = Math.abs(deltaX);

      const nextDirection: 1 | -1 = deltaX >= 0 ? 1 : -1;

      changeDirection(nextDirection);

      // ===================================
      // CRAWLER
      // ===================================

      if (variant === "crawler") {
        /*
         * คลานไล่ตลอด
         * ไม่เข้า Attack animation
         */
        changeAnimation("crawl");

        body.setLinvel(
          {
            x: nextDirection * ZOMBIE_CRAWL_SPEED,

            y: velocity.y,

            z: 0,
          },
          true,
        );

        /*
         * คลานมาชนตัว Player
         * แล้วลดเลือด
         */
        if (
          distanceX <= CRAWLER_CONTACT_RANGE &&
          crawlerHitCooldownRef.current <= 0
        ) {
          crawlerHitCooldownRef.current = CRAWLER_DAMAGE_COOLDOWN;

          onAttackHit?.(ZOMBIE_ATTACK_DAMAGE);
        }

        return;
      }

      // ===================================
      // NORMAL ZOMBIE ATTACK
      // ===================================

      if (animationRef.current === "attack") {
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

        /*
         * Damage ตอน animation
         * ถึงจังหวะโจมตี
         */
        if (!attackHitRef.current && attackTimerRef.current >= hitTime) {
          attackHitRef.current = true;

          if (distanceX <= ZOMBIE_ATTACK_RANGE + 0.35) {
            onAttackHit?.(ZOMBIE_ATTACK_DAMAGE);
          }
        }

        /*
         * Attack จบ
         */
        if (attackTimerRef.current >= attackDuration) {
          attackTimerRef.current = 0;

          attackHitRef.current = false;

          if (distanceX <= ZOMBIE_ATTACK_RANGE) {
            changeAnimation("attack", true);
          } else {
            changeAnimation("run");
          }
        }

        return;
      }

      // ===================================
      // START NORMAL ATTACK
      // ===================================

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

      // ===================================
      // NORMAL CHASE
      // ===================================

      body.setLinvel(
        {
          x: nextDirection * ZOMBIE_RUN_SPEED,

          y: velocity.y,

          z: 0,
        },
        true,
      );

      changeAnimation("run");

      return;
    }

    // =====================================
    // PATROL
    // =====================================

    const patrolMinX = spawnXRef.current - patrolDistance;

    const patrolMaxX = spawnXRef.current + patrolDistance;

    if (bodyPosition.x >= patrolMaxX) {
      patrolDirectionRef.current = -1;
    }

    if (bodyPosition.x <= patrolMinX) {
      patrolDirectionRef.current = 1;
    }

    const patrolDirection = patrolDirectionRef.current;

    changeDirection(patrolDirection);

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

          /*
           * จำ Player ไว้
           */
          playerBodyRef.current = other.rigidBody;

          /*
           * เคยเจอแล้ว
           * ไม่ trigger รอบใหม่
           */
          if (alertedRef.current) {
            return;
          }

          alertedRef.current = true;

          // =============================
          // CRAWLER
          // =============================

          if (variant === "crawler") {
            /*
             * ร้องเสียงตอนเห็น Player
             * แต่ยังใช้ animation Crawl
             */
            playCrawlerScreamSound();

            changeAnimation("crawl");

            return;
          }

          // =============================
          // NORMAL ZOMBIE
          // =============================

          startScream();
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
