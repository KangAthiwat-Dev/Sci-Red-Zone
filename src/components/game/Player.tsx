"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    useFrame,
    useThree,
} from "@react-three/fiber";
import {
    CapsuleCollider,
    CuboidCollider,
    RigidBody,
    useAfterPhysicsStep,
    useRapier,
    type RapierCollider,
    type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";

import RunDustEffect from "./effects/RunDustEffect";
import SpeedLinesEffect from "./effects/SpeedLinesEffect";
import type { PlayerEffectSnapshot } from "./effects/playerEffectTypes";
import PlayerModel, {
    PLAYER_MODEL_SCALE,
    type PlayerAnimation,
} from "./PlayerModel";

// ==============================
// Movement
// ==============================

const JOG_SPEED = 8.5;
const RUN_SPEED = 14.5;
const CROUCH_SPEED = 2.5;

const JUMP_SPEED = 8.5;
const TAKEOFF_GROUND_IGNORE_VELOCITY = 1;
// เริ่ม Landing ก่อนเท้าแตะพื้นกี่หน่วย
const LAND_PREP_DISTANCE = 0;
// ระยะจากจุดกึ่งกลาง RigidBody ถึงเท้า
const PLAYER_FOOT_OFFSET = 0.9;
// Landing เริ่มเล่นที่วินาที 0.5 ใน PlayerModel
const LAND_DURATION = 1.0833333 - 0.5;
const HARD_LANDING_DURATION = 2.0166667;

/*
 * Falling ใช้เฉพาะการเดินตกจากที่สูง
 * Jump / RunningJump และการตกต่างระดับต่ำจะใช้ท่าเดิมต่อไป
 */
const HIGH_FALL_MIN_CLEARANCE = 2.25;
const HIGH_FALL_START_VELOCITY = -1.5;

// Sprint -> Slide
const SLIDE_MIN_ENTRY_SPEED = 7;
// ให้การกด Slide ทันทีหลังเริ่ม Sprint ยังมีแรงส่งชัดเจน
// แต่ถ้าวิ่งมาเร็วกว่านี้จะเก็บ Momentum ที่สูงกว่าไว้ทั้งหมด
const SLIDE_MIN_INITIAL_SPEED = 20.5;
// ค่าสัมประสิทธิ์แรงเสียดทานแบบ exponential (ยิ่งต่ำยิ่งไกล)
const SLIDE_DRAG = 0.1;
const SLIDE_DURATION = 0.95;
const SLIDE_BLOCKED_SPEED = 0.2;

const JUMP_HANG_DURATION = 0.45;
const HANG_DROP_DURATION = 0.65;
const RUN_JUMP_UP_DURATION = 0.8;

// Grounded one-shot animation durations จาก student.glb
const CROUCHED_STANDING_DURATION = 0.65;
const CROUCHED_SPINTING_DURATION = 0.5166667;
const RUN_STOP_DURATION = 0.9166667;

/*
 * เว้นช่วงสั้น ๆ ก่อน RunStop เพื่อไม่ให้ปุ่มที่ปล่อยเพียงชั่วครู่
 * ถูกตีความเป็นการหยุดจริง
 */
const RUN_STOP_INPUT_GRACE = 0.12;

/*
 * คง inertia ตอนกลับทิศไว้โดยเบรก velocity เดิมถึงศูนย์ก่อน
 * แล้วจึงให้ acceleration ปกติเร่งไปทิศใหม่
 */
const REVERSE_BRAKE_ACCELERATION = 45;

function moveTowards(
    current: number,
    target: number,
    maxDelta: number,
) {
    const delta = target - current;

    if (Math.abs(delta) <= maxDelta) {
        return target;
    }

    return (
        current +
        Math.sign(delta) * maxDelta
    );
}

// ==============================
// Camera
// ==============================

// กล้องห่างจากฉากแค่ไหน
const CAMERA_DISTANCE = 13;

// ความสูงกล้องเหนือ Player
const CAMERA_HEIGHT = 3.5;

// กล้องมองสูงกว่าจุดกลาง Player เล็กน้อย
const CAMERA_TARGET_HEIGHT = 3;

// มองล่วงหน้าตอนเดิน
const WALK_LOOK_AHEAD = 1.2;

// มองล่วงหน้าเพิ่มตอนวิ่ง
const RUN_LOOK_AHEAD = 2;

// ความเร็วในการตาม Player
const CAMERA_FOLLOW_SPEED = 4;

// ความเร็วตอนเปลี่ยน Look Ahead
const LOOK_AHEAD_SPEED = 5;

// Y ใช้ช้ากว่า X
// เพื่อไม่ให้กล้องเด้งตาม Jump แบบแข็ง ๆ
const CAMERA_VERTICAL_SPEED = 2.5;

// ==============================
// Ledge / Hang
// ==============================

// Ray ยิงไปข้างหน้าไกลเท่าไร
const LEDGE_FORWARD_DISTANCE = 0.85;

// Ray ล่าง เอาไว้หา "กำแพง"
const LEDGE_LOWER_RAY_Y = 0.2;

// Ray บน ต้องไม่เจอกำแพง
const LEDGE_UPPER_RAY_Y = 1.0;

// จุดเริ่มยิง Ray ลงหาพื้นด้านบน
const LEDGE_TOP_RAY_Y = 1.4;

const LEDGE_TOP_RAY_DISTANCE = 1.7;

// Player ห่างจากผนังตอนห้อย
const HANG_DISTANCE_FROM_WALL = 0.1;

// Body อยู่ต่ำกว่าขอบเท่าไรตอน Hang
const HANG_BODY_BELOW_LEDGE = 0.79;

// กันปล่อยขอบแล้วจับกลับทันที
const LEDGE_REGRAB_COOLDOWN = 0.3;

// ==============================
// Climb
// ==============================

// ให้การขยับ Body จบพร้อมคลิป Climb
// ตรงกับความยาวจริงของ BracedHangCrouch เพื่อไม่ยืดท่าปีนจนช้า
const CLIMB_DURATION = 1.15;

// ปีนเข้าไปด้านบน Platform เท่าไร
const CLIMB_FORWARD_DISTANCE = 0.65;

// ==============================
// Standing Collider
// ==============================

// Collider เดิมจูนกับ Model scale 1.2
const BASE_PLAYER_MODEL_SCALE = 1.2;

const PLAYER_COLLIDER_HEIGHT_SCALE =
    PLAYER_MODEL_SCALE /
    BASE_PLAYER_MODEL_SCALE;

/*
 * คงรัศมีเดิม เพื่อไม่เปลี่ยนระยะชนกำแพง กล่อง
 * และตำแหน่ง Hang ในแนวนอน
 */
const PLAYER_RADIUS = 0.35;

/*
 * พื้นต้องออกแรงพยุง Player ขึ้นอย่างน้อยประมาณ 60 องศา
 * เพื่อไม่ให้นับการชนด้านข้างของกำแพงว่าเป็น Grounded
 */
const MIN_GROUND_SUPPORT_NORMAL_Y = 0.5;
const GROUND_SUPPORT_RAY_MARGIN = 0.03;

const STANDING_HALF_HEIGHT =
    (0.55 + PLAYER_RADIUS) *
        PLAYER_COLLIDER_HEIGHT_SCALE -
    PLAYER_RADIUS;

/*
 * ขยาย Collider ขึ้นด้านบน โดยคงขอบล่างไว้ที่
 * PLAYER_FOOT_OFFSET เดิม เพื่อไม่ให้ตัวละครลอยจากพื้น
 */
const STANDING_COLLIDER_OFFSET_Y =
    STANDING_HALF_HEIGHT +
    PLAYER_RADIUS -
    PLAYER_FOOT_OFFSET;

/*
 * ระยะจากจุดกลาง RigidBody ถึงก้น Standing Capsule/เท้า
 * ใช้กำหนดตำแหน่งจบ climb จาก geometry จริงแทนเลขชดเชย hardcode
 */
const STANDING_BODY_TO_FOOT =
    STANDING_HALF_HEIGHT +
    PLAYER_RADIUS -
    STANDING_COLLIDER_OFFSET_Y;

// ==============================
// Crouching Collider
// ==============================

/*
 * ช่องย่อของ Map สูงประมาณ 1.35
 * จึงเผื่อระยะไว้ 0.05 เพื่อให้ลอดได้โดยไม่พึ่ง solver tolerance
 */
const CROUCHING_MAX_TOTAL_HEIGHT = 1.3;

const SCALED_CROUCHING_TOTAL_HEIGHT =
    (0.2 + PLAYER_RADIUS) *
    2 *
    PLAYER_COLLIDER_HEIGHT_SCALE;

const CROUCHING_TOTAL_HEIGHT =
    Math.min(
        SCALED_CROUCHING_TOTAL_HEIGHT,
        CROUCHING_MAX_TOTAL_HEIGHT,
    );

const CROUCHING_HALF_HEIGHT =
    CROUCHING_TOTAL_HEIGHT / 2 -
    PLAYER_RADIUS;

/*
 * ตอนย่อ เราไม่อยากให้ก้น Capsule ลอยขึ้น
 *
 * เลยขยับ Collider ลง
 *
 * คำนวณตำแหน่งแยกจาก Standing เพื่อให้ขอบล่าง
 * ของ Collider ทั้งสองตรงกันที่ -PLAYER_FOOT_OFFSET
 */
const CROUCH_COLLIDER_OFFSET_Y =
    CROUCHING_HALF_HEIGHT +
    PLAYER_RADIUS -
    PLAYER_FOOT_OFFSET;

const STANDING_COLLIDER_TOP_Y =
    STANDING_COLLIDER_OFFSET_Y +
    STANDING_HALF_HEIGHT +
    PLAYER_RADIUS;

/*
 * ถ้าขอบไม่สูงเกิน Standing Collider มากกว่า 0.25 หน่วย
 * ใช้ RunJumpUp ข้ามขึ้นไปโดยไม่เข้าสถานะ Hang
 */
const RUN_JUMP_UP_MAX_LEDGE_HEIGHT =
    STANDING_COLLIDER_TOP_Y +
    PLAYER_FOOT_OFFSET +
    0.25;

const CROUCH_COLLIDER_TOP_Y =
    CROUCH_COLLIDER_OFFSET_Y +
    CROUCHING_HALF_HEIGHT +
    PLAYER_RADIUS;

const CEILING_SENSOR_MARGIN =
    0.05 * PLAYER_COLLIDER_HEIGHT_SCALE;

const CEILING_SENSOR_BOTTOM_Y =
    CROUCH_COLLIDER_TOP_Y +
    CEILING_SENSOR_MARGIN;

const CEILING_SENSOR_TOP_Y =
    STANDING_COLLIDER_TOP_Y -
    CEILING_SENSOR_MARGIN;

const CEILING_SENSOR_HALF_HEIGHT =
    (CEILING_SENSOR_TOP_Y -
        CEILING_SENSOR_BOTTOM_Y) /
    2;

const CEILING_SENSOR_OFFSET_Y =
    (CEILING_SENSOR_TOP_Y +
        CEILING_SENSOR_BOTTOM_Y) /
    2;

const CEILING_SENSOR_HALF_WIDTH = PLAYER_RADIUS;

const INACTIVE_COLLISION_GROUPS = 0;

// ==============================
// Keyboard
// ==============================

type KeyboardState = {
    left: boolean;
    right: boolean;
    run: boolean;
    crouch: boolean;
};

type GroundTransition =
    | "CrouchedSpinting"
    | "CrouchedStanding"
    | "RunStop";

const GROUND_TRANSITION_DURATIONS: Record<
    GroundTransition,
    number
> = {
    CrouchedSpinting:
        CROUCHED_SPINTING_DURATION,
    CrouchedStanding:
        CROUCHED_STANDING_DURATION,
    RunStop: RUN_STOP_DURATION,
};

type PlayerProps = {
    isPushing?: boolean;
};

export default function Player({
    isPushing = false,
}: PlayerProps) {
    const { camera } = useThree();

    const { world, rapier } = useRapier();

    const cameraLookAhead = useRef(0);

    const cameraInitialized = useRef(false);

    const desiredCameraPosition =
        useRef(new THREE.Vector3());

    const desiredCameraTarget =
        useRef(new THREE.Vector3());

    const currentCameraTarget =
        useRef(new THREE.Vector3());

    const bodyRef =
        useRef<RapierRigidBody>(null);

    const standingColliderRef =
        useRef<RapierCollider>(null);

    const crouchingColliderRef =
        useRef<RapierCollider>(null);

    const visualRef =
        useRef<THREE.Group>(null);

    const playerEffectState =
        useRef<PlayerEffectSnapshot>({
            x: -10,
            footY: 2.1,
            z: 0,
            velocityX: 0,
            grounded: false,
            enabled: false,
            locomotionActive: false,
        });

    // ==============================
    // Player State
    // ==============================

    const groundContacts = useRef(0);

    /*
     * Grounded ที่คำนวณจาก Contact จริง
     * ใช้กับ Jump และ Animation โดยไม่เปลี่ยนระบบ Hang เดิม
     */
    const stableGrounded = useRef(false);

    /*
     * Sensor บริเวณเหนือหัว
     *
     * ถ้า > 0 แสดงว่ามีเพดาน
     * จึงยังลุกไม่ได้
     */
    const ceilingContacts = useRef(0);

    const jumpQueued = useRef(false);

    const isCrouching = useRef(false);

    const crouchPressed = useRef(false);
    const crouchKeysDown =
        useRef(new Set<string>());
    const manualCrouchActive =
        useRef(false);
    const standFromManualCrouchQueued =
        useRef(false);
    const crouchSprintOverride =
        useRef(false);
    const isSliding = useRef(false);
    const slideTimer = useRef(0);
    const slideDirection =
        useRef<1 | -1>(1);

    /*
 * ใช้ตรวจ transition:
 *
 * airborne -> grounded
 *
 * เพื่อรู้ว่า "เพิ่งลงถึงพื้น"
 */
    const wasGrounded = useRef(true);

    /*
 * true = airborne เพราะกด Space
 * false = airborne เพราะเดินตกขอบ
 */
    const didJump = useRef(false);

    /*
     * ล็อกไว้ตั้งแต่ตรวจพบว่าเป็นเหวสูง
     * จนกว่าจะกลับมา Grounded / Hang / Climb
     */
    const highFallActive = useRef(false);

    const lastGroundFootY = useRef(0);

    /*
     * จำว่าตอนกระโดดเริ่มจากการวิ่งหรือไม่
     *
     * true  = RunJump
     * false = Jump
     */
    const jumpStartedRunning = useRef(false);

    /*
     * Landing state
     */
    const landingTimer = useRef(0);
    const landingAnimation =
        useRef<"Landing" | "HardLanding">(
            "Landing",
        );

    // ==============================
    // Ledge State
    // ==============================

    // ตัวละครหันไปทางไหน
    // 1 = ขวา
    // -1 = ซ้าย
    const facingDirection =
        useRef<1 | -1>(1);

    // กำลังห้อยขอบหรือไม่
    const isHanging =
        useRef(false);

    // ตำแหน่งที่ต้องค้างตอน Hang
    const hangPosition =
        useRef({
            x: 0,
            y: 0,
            z: 0,
        });

    // กดลงเพื่อปล่อยขอบ
    const dropFromLedgeQueued =
        useRef(false);

    const isEnteringHang = useRef(false);
    const hangEntryTimer = useRef(0);

    const isHangDropping = useRef(false);
    const hangDropTimer = useRef(0);

    // ป้องกันปล่อยแล้วคว้าซ้ำทันที
    const ledgeGrabCooldown =
        useRef(0);

    // ==============================
    // Climb State
    // ==============================

    const isClimbing =
        useRef(false);

    const climbQueued =
        useRef(false);

    const climbTimer =
        useRef(0);

    // จุดขอบด้านบนที่ Ray ตรวจเจอ
    const ledgeTopPosition =
        useRef({
            x: 0,
            y: 0,
            z: 0,
        });

    // จุดเริ่มปีน
    const climbStartPosition =
        useRef({
            x: 0,
            y: 0,
            z: 0,
        });

    // จุดที่ยกตัวขึ้นเหนือขอบ
    const climbUpPosition =
        useRef({
            x: 0,
            y: 0,
            z: 0,
        });

    // จุดสุดท้ายที่ยืนบน Platform
    const climbEndPosition =
        useRef({
            x: 0,
            y: 0,
            z: 0,
        });

    const isRunJumpingUp = useRef(false);
    const runJumpUpTimer = useRef(0);

    const runJumpUpStartPosition =
        useRef({ x: 0, y: 0, z: 0 });

    const runJumpUpTopPosition =
        useRef({ x: 0, y: 0, z: 0 });

    const runJumpUpEndPosition =
        useRef({ x: 0, y: 0, z: 0 });

    const setCrouchingColliderRef =
        useCallback((collider: RapierCollider | null) => {
            crouchingColliderRef.current = collider;

            if (!collider) {
                return;
            }

            if (isCrouching.current) {
                collider.setEnabled(true);
            } else {
                collider.setCollisionGroups(
                    INACTIVE_COLLISION_GROUPS,
                );
                collider.setEnabled(false);
            }
        }, []);


    const keys = useRef<KeyboardState>({
        left: false,
        right: false,
        run: false,
        crouch: false,
    });

    const [
        animation,
        setAnimation,
    ] = useState<PlayerAnimation>(
        "Idle",
    );

    const currentAnimation =
        useRef<PlayerAnimation>("Idle");

    const groundTransition =
        useRef<GroundTransition | null>(
            null,
        );

    const groundTransitionTimer =
        useRef(0);

    const groundTransitionStartedThisFrame =
        useRef(false);

    const runStopInputTimer =
        useRef(0);

    function changeAnimation(
        nextAnimation: PlayerAnimation,
    ) {
        if (
            currentAnimation.current ===
            nextAnimation
        ) {
            return;
        }

        currentAnimation.current =
            nextAnimation;

        setAnimation(nextAnimation);
    }

    function startGroundTransition(
        nextTransition: GroundTransition,
    ) {
        if (
            groundTransition.current ===
            nextTransition
        ) {
            return;
        }

        groundTransition.current =
            nextTransition;
        groundTransitionTimer.current = 0;
        groundTransitionStartedThisFrame.current =
            true;
    }

    function clearGroundTransition() {
        groundTransition.current = null;
        groundTransitionTimer.current = 0;
        groundTransitionStartedThisFrame.current =
            false;
    }

    // ==============================
    // Keyboard Input
    // ==============================

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            switch (event.code) {
                case "KeyA":
                case "ArrowLeft":
                    keys.current.left = true;
                    break;

                case "KeyD":
                case "ArrowRight":
                    keys.current.right = true;
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    keys.current.run = true;
                    break;

                case "KeyC":
                case "ControlLeft":
                case "ControlRight":
                    event.preventDefault();

                    if (event.repeat) {
                        break;
                    }

                    const wasCrouchHeld =
                        crouchKeysDown.current
                            .size > 0;

                    crouchKeysDown.current.add(
                        event.code,
                    );
                    keys.current.crouch = true;
                    standFromManualCrouchQueued.current =
                        false;

                    if (!wasCrouchHeld) {
                        crouchPressed.current = true;
                    }
                    break;

                case "Space":
                    event.preventDefault();

                    if (event.repeat) {
                        break;
                    }

                    // ตอน Hang → Space = Climb
                    if (isHanging.current) {
                        climbQueued.current = true;
                        break;
                    }

                    // ปกติ → Space = Jump
                    if (
                        !isClimbing.current &&
                        !isRunJumpingUp.current
                    ) {
                        jumpQueued.current = true;
                    }

                    break;
                case "KeyW":
                case "ArrowUp":
                    if (
                        isHanging.current &&
                        !event.repeat
                    ) {
                        climbQueued.current = true;
                    }
                    break;
                case "KeyS":
                case "ArrowDown":
                    if (isHanging.current) {
                        dropFromLedgeQueued.current =
                            true;
                    }
                    break;
            }
        }

        function handleKeyUp(
            event: KeyboardEvent,
        ) {
            switch (event.code) {
                case "KeyA":
                case "ArrowLeft":
                    keys.current.left = false;
                    break;

                case "KeyD":
                case "ArrowRight":
                    keys.current.right = false;
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    keys.current.run = false;
                    break;

                case "KeyC":
                case "ControlLeft":
                case "ControlRight":
                    event.preventDefault();
                    const releasedCrouchKey =
                        crouchKeysDown.current.delete(
                            event.code,
                        );
                    keys.current.crouch =
                        crouchKeysDown.current
                            .size > 0;

                    if (
                        releasedCrouchKey &&
                        !keys.current.crouch &&
                        manualCrouchActive.current
                    ) {
                        standFromManualCrouchQueued.current =
                            true;
                    }
                    break;
            }
        }

        function handleBlur() {
            keys.current.left = false;
            keys.current.right = false;
            keys.current.run = false;
            keys.current.crouch = false;
            crouchKeysDown.current.clear();
            manualCrouchActive.current = false;
            standFromManualCrouchQueued.current =
                false;
            crouchSprintOverride.current = false;

            jumpQueued.current = false;
            crouchPressed.current = false;
            isSliding.current = false;
            slideTimer.current = 0;
            runStopInputTimer.current = 0;
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        window.addEventListener(
            "keyup",
            handleKeyUp,
        );

        window.addEventListener(
            "blur",
            handleBlur,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            window.removeEventListener(
                "keyup",
                handleKeyUp,
            );

            window.removeEventListener(
                "blur",
                handleBlur,
            );
        };
    }, []);

    // ==============================
    // เปลี่ยน Standing / Crouch
    // ==============================

    function setCrouching(
        crouching: boolean,
    ) {
        const standingCollider =
            standingColliderRef.current;

        const crouchingCollider =
            crouchingColliderRef.current;

        const body = bodyRef.current;

        if (
            !standingCollider ||
            !crouchingCollider ||
            !body
        ) {
            return;
        }

        /*
         * สลับ Collider คนละตัวแทนการเปลี่ยน Shape
         * ของ Collider ที่กำลังสัมผัสพื้น
         *
         * ตัด Collision Group ก่อนปิด เพื่อไม่ให้ Rapier
         * นำ Contact เก่าของ Collider ที่ปิดแล้วไปคำนวณต่อ
         */
        if (crouching) {
            const collisionGroups =
                standingCollider.collisionGroups();

            crouchingCollider.setCollisionGroups(
                collisionGroups,
            );
            crouchingCollider.setEnabled(true);

            standingCollider.setCollisionGroups(
                INACTIVE_COLLISION_GROUPS,
            );
            standingCollider.setEnabled(false);
        } else {
            const collisionGroups =
                crouchingCollider.collisionGroups();

            standingCollider.setCollisionGroups(
                collisionGroups,
            );
            standingCollider.setEnabled(true);

            crouchingCollider.setCollisionGroups(
                INACTIVE_COLLISION_GROUPS,
            );
            crouchingCollider.setEnabled(false);
        }

        body.recomputeMassPropertiesFromColliders();
        body.wakeUp();

        isCrouching.current = crouching;
    }

    // ==============================
    // Game Loop
    // ==============================

    /*
     * ใช้ Contact จริงของ Capsule กับ Jump และ Animation
     *
     * Ground Sensor แบบ Enter / Exit อย่างเดียวอาจค้างที่ 0 ได้
     * ถ้า state ถูก reset ระหว่างที่ Sensor ยังทับ Collider เดิมอยู่
     * เพราะ Rapier จะไม่ส่ง Enter ซ้ำจนกว่าจะแยกออกแล้วชนใหม่
     */
    useAfterPhysicsStep((physicsWorld) => {
        const body = bodyRef.current;

        const activePlayerCollider =
            isCrouching.current
                ? crouchingColliderRef.current
                : standingColliderRef.current;

        if (!body || !activePlayerCollider) {
            stableGrounded.current = false;
            return;
        }

        /*
         * Contact manifold อาจค้างหนึ่ง physics step ตอน Takeoff
         * จึงต้องบังคับ Airborne ระหว่าง Jump ที่ยังเคลื่อนขึ้น
         */
        if (
            didJump.current &&
            body.linvel().y >
                TAKEOFF_GROUND_IGNORE_VELOCITY
        ) {
            stableGrounded.current = false;
            return;
        }

        let hasGroundSupport = false;

        physicsWorld.contactPairsWith(
            activePlayerCollider,
            (otherCollider) => {
                if (
                    hasGroundSupport ||
                    otherCollider.isSensor()
                ) {
                    return;
                }

                physicsWorld.contactPair(
                    activePlayerCollider,
                    otherCollider,
                    (manifold, flipped) => {
                        if (
                            hasGroundSupport ||
                            manifold.numSolverContacts() === 0
                        ) {
                            return;
                        }

                        const manifoldNormal =
                            manifold.normal();

                        /*
                         * Rapier อาจเก็บลำดับ Collider ใน manifold
                         * สลับจากลำดับที่ส่งเข้า contactPair
                         */
                        const supportNormalY =
                            flipped
                                ? manifoldNormal.y
                                : -manifoldNormal.y;

                        if (
                            supportNormalY >=
                            MIN_GROUND_SUPPORT_NORMAL_Y
                        ) {
                            hasGroundSupport = true;
                        }
                    },
                );
            },
        );

        /*
         * Trimesh บางรอยต่ออาจดัน Capsule ลอยจากพื้นไม่กี่เซนติเมตร
         * และไม่มี Solver Contact ชั่วคราว ทำให้ Run สลับไป Airborne
         *
         * ใช้ Ray สั้นเฉพาะตอน Contact หาย เพื่อยืนยันว่าพื้นจริง
         * ยังอยู่ใต้เท้า โดยไม่ยืดระยะจนเดินออกจากขอบแล้วยังค้าง Grounded
         */
        if (!hasGroundSupport) {
            const groundRay =
                new rapier.Ray(
                    body.translation(),
                    {
                        x: 0,
                        y: -1,
                        z: 0,
                    },
                );

            const groundHit =
                physicsWorld.castRayAndGetNormal(
                    groundRay,
                    PLAYER_FOOT_OFFSET +
                        GROUND_SUPPORT_RAY_MARGIN,
                    true,
                    rapier.QueryFilterFlags
                        .EXCLUDE_SENSORS,
                    undefined,
                    undefined,
                    body,
                );

            hasGroundSupport =
                groundHit !== null &&
                groundHit.normal.y >=
                    MIN_GROUND_SUPPORT_NORMAL_Y;
        }

        stableGrounded.current =
            hasGroundSupport;
    });

    useFrame((_, delta) => {
        const body = bodyRef.current;

        if (!body) {
            return;
        }

        const safeDelta = Math.min(
            delta,
            0.1,
        );

        const currentVelocity =
            body.linvel();

        const isTouchingDownThisFrame =
            !wasGrounded.current &&
            stableGrounded.current;

        groundTransitionStartedThisFrame.current =
            false;

        // ============================
        // Direction
        // ============================

        let direction = 0;

        if (keys.current.left) {
            direction -= 1;
        }

        if (keys.current.right) {
            direction += 1;
        }

        const isMoving = direction !== 0;
        const requestedFacingDirection:
            1 | -1 | null =
            direction > 0
                ? 1
                : direction < 0
                    ? -1
                    : null;

        // ============================
        // Crouch
        // ============================

        const wantsCrouchedSprint =
            keys.current.crouch &&
            keys.current.run &&
            isMoving;

        if (!wantsCrouchedSprint) {
            crouchSprintOverride.current = false;
        }

        /*
         * Crouch + Sprint เป็น transition ลุกขึ้นวิ่งหนึ่งครั้ง
         * สลับกลับ Standing collider ก่อนเริ่มคลิปเพื่อให้ปลายท่า
         * ตรงกับ Spint และไม่ฝังโมเดลไว้กับ collider ย่อ
         */
        if (
            wantsCrouchedSprint &&
            !crouchSprintOverride.current &&
            isCrouching.current &&
            stableGrounded.current &&
            !isTouchingDownThisFrame &&
            !jumpQueued.current &&
            !crouchPressed.current &&
            !isSliding.current &&
            !isHanging.current &&
            !isHangDropping.current &&
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            !isPushing &&
            landingTimer.current <= 0 &&
            groundTransition.current === null &&
            ceilingContacts.current === 0 &&
            requestedFacingDirection !== null
        ) {
            manualCrouchActive.current = false;
            standFromManualCrouchQueued.current =
                false;
            setCrouching(false);

            if (!isCrouching.current) {
                crouchSprintOverride.current = true;
                facingDirection.current =
                    requestedFacingDirection;

                if (visualRef.current) {
                    visualRef.current.rotation.y =
                        requestedFacingDirection > 0
                            ? Math.PI / 2
                            : -Math.PI / 2;
                }

                startGroundTransition(
                    "CrouchedSpinting",
                );
            }
        }

        /*
         * C / Ctrl แบบกดค้าง:
         * กดอยู่ → ย่อ, ปล่อย → พยายามลุก
         */
        if (
            keys.current.crouch &&
            !wantsCrouchedSprint &&
            !crouchSprintOverride.current &&
            !isCrouching.current &&
            stableGrounded.current &&
            !isTouchingDownThisFrame &&
            landingTimer.current <= 0 &&
            groundTransition.current === null
        ) {
            setCrouching(true);

            if (isCrouching.current) {
                manualCrouchActive.current = true;
            }
        }

        /*
         * ถ้ากด crouch ระหว่าง grounded one-shot ให้คิว input ไว้
         * แล้วค่อยสลับ collider หลังคลิปจบ เพื่อไม่ให้ pose ยืน
         * เล่นอยู่บน collider ย่อ
         */

        if (
            !keys.current.crouch &&
            isCrouching.current &&
            !isSliding.current &&
            !isTouchingDownThisFrame &&
            landingTimer.current <= 0
        ) {
            /*
             * ถ้าไม่มีอะไรอยู่เหนือหัว
             * ถึงจะยืนได้
             */
            if (
                ceilingContacts.current === 0 &&
                (
                    groundTransition.current ===
                        null ||
                    groundTransition.current ===
                        "CrouchedStanding"
                )
            ) {
                const shouldPlayManualStand =
                    standFromManualCrouchQueued.current &&
                    manualCrouchActive.current &&
                    stableGrounded.current &&
                    !isTouchingDownThisFrame &&
                    !jumpQueued.current &&
                    !isSliding.current &&
                    !isHanging.current &&
                    !isHangDropping.current &&
                    !isClimbing.current &&
                    !isRunJumpingUp.current &&
                    landingTimer.current <= 0 &&
                    groundTransition.current === null;

                setCrouching(false);

                if (!isCrouching.current) {
                    manualCrouchActive.current = false;
                    standFromManualCrouchQueued.current =
                        false;

                    if (shouldPlayManualStand) {
                        startGroundTransition(
                            "CrouchedStanding",
                        );
                    }
                }
            }
        }

        if (isMoving) {
            runStopInputTimer.current = 0;
        } else if (
            stableGrounded.current &&
            groundTransition.current === null &&
            currentAnimation.current ===
                "Spint"
        ) {
            runStopInputTimer.current +=
                safeDelta;
        } else {
            runStopInputTimer.current = 0;
        }

        /*
         * Jump และ traversal มี priority สูงกว่า grounded one-shot
         * จึงยกเลิก transition เดิมทันทีที่ขอกระโดด
         */
        if (
            jumpQueued.current &&
            groundTransition.current !== null
        ) {
            clearGroundTransition();
        }

        const activeGroundTransition =
            groundTransition.current;

        if (
            activeGroundTransition !== null &&
            !groundTransitionStartedThisFrame.current &&
            currentAnimation.current ===
                activeGroundTransition
        ) {
            groundTransitionTimer.current +=
                safeDelta;

            const transitionDuration =
                GROUND_TRANSITION_DURATIONS[
                    activeGroundTransition
                ];

            if (
                groundTransitionTimer.current >=
                transitionDuration
            ) {
                clearGroundTransition();

                /*
                 * ถ้ากด C คิวไว้ระหว่าง one-shot ให้เข้า crouch ทันที
                 * ในเฟรมที่คลิปจบ ไม่ปล่อย Spint/Jog แทรกหนึ่งเฟรม
                 */
                if (
                    keys.current.crouch &&
                    !wantsCrouchedSprint &&
                    !crouchSprintOverride.current &&
                    !isCrouching.current &&
                    stableGrounded.current &&
                    !isTouchingDownThisFrame &&
                    ceilingContacts.current === 0
                ) {
                    setCrouching(true);

                    if (isCrouching.current) {
                        manualCrouchActive.current =
                            true;
                    }
                }
            }
        }

        if (
            direction > 0 &&
            currentVelocity.x >= -0.05 &&
            !isHanging.current &&
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            !isSliding.current &&
            groundTransition.current === null
        ) {
            facingDirection.current = 1;
        }

        if (
            direction < 0 &&
            currentVelocity.x <= 0.05 &&
            !isHanging.current &&
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            !isSliding.current &&
            groundTransition.current === null
        ) {
            facingDirection.current = -1;
        }

        // ============================
        // Speed
        // ============================

        let maxSpeed = JOG_SPEED;

        // ตอนย่อใช้ความเร็ว crouch จนกว่าจะเริ่ม transition ลุกวิ่ง
        if (isCrouching.current) {
            maxSpeed = CROUCH_SPEED;
        } else if (isPushing) {
            maxSpeed = JOG_SPEED;
        } else if (keys.current.run) {
            maxSpeed = RUN_SPEED;
        }

        const isRunStopping =
            groundTransition.current ===
            "RunStop";

        const targetVelocityX =
            isRunStopping
                ? 0
                : direction * maxSpeed;

        /*
         * acceleration / deceleration
         */
        const movementSmoothing =
            1 - Math.exp(-14 * safeDelta);

        const isReversingVelocity =
            stableGrounded.current &&
            !isCrouching.current &&
            direction !== 0 &&
            currentVelocity.x * direction < 0;

        let velocityX =
            isReversingVelocity
                ? moveTowards(
                    currentVelocity.x,
                    0,
                    REVERSE_BRAKE_ACCELERATION *
                        safeDelta,
                )
                : THREE.MathUtils.lerp(
                currentVelocity.x,
                targetVelocityX,
                movementSmoothing,
            );

        let velocityY =
            currentVelocity.y;

        if (
            stableGrounded.current &&
            !didJump.current
        ) {
            lastGroundFootY.current =
                body.translation().y -
                PLAYER_FOOT_OFFSET;
        }

        // ============================
        // Sprint -> Slide
        // ============================

        const currentHorizontalSpeed =
            Math.abs(currentVelocity.x);

        let startedSlideThisFrame = false;

        if (
            crouchPressed.current &&
            keys.current.run &&
            isMoving &&
            currentAnimation.current === "Spint" &&
            !isPushing &&
            !isSliding.current &&
            stableGrounded.current &&
            groundTransition.current === null &&
            !isTouchingDownThisFrame &&
            !isHanging.current &&
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            currentHorizontalSpeed >=
                SLIDE_MIN_ENTRY_SPEED
        ) {
            const nextSlideDirection =
                currentVelocity.x >= 0
                    ? 1
                    : -1;

            slideDirection.current =
                nextSlideDirection;
            facingDirection.current =
                nextSlideDirection;

            if (visualRef.current) {
                visualRef.current.rotation.y =
                    nextSlideDirection > 0
                        ? Math.PI / 2
                        : -Math.PI / 2;
            }

            isSliding.current = true;
            slideTimer.current = 0;
            startedSlideThisFrame = true;
            clearGroundTransition();
            manualCrouchActive.current = false;
            standFromManualCrouchQueued.current =
                false;

            if (!isCrouching.current) {
                setCrouching(true);
            }
        }

        if (isSliding.current) {
            /*
             * เริ่ม clock หลังเฟรมที่ resolver เปลี่ยนเป็น RunningSlide
             * เพื่อให้ physics และ AnimationAction เริ่มพร้อมกัน
             */
            if (!startedSlideThisFrame) {
                slideTimer.current += delta;
            }

            const speedAlongSlide =
                startedSlideThisFrame
                    ? Math.max(
                        currentHorizontalSpeed,
                        SLIDE_MIN_INITIAL_SPEED,
                    )
                    : Math.max(
                        0,
                        currentVelocity.x *
                            slideDirection.current,
                    );

            const nextSlideSpeed =
                speedAlongSlide *
                Math.exp(
                    -SLIDE_DRAG * safeDelta,
                );

            velocityX =
                slideDirection.current *
                nextSlideSpeed;

            const shouldEndSlide =
                !stableGrounded.current ||
                nextSlideSpeed <=
                    SLIDE_BLOCKED_SPEED ||
                slideTimer.current >=
                    SLIDE_DURATION;

            if (shouldEndSlide) {
                isSliding.current = false;
                slideTimer.current = 0;

                if (
                    !keys.current.crouch &&
                    ceilingContacts.current === 0
                ) {
                    setCrouching(false);
                    manualCrouchActive.current = false;
                    standFromManualCrouchQueued.current =
                        false;
                } else if (
                    keys.current.crouch &&
                    isCrouching.current
                ) {
                    manualCrouchActive.current = true;
                    crouchSprintOverride.current = true;
                }
            }
        }

        crouchPressed.current = false;

        const grounded =
            groundContacts.current > 0;

        // ============================
        // Ledge / Hang
        // ============================

        // ลด cooldown
        if (ledgeGrabCooldown.current > 0) {
            ledgeGrabCooldown.current -=
                safeDelta;
        }

        // ============================
        // ปล่อยขอบ
        // ============================

        if (
            isHanging.current &&
            dropFromLedgeQueued.current
        ) {
            isHanging.current = false;
            isEnteringHang.current = false;
            hangEntryTimer.current = 0;

            isHangDropping.current = true;
            hangDropTimer.current = 0;

            dropFromLedgeQueued.current =
                false;
            climbQueued.current = false;

            ledgeGrabCooldown.current =
                LEDGE_REGRAB_COOLDOWN;

            // เปิด Gravity กลับมา
            body.setGravityScale(
                1,
                true,
            );

            velocityX = 0;
            velocityY = -1;
        }

        if (isHangDropping.current) {
            hangDropTimer.current +=
                safeDelta;

            if (
                hangDropTimer.current >=
                HANG_DROP_DURATION
            ) {
                isHangDropping.current = false;
                hangDropTimer.current = 0;
            }
        }

        // ============================
        // เริ่ม Climb
        // ============================

        if (
            isHanging.current &&
            climbQueued.current &&
            !isEnteringHang.current
        ) {
            climbQueued.current = false;
            dropFromLedgeQueued.current =
                false;

            isHanging.current = false;
            isClimbing.current = true;

            isHangDropping.current = false;
            hangDropTimer.current = 0;

            isSliding.current = false;
            slideTimer.current = 0;
            clearGroundTransition();

            climbTimer.current = 0;

            const facing =
                facingDirection.current;

            const top =
                ledgeTopPosition.current;

            // จุดเริ่ม
            climbStartPosition.current = {
                ...hangPosition.current,
            };

            /*
             * Phase 1:
             *
             * ขึ้นตรง ๆ ก่อน
             * ยังไม่เข้าไปใน Platform
             *
             * จะช่วยไม่ให้ Collider
             * วิ่งทะลุกำแพงระหว่างปีน
             */
            climbUpPosition.current = {
                x: hangPosition.current.x,

                y:
                    top.y +
                    STANDING_BODY_TO_FOOT,

                z: 0,
            };

            /*
             * Phase 2:
             *
             * เมื่อสูงกว่าขอบแล้ว
             * ค่อยเลื่อนเข้าไปบน Platform
             */
            climbEndPosition.current = {
                x:
                    top.x +
                    facing *
                    CLIMB_FORWARD_DISTANCE,

                y:
                    top.y +
                    STANDING_BODY_TO_FOOT,

                z: 0,
            };

            body.setGravityScale(
                0,
                true,
            );

            body.setLinvel(
                {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                true,
            );

            landingTimer.current = 0;
            jumpQueued.current = false;
        }

        // ============================
        // กำลัง Climb
        // ============================

        if (isClimbing.current) {
            climbTimer.current +=
                safeDelta;

            const progress =
                Math.min(
                    climbTimer.current /
                    CLIMB_DURATION,
                    1,
                );

            let x: number;
            let y: number;

            /*
             * 65% แรก
             * ยกตัวขึ้น
             */
            if (progress < 0.65) {
                const phase =
                    progress / 0.65;

                /*
                 * smoothstep
                 * ไม่ให้เริ่ม/หยุดแข็งเกิน
                 */
                const smooth =
                    phase *
                    phase *
                    (3 - 2 * phase);

                x =
                    THREE.MathUtils.lerp(
                        climbStartPosition
                            .current.x,
                        climbUpPosition
                            .current.x,
                        smooth,
                    );

                y =
                    THREE.MathUtils.lerp(
                        climbStartPosition
                            .current.y,
                        climbUpPosition
                            .current.y,
                        smooth,
                    );
            }

            /*
             * 35% หลัง
             * ขยับเข้า Platform
             */
            else {
                const phase =
                    (progress - 0.65) /
                    0.35;

                const smooth =
                    phase *
                    phase *
                    (3 - 2 * phase);

                x =
                    THREE.MathUtils.lerp(
                        climbUpPosition
                            .current.x,
                        climbEndPosition
                            .current.x,
                        smooth,
                    );

                y =
                    THREE.MathUtils.lerp(
                        climbUpPosition
                            .current.y,
                        climbEndPosition
                            .current.y,
                        smooth,
                    );
            }

            body.setTranslation(
                {
                    x,
                    y,
                    z: 0,
                },
                true,
            );

            body.setLinvel(
                {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                true,
            );

            velocityX = 0;
            velocityY = 0;

            jumpQueued.current = false;

            // ========================
            // Climb เสร็จ
            // ========================

            if (progress >= 1) {
                isClimbing.current = false;

                body.setTranslation(
                    climbEndPosition.current,
                    true,
                );

                body.setLinvel(
                    {
                        x: 0,
                        y: 0,
                        z: 0,
                    },
                    true,
                );

                // เปิด Gravity กลับ
                body.setGravityScale(
                    1,
                    true,
                );

                /*
                 * จุดปลายวางก้น collider บนผิว Platform พอดี
                 * ล็อก traversal นี้เป็น grounded จน physics step ถัดไป
                 * ตรวจยืนยันด้วย contact/ray เพื่อไม่คั่น Jump/Landing ปลอม
                 */
                stableGrounded.current = true;
                wasGrounded.current = true;
                didJump.current = false;
                jumpStartedRunning.current = false;
                highFallActive.current = false;

                /*
                 * กันตรวจเจอ Ledge
                 * เดิมทันที
                 */
                ledgeGrabCooldown.current =
                    LEDGE_REGRAB_COOLDOWN;

                landingTimer.current = 0;
            }
        }

        // ============================
        // Run Jump Up: ขอบเตี้ย
        // ============================

        if (isRunJumpingUp.current) {
            runJumpUpTimer.current +=
                safeDelta;

            const progress = Math.min(
                runJumpUpTimer.current /
                    RUN_JUMP_UP_DURATION,
                1,
            );

            let nextPosition: {
                x: number;
                y: number;
                z: number;
            };

            if (progress < 0.6) {
                const phase = progress / 0.6;
                const smooth =
                    phase *
                    phase *
                    (3 - 2 * phase);

                nextPosition = {
                    x:
                        runJumpUpStartPosition
                            .current.x,
                    y: THREE.MathUtils.lerp(
                        runJumpUpStartPosition
                            .current.y,
                        runJumpUpTopPosition
                            .current.y,
                        smooth,
                    ),
                    z: 0,
                };
            } else {
                const phase =
                    (progress - 0.6) /
                    0.4;
                const smooth =
                    phase *
                    phase *
                    (3 - 2 * phase);

                nextPosition = {
                    x: THREE.MathUtils.lerp(
                        runJumpUpTopPosition
                            .current.x,
                        runJumpUpEndPosition
                            .current.x,
                        smooth,
                    ),
                    y:
                        runJumpUpEndPosition
                            .current.y,
                    z: 0,
                };
            }

            body.setTranslation(
                nextPosition,
                true,
            );
            body.setLinvel(
                { x: 0, y: 0, z: 0 },
                true,
            );

            velocityX = 0;
            velocityY = 0;
            jumpQueued.current = false;

            if (progress >= 1) {
                isRunJumpingUp.current = false;
                runJumpUpTimer.current = 0;

                body.setTranslation(
                    runJumpUpEndPosition.current,
                    true,
                );
                body.setGravityScale(1, true);

                stableGrounded.current = true;
                wasGrounded.current = true;
                didJump.current = false;
                jumpStartedRunning.current =
                    false;
                highFallActive.current = false;
                landingTimer.current = 0;
                ledgeGrabCooldown.current =
                    LEDGE_REGRAB_COOLDOWN;
            }
        }

        // ============================
        // กำลัง Hang
        // ============================

        if (isHanging.current) {
            if (isEnteringHang.current) {
                hangEntryTimer.current +=
                    safeDelta;

                if (
                    hangEntryTimer.current >=
                    JUMP_HANG_DURATION
                ) {
                    isEnteringHang.current =
                        false;
                    hangEntryTimer.current = 0;
                }
            }

            /*
             * ล็อก Body ไว้ที่ขอบ
             */
            body.setTranslation(
                hangPosition.current,
                true,
            );

            velocityX = 0;
            velocityY = 0;

            /*
             * ตอน Hang ห้าม Jump เดิมทำงาน
             */
            jumpQueued.current = false;
        }

        // ============================
        // หา Ledge
        // ============================

        else if (
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            (
                !grounded ||
                (
                    didJump.current &&
                    velocityY >
                        TAKEOFF_GROUND_IGNORE_VELOCITY
                )
            ) &&
            (
                velocityY <= 0 ||
                (
                    didJump.current &&
                    velocityY >
                        TAKEOFF_GROUND_IGNORE_VELOCITY
                )
            ) &&
            ledgeGrabCooldown.current <= 0
        ) {
            const playerPosition =
                body.translation();

            const facing =
                facingDirection.current;

            // ========================
            // Ray 1
            // ยิงระดับตัว
            // ต้องเจอกำแพง
            // ========================

            const wallRay =
                new rapier.Ray(
                    {
                        x: playerPosition.x,
                        y:
                            playerPosition.y +
                            LEDGE_LOWER_RAY_Y,
                        z: playerPosition.z,
                    },
                    {
                        x: facing,
                        y: 0,
                        z: 0,
                    },
                );

            // ========================
            // Ray 2
            // ยิงระดับหัว
            // ต้องไม่เจอกำแพง
            // ========================

            const upperRay =
                new rapier.Ray(
                    {
                        x: playerPosition.x,
                        y:
                            playerPosition.y +
                            LEDGE_UPPER_RAY_Y,
                        z: playerPosition.z,
                    },
                    {
                        x: facing,
                        y: 0,
                        z: 0,
                    },
                );

            /*
             * EXCLUDE_SENSORS
             *
             * ไม่ให้ Ray ไปโดนพวก
             * Ground Sensor
             * Interaction Sensor
             * ฯลฯ
             */
            const queryFlags =
                rapier.QueryFilterFlags
                    .EXCLUDE_SENSORS;

            const wallHit =
                world.castRay(
                    wallRay,
                    LEDGE_FORWARD_DISTANCE,
                    true,
                    queryFlags,
                    undefined,
                    undefined,

                    // ไม่ให้ Ray ชน Player เอง
                    body,
                );

            const upperHit =
                world.castRay(
                    upperRay,
                    LEDGE_FORWARD_DISTANCE,
                    true,
                    queryFlags,
                    undefined,
                    undefined,
                    body,
                );

            /*
             * ลักษณะที่เราต้องการ:
             *
             * Upper Ray → ไม่เจออะไร
             *
             *      ─────→
             *     🧍
             *      ─────→ █  ← Lower เจอกำแพง
             *             █
             */
            if (
                wallHit &&
                !upperHit
            ) {
                const wallPoint =
                    wallRay.pointAt(
                        wallHit.timeOfImpact,
                    );

                // ========================
                // Ray 3
                // ยิงลงเพื่อหาพื้นบนขอบ
                // ========================

                const topRay =
                    new rapier.Ray(
                        {
                            /*
                             * ข้ามเข้าไปด้านใน
                             * platform นิดหนึ่ง
                             */
                            x:
                                wallPoint.x +
                                facing * 0.12,

                            y:
                                playerPosition.y +
                                LEDGE_TOP_RAY_Y,

                            z:
                                playerPosition.z,
                        },
                        {
                            x: 0,
                            y: -1,
                            z: 0,
                        },
                    );

                const topHit =
                    world.castRay(
                        topRay,
                        LEDGE_TOP_RAY_DISTANCE,
                        true,
                        queryFlags,
                        undefined,
                        undefined,
                        body,
                    );

                if (topHit) {
                    const topPoint =
                        topRay.pointAt(
                            topHit.timeOfImpact,
                        );

                    ledgeTopPosition.current = {
                        x: topPoint.x,
                        y: topPoint.y,
                        z: topPoint.z,
                    };

                    const ledgeHeight =
                        topPoint.y -
                        lastGroundFootY.current;

                    const shouldRunJumpUp =
                        didJump.current &&
                        ledgeHeight <=
                            RUN_JUMP_UP_MAX_LEDGE_HEIGHT;

                    if (shouldRunJumpUp) {
                        isSliding.current = false;
                        slideTimer.current = 0;
                        clearGroundTransition();

                        const targetBodyY =
                            topPoint.y +
                            STANDING_BODY_TO_FOOT;

                        isRunJumpingUp.current =
                            true;
                        runJumpUpTimer.current = 0;
                        body.setGravityScale(0, true);

                        /*
                         * ล็อก state ก่อน resolver ด้านล่างทันที
                         * เพื่อไม่ให้มี Jog / Run คั่นหนึ่งเฟรม
                         */
                        stableGrounded.current = false;

                        runJumpUpStartPosition.current = {
                            x: playerPosition.x,
                            y: playerPosition.y,
                            z: 0,
                        };

                        runJumpUpTopPosition.current = {
                            x: playerPosition.x,
                            y: targetBodyY,
                            z: 0,
                        };

                        runJumpUpEndPosition.current = {
                            x:
                                wallPoint.x +
                                facing *
                                    (
                                        PLAYER_RADIUS +
                                        0.12
                                    ),
                            y: targetBodyY,
                            z: 0,
                        };
                    } else if (velocityY <= 0) {
                        isSliding.current = false;
                        slideTimer.current = 0;
                        clearGroundTransition();

                        /*
                         * ขอบสูง: จับขอบก่อน แล้วค่อยเปลี่ยน
                         * JumpHang -> HangingIdle
                         */
                        isHanging.current = true;
                        isEnteringHang.current = true;
                        hangEntryTimer.current = 0;
                        body.setGravityScale(0, true);

                        isHangDropping.current = false;
                        hangDropTimer.current = 0;

                        hangPosition.current = {
                            x:
                                wallPoint.x -
                                facing *
                                HANG_DISTANCE_FROM_WALL,
                            y:
                                topPoint.y -
                                HANG_BODY_BELOW_LEDGE,
                            z: 0,
                        };

                        body.setTranslation(
                            hangPosition.current,
                            true,
                        );

                        /*
                         * เมื่อจับขอบสำเร็จ Jump รอบเดิมจบแล้ว
                         * เพื่อให้ปล่อยจากขอบสูงเข้า Falling ได้
                         */
                        didJump.current = false;
                        jumpStartedRunning.current =
                            false;
                        highFallActive.current = false;
                    }

                    if (
                        shouldRunJumpUp ||
                        isHanging.current
                    ) {
                        velocityX = 0;
                        velocityY = 0;

                        groundContacts.current =
                            0;

                        landingTimer.current =
                            0;

                        jumpQueued.current =
                            false;
                    }
                }
            }
        }

        // ============================
        // Jump
        // ============================

        if (
            isSliding.current &&
            jumpQueued.current &&
            ceilingContacts.current === 0
        ) {
            isSliding.current = false;
            slideTimer.current = 0;
        }

        const groundedBeforeJump =
            stableGrounded.current;

        let jumpedThisFrame = false;

        /*
         * ถ้ากดกระโดดตอนย่อและด้านบนว่าง
         * ให้ลุกก่อนเริ่ม Jump อัตโนมัติ
         * แต่ยังคงบล็อกไว้เมื่อมีเพดานจริง
         */
        if (
            jumpQueued.current &&
            groundedBeforeJump &&
            landingTimer.current <= 0 &&
            isCrouching.current &&
            ceilingContacts.current === 0
        ) {
            manualCrouchActive.current = false;
            standFromManualCrouchQueued.current =
                false;
            setCrouching(false);
        }

        // กด Space แล้ว Takeoff ทันที
        if (
            jumpQueued.current &&
            groundedBeforeJump &&
            landingTimer.current <= 0 &&
            !isCrouching.current
        ) {
            /*
             * จำว่าตอนเริ่มกระโดด
             * กำลังวิ่งหรือไม่
             */
            jumpStartedRunning.current =
                (
                    currentAnimation.current ===
                        "Jog" ||
                    currentAnimation.current ===
                        "Spint" ||
                    (
                        isMoving &&
                        keys.current.run
                    )
                );

            /*
             * บอกระบบว่า Jump รอบนี้
             * เกิดจากการกด Space
             */
            didJump.current = true;
            highFallActive.current = false;

            landingTimer.current = 0;

            velocityY = JUMP_SPEED;
            jumpedThisFrame = true;

            /*
             * กัน Double Jump
             */
            groundContacts.current = 0;
            stableGrounded.current = false;
        }

        jumpQueued.current = false;

        const animationGrounded =
            jumpedThisFrame
                ? false
                : stableGrounded.current;

        const highFallBeforeGroundReset =
            highFallActive.current;

        if (animationGrounded) {
            isHangDropping.current = false;
            hangDropTimer.current = 0;
        }

        if (
            animationGrounded ||
            isHanging.current ||
            isClimbing.current
        ) {
            highFallActive.current = false;
        }

        // ============================
        // ตรวจพื้นล่วงหน้าสำหรับ Landing
        // ============================

        let shouldPreLand = false;

        if (
            !animationGrounded &&
            velocityY < 0
        ) {
            const playerPosition =
                body.translation();

            const ray = new rapier.Ray(
                {
                    x: playerPosition.x,
                    y: playerPosition.y,
                    z: playerPosition.z,
                },
                {
                    x: 0,
                    y: -1,
                    z: 0,
                },
            );

            const maxRayDistance =
                PLAYER_FOOT_OFFSET +
                Math.max(
                    LAND_PREP_DISTANCE,
                    HIGH_FALL_MIN_CLEARANCE,
                );

            const hit =
                world.castRayAndGetNormal(
                    ray,
                    maxRayDistance,
                    true,
                    rapier.QueryFilterFlags
                        .EXCLUDE_SENSORS,
                    undefined,
                    undefined,

                    // ไม่ให้ Ray ชน Player เอง
                    body,
                );

            const hasWalkableGround =
                hit !== null &&
                hit.normal.y >=
                    MIN_GROUND_SUPPORT_NORMAL_Y;

            const distanceFromFeet =
                hasWalkableGround
                    ? hit.timeOfImpact -
                        PLAYER_FOOT_OFFSET
                    : Number.POSITIVE_INFINITY;

            shouldPreLand =
                hasWalkableGround &&
                distanceFromFeet <=
                    LAND_PREP_DISTANCE;

            /*
             * ไม่ใช้ Falling กับการกด Jump ตามที่ออกแบบไว้
             * และไม่ใช้กับการตกเตี้ยที่ยังเห็นพื้นอยู่ในระยะ
             */
            if (
                !didJump.current &&
                velocityY <=
                    HIGH_FALL_START_VELOCITY &&
                distanceFromFeet >
                    HIGH_FALL_MIN_CLEARANCE
            ) {
                highFallActive.current = true;
            }
        }

        // ============================
        // Landing Detection
        // ============================

        /*
         * frame ก่อนหน้า = airborne
         * frame ปัจจุบัน = grounded
         *
         * แปลว่าเพิ่งแตะพื้น
         */
        const justLanded =
            !wasGrounded.current &&
            animationGrounded;

        if (justLanded) {
            landingAnimation.current =
                highFallBeforeGroundReset
                    ? "HardLanding"
                    : "Landing";

            landingTimer.current =
                highFallBeforeGroundReset
                    ? HARD_LANDING_DURATION
                    : LAND_DURATION;

            /*
             * Jump รอบนี้จบแล้ว
             */
            didJump.current = false;

            jumpStartedRunning.current =
                false;
        }

        /*
         * ลดเวลา Landing
         */
        if (
            landingTimer.current > 0 &&
            !justLanded &&
            currentAnimation.current ===
                landingAnimation.current
        ) {
            landingTimer.current =
                Math.max(
                    0,
                    landingTimer.current -
                    safeDelta,
                );
        }

        /*
         * ลงจาก Jump ปกติขณะยังถือทิศ ให้ต่อ Jog/Spint ทันที
         * ไม่ล็อกความเร็วหรือคั่นด้วย Landing จน movement สะดุด
         * แต่ HardLanding จากการตกสูงยังคงเป็น one-shot เต็มคลิป
         */
        if (
            animationGrounded &&
            isMoving &&
            landingAnimation.current ===
                "Landing"
        ) {
            landingTimer.current = 0;
        }

        // ============================
        // Animation State
        // ============================

        let nextAnimation:
            PlayerAnimation;

        const isRunning =
            isMoving &&
            keys.current.run &&
            !isCrouching.current;

        const isJogging =
            isMoving &&
            !keys.current.run &&
            !isCrouching.current;

        const isWaitingForRunStop =
            groundTransition.current === null &&
            animationGrounded &&
            !isMoving &&
            !isCrouching.current &&
            runStopInputTimer.current > 0 &&
            runStopInputTimer.current <
                RUN_STOP_INPUT_GRACE &&
            currentAnimation.current ===
                "Spint";

        /*
         * Traversal, slide และ airborne มี priority สูงกว่า
         * grounded one-shot และต้องไม่ปล่อย transition เก่ากลับมาเล่นซ้ำ
         */
        if (
            groundTransition.current !== null &&
            (
                !animationGrounded ||
                isRunJumpingUp.current ||
                isClimbing.current ||
                isHanging.current ||
                isHangDropping.current ||
                isSliding.current
            )
        ) {
            clearGroundTransition();
        }

        /*
         * เริ่ม RunStop เพียงครั้งเดียวเมื่อหยุดจาก Spint
         * ส่วน Jog กลับ Idle ทันทีเพื่อไม่ให้การขยับสั้น ๆ สะดุด
         * timer/latch จะกัน Idle หรือ locomotion ใหม่มาตัดกลางคลิป
         */
        if (
            groundTransition.current === null &&
            animationGrounded &&
            !isMoving &&
            !isCrouching.current &&
            !isPushing &&
            landingTimer.current <= 0 &&
            runStopInputTimer.current >=
                RUN_STOP_INPUT_GRACE &&
            currentAnimation.current ===
                "Spint"
        ) {
            startGroundTransition("RunStop");
        }

        if (isRunJumpingUp.current) {
            nextAnimation = "JumpUp";
        }

        else if (isClimbing.current) {
            nextAnimation = "Climb";
        }

        // ====================================
        // 0. Hang
        // ====================================

        else if (isHanging.current) {
            nextAnimation =
                isEnteringHang.current
                    ? "JumpHang"
                    : "HangingIdle";
        }

        // ============================
        // ปล่อยตัวลงจากขอบ
        // ============================

        else if (isHangDropping.current) {
            nextAnimation = "BracedHangDrop";
        }

        // ============================
        // 2. Landing
        // ============================

        else if (
            shouldPreLand ||
            (
                animationGrounded &&
                landingTimer.current > 0
            )
        ) {
            nextAnimation = shouldPreLand
                ? "Landing"
                : landingAnimation.current;
        }

        // ============================
        // 3. Turn / Stop / Slide
        // ============================

        else if (isSliding.current) {
            nextAnimation = "RunningSlide";
        }

        // ============================
        // 4. Airborne
        // ============================

        else if (!animationGrounded) {
            if (highFallActive.current) {
                nextAnimation = "Jump";
            }

            /*
             * ยังพุ่งขึ้นจากการกระโดด
             */
            else if (
                didJump.current &&
                jumpStartedRunning.current
            ) {
                nextAnimation = "RunningJump";
            }

            /*
             * Jump ธรรมดา
             */
            else {
                nextAnimation = "Jump";
            }
        }

        // ============================
        // 3. Grounded one-shot
        // ============================

        else if (
            groundTransition.current !== null
        ) {
            nextAnimation =
                groundTransition.current;
        }

        // ============================
        // ดัน Printer / Object
        // ============================

        else if (
            isPushing &&
            animationGrounded &&
            !isCrouching.current
        ) {
            nextAnimation = "Pushing";
        }

        // ============================
        // 4. Crouch
        // ============================

        else if (isCrouching.current) {
            if (isMoving) {
                nextAnimation = "CrouchWalking";
            } else {
                nextAnimation =
                    "CrouchingIdle";
            }
        }

        // ============================
        // 5. รอก่อนเริ่ม RunStop
        // ============================

        else if (isWaitingForRunStop) {
            nextAnimation =
                currentAnimation.current;
        }

        // ============================
        // 6. Run
        // ============================

        else if (isRunning) {
            nextAnimation = "Spint";
        }

        // ============================
        // 7. Jog
        // ============================

        else if (isJogging) {
            nextAnimation = "Jog";
        }

        // ============================
        // 8. Idle
        // ============================

        else {
            nextAnimation = "Idle";
        }

        /*
         * แตะพื้นแล้วหยุดนิ่งจน Landing จบ
         * แต่ไม่ล็อกช่วง Pre-Landing ที่ยังอยู่กลางอากาศ
         */
        if (
            (
                nextAnimation === "Landing" ||
                nextAnimation === "HardLanding"
            ) &&
            animationGrounded
        ) {
            velocityX = 0;
        }

        changeAnimation(
            nextAnimation,
        );

        /*
         * เก็บ Grounded ปัจจุบัน
         * เพื่อเทียบ frame หน้า
         *
         * ต้องอยู่หลัง justLanded
         */
        wasGrounded.current =
            animationGrounded;

        // ============================
        // Apply Velocity
        // ============================

        body.setLinvel(
            {
                x: velocityX,
                y: velocityY,

                /*
                 * Side-scroller
                 * ล็อกความลึก
                 */
                z: 0,
            },
            true,
        );

        // ============================
        // หันซ้าย / ขวา
        // ============================

        if (
            visualRef.current &&
            isMoving &&
            !isHanging.current &&
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            !isSliding.current &&
            groundTransition.current === null
        ) {
            if (
                direction > 0 &&
                currentVelocity.x >= -0.05
            ) {
                // เดินขวา
                visualRef.current.rotation.y =
                    Math.PI / 2;
                // 0;
            }

            if (
                direction < 0 &&
                currentVelocity.x <= 0.05
            ) {
                // เดินซ้าย
                visualRef.current.rotation.y =
                    -Math.PI / 2;
                // Math.PI;
            }
        }

        // ============================
        // Reset เมื่อตก Map
        // ============================

        const position =
            body.translation();

        const effectState =
            playerEffectState.current;

        effectState.x = position.x;
        effectState.footY =
            position.y - PLAYER_FOOT_OFFSET;
        effectState.z = position.z;
        effectState.velocityX =
            currentVelocity.x;
        effectState.grounded =
            animationGrounded;
        effectState.enabled =
            animationGrounded &&
            !isCrouching.current &&
            !isSliding.current &&
            !isHanging.current &&
            !isClimbing.current &&
            !isRunJumpingUp.current &&
            !isPushing;
        effectState.locomotionActive =
            currentAnimation.current ===
                "Jog" ||
            currentAnimation.current ===
                "Spint" ||
            currentAnimation.current ===
                "CrouchedSpinting" ||
            currentAnimation.current ===
                "RunStop";
        // ============================
        // Cinematic Side Camera
        // ============================

        /*
         * ถ้าเดินขวา direction = 1
         * ถ้าเดินซ้าย direction = -1
         *
         * กล้องจะมองล่วงหน้าไปยังทิศนั้น
         */
        let targetLookAhead = 0;

        if (isMoving) {
            targetLookAhead =
                direction *
                (
                    keys.current.run
                        ? RUN_LOOK_AHEAD
                        : WALK_LOOK_AHEAD
                );
        }

        /*
         * เวลาเปลี่ยนจากซ้าย → ขวา
         * ไม่ให้กล้องกระชากทันที
         */
        const lookAheadSmoothing =
            1 -
            Math.exp(
                -LOOK_AHEAD_SPEED * safeDelta,
            );

        cameraLookAhead.current =
            THREE.MathUtils.lerp(
                cameraLookAhead.current,
                targetLookAhead,
                lookAheadSmoothing,
            );

        /*
         * จุดที่เราอยากให้กล้องมอง
         */
        desiredCameraTarget.current.set(
            position.x +
            cameraLookAhead.current,

            position.y +
            CAMERA_TARGET_HEIGHT,

            0,
        );

        /*
         * ตำแหน่งกล้องที่ต้องการ
         *
         * X:
         * ตาม Player + Look Ahead เล็กน้อย
         *
         * Y:
         * อยู่เหนือ Player
         *
         * Z:
         * อยู่ด้านหน้าฉากแบบ Side View
         */
        desiredCameraPosition.current.set(
            position.x +
            cameraLookAhead.current * 0.45,

            position.y +
            CAMERA_HEIGHT,

            CAMERA_DISTANCE,
        );

        /*
         * เฟรมแรก
         * ให้กล้องกระโดดไปหาผู้เล่นทันที
         *
         * ไม่งั้นตอนเริ่มเกมจะเห็นกล้อง
         * ค่อย ๆ บินจาก [0, 4, 14]
         * ไปหา Player ที่ x = -10
         */
        if (!cameraInitialized.current) {
            camera.position.copy(
                desiredCameraPosition.current,
            );

            currentCameraTarget.current.copy(
                desiredCameraTarget.current,
            );

            cameraInitialized.current = true;
        }

        /*
         * X/Z ตามเร็วกว่า
         */
        const horizontalSmoothing =
            1 -
            Math.exp(
                -CAMERA_FOLLOW_SPEED *
                safeDelta,
            );

        camera.position.x =
            THREE.MathUtils.lerp(
                camera.position.x,
                desiredCameraPosition.current.x,
                horizontalSmoothing,
            );

        camera.position.z =
            THREE.MathUtils.lerp(
                camera.position.z,
                desiredCameraPosition.current.z,
                horizontalSmoothing,
            );

        /*
         * Y ตามช้ากว่า
         *
         * เวลา Player กระโดด
         * กล้องจะไม่เด้งขึ้นทันที
         */
        const verticalSmoothing =
            1 -
            Math.exp(
                -CAMERA_VERTICAL_SPEED *
                safeDelta,
            );

        camera.position.y =
            THREE.MathUtils.lerp(
                camera.position.y,
                desiredCameraPosition.current.y,
                verticalSmoothing,
            );

        /*
         * จุดที่กล้องมองก็นุ่มเหมือนกัน
         */
        currentCameraTarget.current.x =
            THREE.MathUtils.lerp(
                currentCameraTarget.current.x,
                desiredCameraTarget.current.x,
                horizontalSmoothing,
            );

        currentCameraTarget.current.y =
            THREE.MathUtils.lerp(
                currentCameraTarget.current.y,
                desiredCameraTarget.current.y,
                verticalSmoothing,
            );

        currentCameraTarget.current.z = 0;

        /*
         * หมุนกล้องไปยัง Target
         */
        camera.lookAt(
            currentCameraTarget.current,
        );

        if (position.y < -10) {
            // ============================
            // Reset Ledge / Climb
            // ============================

            isHanging.current = false;
            isClimbing.current = false;
            isEnteringHang.current = false;
            hangEntryTimer.current = 0;
            isHangDropping.current = false;
            hangDropTimer.current = 0;
            isRunJumpingUp.current = false;
            runJumpUpTimer.current = 0;

            climbQueued.current = false;
            dropFromLedgeQueued.current = false;

            climbTimer.current = 0;
            highFallActive.current = false;
            isSliding.current = false;
            slideTimer.current = 0;
            crouchPressed.current = false;
            manualCrouchActive.current = false;
            standFromManualCrouchQueued.current =
                false;
            clearGroundTransition();
            groundTransitionStartedThisFrame.current =
                false;

            // ถ้าก่อนตกกำลัง Hang / Climb
            // Gravity อาจถูกปิดอยู่
            body.setGravityScale(
                1,
                true,
            );

            // ============================
            // Reset Position
            // ============================

            body.setTranslation(
                {
                    x: -10,
                    y: 2,
                    z: 0,
                },
                true,
            );

            body.setLinvel(
                {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                true,
            );

            setCrouching(false);
        }
    });

    return (
        <>
            <RigidBody
            ref={bodyRef}
            name="player"
            position={[-10, 3, 0]}
            colliders={false}
            lockRotations
            enabledTranslations={[
                true,
                true,
                false,
            ]}
            ccd
            canSleep={false}
            linearDamping={1}
        >
            {/* Collider ตอนยืน */}
            <CapsuleCollider
                ref={standingColliderRef}
                args={[
                    STANDING_HALF_HEIGHT,
                    PLAYER_RADIUS,
                ]}
                position={[
                    0,
                    STANDING_COLLIDER_OFFSET_Y,
                    0,
                ]}
                friction={0}
                frictionCombineRule={
                    rapier.CoefficientCombineRule.Min
                }
            />

            {/* Collider ตอนย่อ */}
            <CapsuleCollider
                ref={setCrouchingColliderRef}
                args={[
                    CROUCHING_HALF_HEIGHT,
                    PLAYER_RADIUS,
                ]}
                position={[
                    0,
                    CROUCH_COLLIDER_OFFSET_Y,
                    0,
                ]}
                friction={0}
                frictionCombineRule={
                    rapier.CoefficientCombineRule.Min
                }
            />

            {/* Ground Sensor */}
            <CuboidCollider
                args={[
                    0.22,
                    0.06,
                    0.22,
                ]}
                position={[
                    0,
                    -0.94,
                    0,
                ]}
                sensor
                onIntersectionEnter={({ other }) => {
                    // Interaction Sensor ต่าง ๆ
                    // ไม่นับเป็นพื้น
                    if (other.collider.isSensor()) {
                        return;
                    }

                    groundContacts.current += 1;
                }}

                onIntersectionExit={({ other }) => {
                    if (other.collider.isSensor()) {
                        return;
                    }

                    groundContacts.current =
                        Math.max(
                            0,
                            groundContacts.current - 1,
                        );
                }}
            />

            {/* Ceiling Sensor */}
            <CuboidCollider
                args={[
                    CEILING_SENSOR_HALF_WIDTH,
                    CEILING_SENSOR_HALF_HEIGHT,
                    CEILING_SENSOR_HALF_WIDTH,
                ]}
                position={[
                    0,
                    CEILING_SENSOR_OFFSET_Y,
                    0,
                ]}
                sensor
                onIntersectionEnter={({ other }) => {
                    // Sensor อื่นไม่ถือเป็นเพดาน
                    if (other.collider.isSensor()) {
                        return;
                    }

                    ceilingContacts.current += 1;
                }}

                onIntersectionExit={({ other }) => {
                    if (other.collider.isSensor()) {
                        return;
                    }

                    ceilingContacts.current =
                        Math.max(
                            0,
                            ceilingContacts.current - 1,
                        );
                }}
            />

            {/* ตัวละครจริง */}
            <group ref={visualRef}>
                <PlayerModel
                    animation={animation}
                />
            </group>
            </RigidBody>

            <RunDustEffect
                stateRef={playerEffectState}
            />

            <SpeedLinesEffect
                stateRef={playerEffectState}
            />
        </>
    );
}
