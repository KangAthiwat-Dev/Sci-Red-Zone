"use client";

import {
    useEffect,
} from "react";

import {
    useThree,
} from "@react-three/fiber";

import * as THREE from "three";

type GpuWarmupProps = {
    enabled?: boolean;
};

const TEXTURE_KEYS = [
    "map",
    "normalMap",
    "roughnessMap",
    "metalnessMap",
    "aoMap",
    "emissiveMap",
    "alphaMap",
    "bumpMap",
    "lightMap",
] as const;

export default function GpuWarmup({
    enabled = true,
}: GpuWarmupProps) {
    const {
        gl,
        scene,
        camera,
    } = useThree();

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        async function warmup() {
            /*
             * 1. Upload textures
             * เข้า GPU ล่วงหน้า
             */
            scene.traverse(
                (object) => {
                    if (
                        !(
                            object instanceof
                            THREE.Mesh
                        )
                    ) {
                        return;
                    }

                    const materials =
                        Array.isArray(
                            object.material,
                        )
                            ? object.material
                            : [
                                  object.material,
                              ];

                    for (
                        const material
                        of materials
                    ) {
                        for (
                            const key
                            of TEXTURE_KEYS
                        ) {
                            const texture =
                                (
                                    material as unknown as
                                        Record<
                                            string,
                                            unknown
                                        >
                                )[key];

                            if (
                                texture instanceof
                                THREE.Texture
                            ) {
                                gl.initTexture(
                                    texture,
                                );
                            }
                        }
                    }
                },
            );

            /*
             * 2. Compile Shader
             * ล่วงหน้า
             */
            await gl.compileAsync(
                scene,
                camera,
            );

            if (cancelled) {
                return;
            }

            console.log(
                "[GPU] warmup complete",
            );
        }

        void warmup();

        return () => {
            cancelled = true;
        };
    }, [
        enabled,
        gl,
        scene,
        camera,
    ]);

    return null;
}