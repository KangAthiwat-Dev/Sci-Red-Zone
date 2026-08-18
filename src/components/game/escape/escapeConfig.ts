export const ESCAPE_CONTROL_POSITION:
  [number, number, number] = [
    22,
    2,
    0,
  ];

export const ESCAPE_CONTROL_TRIGGER_SIZE:
  [number, number, number] = [
    1.5,
    2,
    1.5,
  ];

export const ESCAPE_ALARM_DURATION = 1800;

// ========================================
// Escape Bio Scan
// ========================================

// UI จะลอยเหนือ Control Console
export const ESCAPE_SCAN_UI_POSITION: [
  number,
  number,
  number,
] = [
  ESCAPE_CONTROL_POSITION[0],
  ESCAPE_CONTROL_POSITION[1] + 2.5,
  ESCAPE_CONTROL_POSITION[2],
];

// 100% → 10%
export const ESCAPE_SCAN_DURATION =
  3500;

export const ESCAPE_SCAN_COMPLETE_PERCENTAGE =
  10;

// แสดงคำเตือนก่อนปล่อย Zombie
export const ESCAPE_WARNING_DURATION =
  1800;

// ========================================
// Escape Alert / Chase
// ========================================

export const ESCAPE_ALERT_SOUND_SRC =
  "/sounds/effect/alert-web.mp3";

export const ESCAPE_ALERT_FALLBACK_DURATION =
  2200;

export const ESCAPE_CHASE_NORMAL_ZOMBIE_POSITION:
  [number, number, number] = [
    5,
    3,
    0,
  ];

export const ESCAPE_CHASE_CRAWLER_ZOMBIE_POSITION:
  [number, number, number] = [
    90,
    5,
    0,
  ];

export const ESCAPE_ZOMBIE_INTRO_CAMERA_POSITION:
  [number, number, number] = [
    10,
    4.8,
    13,
  ];

export const ESCAPE_ZOMBIE_INTRO_CAMERA_TARGET:
  [number, number, number] = [
    5,
    1.8,
    0,
  ];

export const ESCAPE_ZOMBIE_INTRO_CAMERA_FOV =
  20;

export const ESCAPE_ZOMBIE_INTRO_CAMERA_SPEED =
  4.5;
