"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function GpuSpikeDebug() {
    const lastLogTimeRef = useRef(0);

    useFrame(({ gl }, delta) => {
        const frameMs =
            delta * 1000;

        /*
         * รายงานเฉพาะเฟรมที่ต่ำกว่า 30 FPS
         * และจำกัดไม่เกินหนึ่งครั้งต่อวินาที
         */
        if (frameMs < 34) {
            return;
        }

        const now = performance.now();

        if (now - lastLogTimeRef.current < 1000) {
            return;
        }

        lastLogTimeRef.current = now;

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
