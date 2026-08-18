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
    // Start (มุมเริ่มต้น - ซูมใกล้)
    {
        id: "hall-start",
        mapId: "faculty-hall",
        minX: -19.66,
        maxX: -7.0, // <-- สิ้นสุดที่ -7.0
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 35,
        transitionSpeed: 1.5,
    },
    // Jump (ค่อยๆ Zoom Out กว้างขึ้นตอนเริ่มวิ่ง/กระโดด)
    {
        id: "hall-jump",
        mapId: "faculty-hall",
        minX: -7.0, // <-- ต่อจาก -7.0 ทันที (ไม่มี Gap คั่นกลาง)
        maxX: 10,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 45, // มุมกว้างขึ้น
        transitionSpeed: 1.5, // <-- ปรับเป็น 1.5 - 1.8 จะค่อยๆ ถอยออกนุ่มนวลมาก
    },
    {
        id: "hall-jump",
        mapId: "faculty-hall",
        minX: 10, // <-- ต่อจาก -7.0 ทันที (ไม่มี Gap คั่นกลาง)
        maxX: 20,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 40, // มุมกว้างขึ้น
        transitionSpeed: 1.5, // <-- ปรับเป็น 1.5 - 1.8 จะค่อยๆ ถอยออกนุ่มนวลมาก
    },
    // Slide In
    {
        id: "hall-wide",
        mapId: "faculty-hall",
        minX: 20,
        maxX: 29.15,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 35,
        cameraXOffset: -6,
        transitionSpeed: 1.5,
    },
    // Slide Out
    {
        id: "hall-wide",
        mapId: "faculty-hall",
        minX: 29.15,
        maxX: 35,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 45,
        transitionSpeed: 1.5,
    },
    // Push
    {
        id: "hall-machine",
        mapId: "faculty-hall",
        minX: 35,
        maxX: 58,
        /*
         * กล้องเยื้องไปทางซ้าย
         * ทำให้เห็นพื้นที่ข้างหน้า
         */
        cameraXOffset: -2,
        targetXOffset: 1.5,
        cameraHeight: 4.5,
        cameraDistance: 12,
        targetHeight: 1.4,
        fov: 38,
        lookAheadScale: 0.4,
        transitionSpeed: 1.5,
    },
    // Climp
    {
        id: "hall-machine",
        mapId: "faculty-hall",
        minX: 62.5,
        maxX: 72,
        /*
         * กล้องเยื้องไปทางซ้าย
         * ทำให้เห็นพื้นที่ข้างหน้า
         */
        cameraXOffset: 4,
        targetXOffset: 1.5,
        cameraHeight: 4.5,
        cameraDistance: 12,
        targetHeight: 1.4,
        fov: 44,
        lookAheadScale: 0.4,
        transitionSpeed: 1.5,
    },

    // ====================================
    // STAIRWAY
    // ====================================
    // Start (มุมเริ่มต้น - ซูมใกล้)
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX: -14.66,
        maxX: 0,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 35,
        transitionSpeed: 1.5,
    },
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX: 0,
        maxX: 20,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 45,
        transitionSpeed: 1.5,
    },
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX: 20,
        maxX: 65,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.5,
        fov: 50,
        cameraXOffset: -4,
        lookAheadScale: 0.5,
        transitionSpeed: 1.5,
    },
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX: 65,
        maxX: 75,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.5,
        fov: 50,
        cameraXOffset: 4,
        lookAheadScale: 0.5,
        transitionSpeed: 1.5,
    },
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX: 75,
        maxX: 87,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.5,
        fov: 35,
        cameraXOffset: -5,
        lookAheadScale: 0.5,
        transitionSpeed: 1.5,
    },
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX:87,
        maxX: 106,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.5,
        fov: 45,
        lookAheadScale: 0.5,
        transitionSpeed: 1.5,
    },
    {
        id: "stairway-panel",
        mapId: "stairway",
        minX: 106,
        maxX: 115,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.5,
        fov: 32,
        cameraXOffset: -12,
        lookAheadScale: 0.5,
        transitionSpeed: 1.5,
    },

    // ====================================
    // LABORATORY
    // ====================================
    // Start (มุมเริ่มต้น - ซูมใกล้)
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: -14.66,
        maxX: 0,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 35,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 0,
        maxX: 8.5,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 45,
        cameraXOffset: -2,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 8.5,
        maxX: 25,
        cameraHeight: 6,
        cameraDistance: 16,
        targetHeight: 1.8,
        fov: 35,
        cameraXOffset: 4,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 25,
        maxX: 44,
        cameraHeight: 8,
        cameraDistance: 16,
        targetHeight: 1.8,
        fov: 35,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 44,
        maxX: 72,
        cameraHeight: 6,
        cameraDistance: 16,
        targetHeight: 1.8,
        fov: 35,
        cameraXOffset: 4,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 72,
        maxX: 85,
        cameraHeight: 8,
        cameraDistance: 16,
        targetHeight: 1.8,
        fov: 35,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 85,
        maxX: 110,
        cameraHeight: 6,
        cameraDistance: 16,
        targetHeight: 1.8,
        fov: 35,
        cameraXOffset: 4,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 110,
        maxX: 134,
        cameraHeight: 6,
        cameraDistance: 16,
        targetHeight: 1.8,
        fov: 45,
        transitionSpeed: 1.5,
    },
    {
        id: "lab-wide",
        mapId: "laboratory",
        minX: 134,
        maxX: 145,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.5,
        fov: 32,
        cameraXOffset: -12,
        lookAheadScale: 0.5,
        transitionSpeed: 1.5,
    },

    // ====================================
    // ESCAPE
    // ====================================
     // Start (มุมเริ่มต้น - ซูมใกล้)
    {
        id: "escape-control",
        mapId: "escape",
        minX: -14.66,
        maxX: 0,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 35,
        transitionSpeed: 1.5,
    },
    {
        id: "escape-control",
        mapId: "escape",
        minX: 0,
        maxX: 13,
        cameraHeight: 5.5,
        cameraDistance: 15,
        targetHeight: 1.4,
        fov: 45,
        cameraXOffset: -2,
        transitionSpeed: 1.5,
    },
    {
        id: "escape-control",
        mapId: "escape",
        minX: 13,
        maxX: 25,
        cameraHeight: 2,
        cameraDistance: 14,
        targetHeight: 1.4,
        fov: 40,
        transitionSpeed: 1.5,
    },
    {
        id: "escape-control",
        mapId: "escape",
        minX: 25,
        maxX: 50,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.4,
        fov: 50,
        cameraXOffset: 4,
        transitionSpeed: 1.5,
    },
    {
        id: "escape-control",
        mapId: "escape",
        minX: 50,
        maxX: 69,
        cameraHeight: 3,
        cameraDistance: 14,
        targetHeight: 1.4,
        fov: 45,
        cameraXOffset: -6,
        transitionSpeed: 1.5,
    },
    {
        id: "escape-control",
        mapId: "escape",
        minX: 69,
        maxX: 99,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.4,
        fov: 50,
        cameraXOffset: -2,
        transitionSpeed: 1.5,
    },
    {
        id: "escape-control",
        mapId: "escape",
        minX: 99,
        maxX: 120,
        cameraHeight: 5,
        cameraDistance: 14,
        targetHeight: 1.4,
        fov: 32,
        cameraXOffset: -12,
        transitionSpeed: 1.5,
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