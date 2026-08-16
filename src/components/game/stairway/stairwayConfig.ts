export type Vector3Tuple = [
    number,
    number,
    number,
];

// ========================================
// Door
// ========================================

export const STAIRWAY_DOOR_POSITION:
    Vector3Tuple = [
    114,
    2,
    0,
];

// Sensor ใหญ่แค่ไหน
// ค่านี้เป็น HALF EXTENTS
export const STAIRWAY_DOOR_SENSOR_SIZE:
    Vector3Tuple = [
    1,
    1,
    1,
];

// ========================================
// Electrical Panel
// ========================================

export const WIRE_PANEL_POSITION:
    Vector3Tuple = [
    80,
    3.25,
    -2.5,
];

export const WIRE_PANEL_SENSOR_SIZE:
    Vector3Tuple = [
    1.2,
    1.5,
    3,
];

// ========================================
// Keycard
// ========================================

/*
 * ตำแหน่งนี้คุณเปลี่ยนเองทีหลังได้
 * ว่าจะเอาไปซ่อนตรงไหน
 */
export const KEYCARD_POSITION:
    Vector3Tuple = [
    84.8,
    1.4,
    -1.5,
];

export const KEYCARD_ROTATION:
    Vector3Tuple = [
    -Math.PI / 3,
    0,
    -0.15,
];

export const KEYCARD_SCALE =
    1;

export const KEYCARD_SENSOR_SIZE:
    Vector3Tuple = [
    1,
    1,
    1,
];