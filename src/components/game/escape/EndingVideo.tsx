"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

type EndingVideoProps = {
    visible: boolean;

    onEnded?: () => void;
};

export default function EndingVideo({
    visible,
    onEnded,
}: EndingVideoProps) {
    const videoRef =
        useRef<HTMLVideoElement>(
            null,
        );

    const startedRef =
        useRef(false);

    const [
        ready,
        setReady,
    ] = useState(false);

    const [
        buffering,
        setBuffering,
    ] = useState(false);

    // ========================================
    // Play Ending
    // ========================================

    const playEnding =
        useCallback(async () => {
            if (!visible) {
                return;
            }

            if (
                startedRef.current
            ) {
                return;
            }

            const video =
                videoRef.current;

            if (!video) {
                return;
            }

            /*
             * ยัง preload ไม่ทัน
             */
            if (
                video.readyState < 3
            ) {
                setBuffering(
                    true,
                );

                return;
            }

            startedRef.current =
                true;

            video.currentTime = 0;

            video.muted = false;

            video.volume = 1;

            try {
                await video.play();

                setBuffering(
                    false,
                );
            } catch (error) {
                console.warn(
                    "[EndingVideo] play failed:",
                    error,
                );

                /*
                 * ถ้าเล่นไม่ได้
                 * ให้ UI Loading ยังค้าง
                 */
                startedRef.current =
                    false;

                setBuffering(
                    true,
                );
            }
        }, [
            visible,
        ]);

    // ========================================
    // Visible Change
    // ========================================

    useEffect(() => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        if (!visible) {
            startedRef.current =
                false;

            /*
             * ยังไม่เล่น
             * แต่ preload ต่อได้
             */
            video.pause();

            return;
        }

        void playEnding();
    }, [
        visible,
        playEnding,
    ]);

    // ========================================
    // Video พร้อม
    // ========================================

    function handleCanPlay() {
        setReady(
            true,
        );

        if (visible) {
            void playEnding();
        }
    }

    return (
        <div
            className={`
                fixed
                inset-0
                z-[10000]
                bg-black
                transition-opacity
                duration-500

                ${
                    visible
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }
            `}
        >
            {/* ======================
                Ending Video

                สำคัญ:
                video อยู่ใน DOM ตลอดเกม
            ====================== */}

            <video
                ref={videoRef}

                src="/videos/ending.MOV"

                playsInline

                preload="auto"

                onCanPlay={
                    handleCanPlay
                }

                onWaiting={() => {
                    if (visible) {
                        setBuffering(
                            true,
                        );
                    }
                }}

                onPlaying={() => {
                    setBuffering(
                        false,
                    );
                }}

                onEnded={
                    onEnded
                }

                className="
                    h-full
                    w-full
                    bg-black
                    object-contain
                "
            />

            {/* ======================
                Loading / Buffering
            ====================== */}

            {visible &&
                (
                    buffering ||
                    !ready
                ) && (
                    <div
                        className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-black
                        "
                    >
                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                gap-5
                            "
                        >
                            <div
                                className="
                                    relative
                                    h-10
                                    w-10
                                "
                            >
                                <div
                                    className="
                                        absolute
                                        inset-0
                                        rounded-full
                                        border-2
                                        border-white/10
                                    "
                                />

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-transparent
                                        border-t-white
                                    "
                                />
                            </div>

                            <div
                                className="
                                    text-xs
                                    tracking-[0.3em]
                                    text-white/45
                                "
                            >
                                PREPARING VIDEO...
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}