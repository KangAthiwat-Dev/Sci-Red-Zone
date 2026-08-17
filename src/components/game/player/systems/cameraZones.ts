export type CameraZone = {
    id: string;

    mapId: string;

    /*
     * ช่วงตำแหน่ง X
     * ที่กล้องนี้ทำงาน
     */
    minX: number;
    maxX: number;

    /*
     * กล้องตาม Player
     */
    cameraHeight?: number;
    cameraDistance?: number;

    /*
     * จุดที่กล้องมอง
     */
    targetHeight?: number;
    targetZ?: number;

    /*
     * เลื่อนกล้อง/Target
     * ออกจาก Player
     */
    cameraXOffset?: number;
    targetXOffset?: number;

    /*
     * ถ้าใส่ค่าเหล่านี้
     * กล้องจะไม่ตาม Player ในแกนนั้น
     *
     * เหมาะกับมุม Cinematic
     */
    fixedCameraX?: number;
    fixedCameraY?: number;

    fixedTargetX?: number;
    fixedTargetY?: number;

    /*
     * Zoom
     *
     * FOV น้อย = Zoom เข้า
     * FOV มาก = Zoom ออก
     */
    fov?: number;

    /*
     * 0 = ปิด Look Ahead
     * 1 = ปกติ
     * > 1 = มองล่วงหน้ามากขึ้น
     */
    lookAheadScale?: number;

    /*
     * ความเร็วตอนเปลี่ยนมุม
     */
    transitionSpeed?: number;
};

// ========================================
// Camera Zones
// ========================================

export const CAMERA_ZONES: CameraZone[] = [
    // ====================================
    // FACULTY HALL
    // ====================================

    {
        id: "hall-wide",
        mapId: "faculty-hall",

        minX: 15,
        maxX: 30,

        cameraHeight: 5.5,
        cameraDistance: 15,

        targetHeight: 1.4,

        fov: 50,

        transitionSpeed: 4,
    },

    {
        id: "hall-machine",

        mapId: "faculty-hall",

        minX: 35,
        maxX: 48,

        /*
         * กล้องเยื้องไปทางซ้าย
         * ทำให้เห็นพื้นที่ข้างหน้า
         */
        cameraXOffset: -2,

        targetXOffset: 1.5,

        cameraHeight: 4.5,
        cameraDistance: 12,

        targetHeight: 1.4,

        fov: 43,

        lookAheadScale: 0.4,

        transitionSpeed: 5,
    },

    // ====================================
    // STAIRWAY
    // ====================================

    {
        id: "stairway-panel",

        mapId: "stairway",

        minX: 20,
        maxX: 32,

        cameraHeight: 5,
        cameraDistance: 14,

        targetHeight: 1.5,

        fov: 46,

        lookAheadScale: 0.5,

        transitionSpeed: 5,
    },

    // ====================================
    // LABORATORY
    // ====================================

    {
        id: "lab-wide",

        mapId: "laboratory",

        minX: 5,
        maxX: 25,

        cameraHeight: 6,
        cameraDistance: 16,

        targetHeight: 1.8,

        fov: 50,

        transitionSpeed: 4,
    },

    // ====================================
    // ESCAPE
    // ====================================

    {
        id: "escape-control",

        mapId: "escape",

        minX: 5,
        maxX: 18,

        cameraHeight: 5,

        cameraDistance: 14,

        targetHeight: 1.4,

        fov: 45,

        transitionSpeed: 5,
    },
];

// ========================================
// Find Active Zone
// ========================================

export function getCameraZone(
    mapId: string,
    playerX: number,
) {
    return CAMERA_ZONES.find(
        (zone) =>
            zone.mapId === mapId &&
            playerX >= zone.minX &&
            playerX <= zone.maxX,
    );
}