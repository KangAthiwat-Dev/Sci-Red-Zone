// ========================================
// Model
// ========================================

export const ZOMBIE_MODEL_URL =
    "/models/enemies/zombie.glb";

export const ZOMBIE_MODEL_SCALE =
    1.6;

// ปรับตัวนี้ตัวเดียวถ้า Zombie
// หันผิดด้าน
export const ZOMBIE_FACE_RIGHT_Y =
    Math.PI / 2;

// ========================================
// Animation Clips
// ========================================

export const ZOMBIE_CLIPS = {
    WALK: "Walk",
    RUN: "Run",
    ATTACK: "Attack",
    CRAWL: "Clawn",
    SCREAM: "Scream",
} as const;

// ========================================
// Movement
// ========================================

export const ZOMBIE_WALK_SPEED =
    3.6;

export const ZOMBIE_RUN_SPEED =
    9.8;

export const ZOMBIE_CRAWL_SPEED =
    1.8;

// ========================================
// Animation Speed
// ========================================

/*
 * 1   = ความเร็วเดิม
 * 0.8 = ช้าลง
 * 0.6 = ช้าลงเยอะ
 * 1.2 = เร็วขึ้น
 */

export const ZOMBIE_ATTACK_ANIMATION_SPEED =
    0.65;

export const ZOMBIE_ATTACK_DURATION =
    1.8;

// ========================================
// Detection
// ========================================

export const ZOMBIE_DETECTION_RADIUS =
    10;

export const ZOMBIE_ATTACK_RANGE =
    1.35;

// ========================================
// Attack
// ========================================

export const ZOMBIE_ATTACK_DAMAGE =
    40;

// ตอนไหนของ Animation
// ที่ถือว่า "ตีโดน"
//
// 0.45 = 45% ของ Animation
export const ZOMBIE_ATTACK_HIT_RATIO =
    0.45;

// ========================================
// Physics
// ========================================

export const ZOMBIE_COLLIDER_RADIUS =
    0.38;

export const ZOMBIE_COLLIDER_HALF_HEIGHT =
    0.65;

export const ZOMBIE_CRAWLER_COLLIDER_RADIUS =
    0.35;

export const ZOMBIE_CRAWLER_COLLIDER_HALF_HEIGHT =
    0.2;

// ========================================
// Model Ground Offset
// ========================================

/*
 * ถ้า Zombie ลอยจากพื้น
 * ให้ลดค่านี้ลง เช่น
 *
 * -0.8
 * -1.0
 * -1.1
 *
 * ยิ่งติดลบมาก โมเดลยิ่งลงต่ำ
 */
export const ZOMBIE_MODEL_OFFSET_Y = 0;

/*
 * ปรับเฉพาะท่าคลาน
 *
 * 0    = เริ่มต้น
 * 0.1  = ยก crawler ขึ้น
 * -0.1 = ลด crawler ลง
 */
export const ZOMBIE_CRAWL_MODEL_OFFSET_Y =
    0;