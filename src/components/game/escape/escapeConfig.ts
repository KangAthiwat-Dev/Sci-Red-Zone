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

// แสดงคำเตือนก่อนปล่อย Zombie
export const ESCAPE_WARNING_DURATION =
  1800;