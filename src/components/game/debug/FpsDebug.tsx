"use client";

import {
    useEffect,
    useRef,
} from "react";

export default function FpsDebug() {
    const textRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    useEffect(() => {
        let frameId = 0;

        let lastTime =
            performance.now();

        let frameCount = 0;

        let lastDisplayTime =
            lastTime;

        let worstFrame = 0;

        function update(
            currentTime: number,
        ) {
            const frameTime =
                currentTime -
                lastTime;

            lastTime =
                currentTime;

            frameCount += 1;

            worstFrame =
                Math.max(
                    worstFrame,
                    frameTime,
                );

            const elapsed =
                currentTime -
                lastDisplayTime;

            /*
             * Update UI แค่ 4 ครั้ง/วินาที
             * ไม่ setState
             */
            if (
                elapsed >= 250
            ) {
                const fps =
                    Math.round(
                        (frameCount *
                            1000) /
                            elapsed,
                    );

                if (
                    textRef.current
                ) {
                    textRef.current
                        .textContent =
                        `FPS ${fps} | Frame ${worstFrame.toFixed(
                            1,
                        )} ms`;

                    /*
                     * แค่ debug
                     */
                    textRef.current.style.color =
                        fps >= 50
                            ? "#86efac"
                            : fps >= 30
                              ? "#fde047"
                              : "#f87171";
                }

                frameCount = 0;
                worstFrame = 0;
                lastDisplayTime =
                    currentTime;
            }

            frameId =
                requestAnimationFrame(
                    update,
                );
        }

        frameId =
            requestAnimationFrame(
                update,
            );

        return () => {
            cancelAnimationFrame(
                frameId,
            );
        };
    }, []);

    return (
        <div
            ref={textRef}
            className="
                pointer-events-none
                fixed
                left-3
                top-3
                z-99999
                rounded
                bg-black/80
                px-3
                py-2
                font-mono
                text-sm
                text-white
            "
        >
            FPS -- | Frame -- ms
        </div>
    );
}