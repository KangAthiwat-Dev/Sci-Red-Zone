"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function FacultyHallCollision() {
    // ============================
    // Visual Map
    // ============================

    const visual = useGLTF(
        "/maps/faculty-hall/visual.glb",
    );

    // ============================
    // Collision Map
    // ============================

    const collision = useGLTF(
        "/maps/faculty-hall/collision.glb",
    );

    // ============================
    // Shadow
    // ============================

    useEffect(() => {
        visual.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }, [visual.scene]);

    return (
        <>
            {/* =====================
                Visual Map
                ไม่มี Physics
            ===================== */}

            <primitive
                object={visual.scene}
            />

            {/* =====================
                Collision Map
                มี Physics แต่ซ่อน Mesh
            ===================== */}

            <RigidBody
                type="fixed"
                colliders="trimesh"
                includeInvisible
            >
                <primitive
                    object={collision.scene}
                    visible={false}
                />
            </RigidBody>
        </>
    );
}

// ============================
// Preload
// ============================

useGLTF.preload(
    "/maps/faculty-hall/visual.glb",
);

useGLTF.preload(
    "/maps/faculty-hall/collision.glb",
);