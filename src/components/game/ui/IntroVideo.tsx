"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

type IntroVideoProps = {
    active: boolean;

    onReady: () => void;

    onComplete: () => void;
};

export default function IntroVideo({
    active,
    onReady,
    onComplete,
}: IntroVideoProps) {
    const videoRef =
        useRef<HTMLVideoElement>(
            null,
        );

    const readyReportedRef =
        useRef(false);

    const [
        needsInteraction,
        setNeedsInteraction,
    ] = useState(false);

    const [
        buffering,
        setBuffering,
    ] = useState(false);

    // ========================================
    // Play
    // ========================================

    const playVideo =
        useCallback(async () => {
            if (!active) {
                return;
            }

            const video =
                videoRef.current;

            if (!video) {
                return;
            }

            /*
             * ยังโหลดไม่พอ
             */
            if (
                video.readyState < 3
            ) {
                setBuffering(
                    true,
                );

                return;
            }

            video.muted = false;

            video.volume = 1;

            try {
                await video.play();

                setBuffering(
                    false,
                );

                setNeedsInteraction(
                    false,
                );
            } catch {
                /*
                 * Browser block autoplay
                 * ที่มีเสียง
                 */
                setNeedsInteraction(
                    true,
                );
            }
        }, [
            active,
        ]);

    // ========================================
    // เริ่ม Intro เมื่อ phase เปลี่ยน
    // ========================================

    useEffect(() => {
        if (!active) {
            return;
        }

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.currentTime = 0;

        void playVideo();
    }, [
        active,
        playVideo,
    ]);

    // ========================================
    // Video พร้อม
    // ========================================

    function handleCanPlay() {
        setBuffering(
            false,
        );

        /*
         * แจ้ง GameFlow แค่ครั้งเดียว
         */
        if (
            !readyReportedRef.current
        ) {
            readyReportedRef.current =
                true;

            onReady();
        }

        /*
         * ถ้าเข้าหน้า Intro แล้ว
         * เล่นทันที
         */
        if (active) {
            void playVideo();
        }
    }

    // ========================================
    // Browser ขอ Interaction
    // ========================================

    async function handlePlayIntro() {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.muted = false;

        video.volume = 1;

        try {
            await video.play();

            setNeedsInteraction(
                false,
            );

            setBuffering(
                false,
            );
        } catch (error) {
            console.error(
                "Intro video play failed:",
                error,
            );
        }
    }

    return (
        <div
            className={`
                fixed
                inset-0
                z-[10000]
                flex
                items-center
                justify-center
                bg-black
                transition-opacity
                duration-300

                ${
                    active
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }
            `}
        >
            <video
                ref={videoRef}

                src="/videos/intro.MOV"

                playsInline

                preload="auto"

                onCanPlay={
                    handleCanPlay
                }

                onWaiting={() => {
                    if (active) {
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
                    onComplete
                }

                className="
                    h-full
                    w-full
                    bg-black
                    object-contain
                "
            />

            {/* ======================
                Buffering
            ====================== */}

            {active &&
                buffering && (
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
                                gap-4
                            "
                        >
                            <div
                                className="
                                    h-8
                                    w-8
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-white/20
                                    border-t-white
                                "
                            />

                            <div
                                className="
                                    text-xs
                                    tracking-[0.25em]
                                    text-white/50
                                "
                            >
                                LOADING VIDEO...
                            </div>
                        </div>
                    </div>
                )}

            {/* ======================
                Browser Block Sound
            ====================== */}

            {active &&
                needsInteraction && (
                    <button
                        type="button"
                        onClick={
                            handlePlayIntro
                        }
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            border
                            border-white/30
                            bg-black/80
                            px-8
                            py-4
                            text-sm
                            font-bold
                            tracking-[0.2em]
                            text-white
                            backdrop-blur-sm
                        "
                    >
                        PLAY INTRO
                    </button>
                )}

            {/* ======================
                Skip
            ====================== */}

            {active && (
                <button
                    type="button"
                    onClick={
                        onComplete
                    }
                    className="
                        absolute
                        bottom-8
                        right-8
                        rounded-md
                        border
                        border-white/20
                        bg-black/40
                        px-5
                        py-2
                        text-xs
                        tracking-[0.25em]
                        text-white/60
                        backdrop-blur-sm
                        transition
                        hover:border-white/50
                        hover:text-white
                    "
                >
                    SKIP
                </button>
            )}
        </div>
    );
}