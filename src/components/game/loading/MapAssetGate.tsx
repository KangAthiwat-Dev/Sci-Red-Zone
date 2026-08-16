"use client";

import {
    useEffect,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

import {
    useGLTF,
} from "@react-three/drei";

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
            {children}
        </>
    );
}