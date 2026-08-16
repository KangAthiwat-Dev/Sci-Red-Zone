import type {
    StairwayProgress,
} from "../stairwayTypes";

import {
    STAIRWAY_DOOR_POSITION,
    WIRE_PANEL_POSITION,
    KEYCARD_POSITION,
    type Vector3Tuple,
} from "../stairwayConfig";

export function getStairwayObjectiveTarget(
    progress:
        StairwayProgress,
): Vector3Tuple {
    // =============================
    // 1. ยังไม่เคยเจอประตู
    // → ไปประตู
    // =============================

    if (
        !progress.doorInspected
    ) {
        return (
            STAIRWAY_DOOR_POSITION
        );
    }

    // =============================
    // 2. เจอว่าไฟเสีย
    // → ไปแผงไฟ
    // =============================

    if (
        !progress.powerRestored
    ) {
        return (
            WIRE_PANEL_POSITION
        );
    }

    // =============================
    // 3. ซ่อมไฟแล้ว
    // แต่ยังไม่รู้ว่าต้องใช้ Keycard
    // → กลับประตู
    // =============================

    if (
        !progress.keycardRequested
    ) {
        return (
            STAIRWAY_DOOR_POSITION
        );
    }

    // =============================
    // 4. ต้องหา Keycard
    // =============================

    if (
        !progress.keycardCollected
    ) {
        return (
            KEYCARD_POSITION
        );
    }

    // =============================
    // 5. ได้ Keycard แล้ว
    // → กลับประตู
    // =============================

    return (
        STAIRWAY_DOOR_POSITION
    );
}