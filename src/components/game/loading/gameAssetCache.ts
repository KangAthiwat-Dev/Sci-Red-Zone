import {
    useGLTF,
} from "@react-three/drei";

import {
    ZOMBIE_MODEL_URL,
} from "../enemies/zombie/zombieConfig";

// ========================================
// Map Asset Cache
// ========================================

export function preloadMapAssets(
    mapId: string,
) {
    useGLTF.preload(
        `/maps/${mapId}/visual.glb`,
    );

    useGLTF.preload(
        `/maps/${mapId}/collision.glb`,
    );
}

// ========================================
// Enemy Asset Cache
// ========================================

export function preloadEnemyAssets() {
    useGLTF.preload(
        ZOMBIE_MODEL_URL,
    );
}