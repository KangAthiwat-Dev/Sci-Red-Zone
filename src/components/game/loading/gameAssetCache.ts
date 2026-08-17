import {
    useGLTF,
    useTexture,
} from "@react-three/drei";

import {
    SCENE_DRESSING,
    type SceneDecorationMap,
} from "../background/setDressingConfig";

import {
    ZOMBIE_MODEL_URL,
} from "../enemies/zombie/zombieConfig";

type SceneMapId =
    keyof SceneDecorationMap;

// ========================================
// Map ID Guard
// ========================================

function isSceneMapId(
    mapId: string,
): mapId is SceneMapId {
    return Object.prototype.hasOwnProperty.call(
        SCENE_DRESSING,
        mapId,
    );
}

// ========================================
// Decoration Cache
// ========================================

function preloadDecorationAssets(
    mapId: string,
) {
    if (!isSceneMapId(mapId)) {
        return;
    }

    const decorations =
        SCENE_DRESSING[mapId];

    /*
     * บางรูปถูกใช้หลายครั้งใน Map เดียวกัน
     * เช่น window / pipe
     *
     * ใช้ Set เพื่อไม่สั่ง preload URL เดิมซ้ำ
     */
    const textureUrls =
        new Set(
            decorations.map(
                (decoration) =>
                    decoration.src,
            ),
        );

    for (
        const textureUrl
        of textureUrls
    ) {
        useTexture.preload(
            textureUrl,
        );
    }
}

// ========================================
// Map Asset Cache
// ========================================

export function preloadMapAssets(
    mapId: string,
) {
    /*
     * 3D Visual
     */
    useGLTF.preload(
        `/maps/${mapId}/visual.glb`,
    );

    /*
     * Physics Collision
     */
    useGLTF.preload(
        `/maps/${mapId}/collision.glb`,
    );

    /*
     * 2D Decorations
     */
    preloadDecorationAssets(
        mapId,
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