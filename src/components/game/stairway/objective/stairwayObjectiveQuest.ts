import type {
    StairwayProgress,
} from "../stairwayTypes";

export type GameObjective = {
    title: string;
    description: string;
};

export function getStairwayObjectiveQuest(
    progress: StairwayProgress,
): GameObjective {
    // ==============================
    // ยังไม่เจอประตู
    // ==============================

    if (!progress.doorInspected) {
        return {
            title:
                "ตรวจสอบประตูทางออก",

            description:
                "ไปยังประตูที่ปลายทางเดิน",
        };
    }

    // ==============================
    // ประตูไฟเสีย
    // ==============================

    if (!progress.powerRestored) {
        return {
            title:
                "ซ่อมระบบไฟฟ้า",

            description:
                "ค้นหาแผงไฟและต่อสายไฟให้ถูกต้อง",
        };
    }

    // ==============================
    // ซ่อมแล้ว
    // แต่ยังไม่ได้กลับไปเจอประตู
    // ==============================

    if (
        !progress.keycardRequested
    ) {
        return {
            title:
                "กลับไปที่ประตู",

            description:
                "ตรวจสอบระบบประตูอีกครั้ง",
        };
    }

    // ==============================
    // ต้องหา Keycard
    // ==============================

    if (
        !progress.keycardCollected
    ) {
        return {
            title:
                "ค้นหา Keycard",

            description:
                "ค้นหา Keycard ภายในบริเวณนี้",
        };
    }

    // ==============================
    // พร้อมออก
    // ==============================

    return {
        title:
            "กลับไปที่ประตูทางออก",

        description:
            "ใช้ Keycard และกด E ค้างเพื่อเปิดประตู",
    };
}