"use client";

import {
    useEffect,
    useLayoutEffect,
    useMemo,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

import {
    useGLTF,
    useTexture,
} from "@react-three/drei";

import {
    optimizeSceneDecorationTexture,
} from "../background/sceneTextureOptimization";

import {
    getMapDecorationAssetUrls,
} from "./gameAssetCache";

// ========================================
// Types
// ========================================

type MapAssetGateProps = {
    mapId: string;

    setReady: Dispatch<
        SetStateAction<boolean>
    >;

    children: ReactNode;
};

type DecorationTextureAssetProps = {
    src: string;
};

function DecorationTextureAsset({
    src,
}: DecorationTextureAssetProps) {
    const texture = useTexture(src);

    /* ตั้งค่าก่อน useTexture ส่งภาพขึ้น GPU */
    useLayoutEffect(() => {
        optimizeSceneDecorationTexture(
            texture,
        );
    }, [texture]);

    return null;
}

// ========================================
// Map Asset Gate
// ========================================

export default function MapAssetGate({
    mapId,
    setReady,
    children,
}: MapAssetGateProps) {
    /*
     * useGLTF จะ Suspense ตรงนี้
     * จนกว่าไฟล์ทั้ง 2 จะโหลดเสร็จ
     */
    const visual =
        useGLTF(
            `/maps/${mapId}/visual.glb`,
        );

    const collision =
        useGLTF(
            `/maps/${mapId}/collision.glb`,
        );

    const decorationUrls =
        useMemo(
            () =>
                getMapDecorationAssetUrls(
                    mapId,
                ),
            [mapId],
        );

    // ========================================
    // Map Assets Ready
    // ========================================

    useEffect(() => {
        if (
            !visual.scene ||
            !collision.scene
        ) {
            return;
        }

        /*
         * Component มาถึง useEffect ได้
         * แปลว่า GLB ทั้งสองโหลดเสร็จแล้ว
         */
        setReady(true);
    }, [
        mapId,
        visual.scene,
        collision.scene,
        setReady,
    ]);

    return (
        <>
            {decorationUrls.map(
                (src) => (
                    <DecorationTextureAsset
                        key={src}
                        src={src}
                    />
                ),
            )}

            {children}
        </>
    );
}
