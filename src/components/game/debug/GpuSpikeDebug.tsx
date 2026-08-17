"use client";

import { useFrame } from "@react-three/fiber";

export default function GpuSpikeDebug() {
    useFrame(({ gl }, delta) => {
        const frameMs =
            delta * 1000;

        /*
         * เกมปกติ 120 FPS
         * ≈ 8.3 ms
         *
         * log เฉพาะเฟรมที่ spike
         */
        if (frameMs < 14) {
            return;
        }

        console.log(
            "[GPU FRAME SPIKE]",
            {
                frameMs:
                    frameMs.toFixed(2),

                calls:
                    gl.info.render
                        .calls,

                triangles:
                    gl.info.render
                        .triangles,

                textures:
                    gl.info.memory
                        .textures,

                geometries:
                    gl.info.memory
                        .geometries,

                programs:
                    gl.info.programs
                        ?.length,
            },
        );
    });

    return null;
}