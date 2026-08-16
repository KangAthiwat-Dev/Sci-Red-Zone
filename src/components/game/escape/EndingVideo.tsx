"use client";

import {
    useEffect,
    useRef,
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

    useEffect(() => {
        if (!visible) {
            return;
        }

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.currentTime = 0;

        /*
         * พยายามเล่นทันที
         */
        const playPromise =
            video.play();

        playPromise?.catch(
            (error) => {
                console.warn(
                    "[EndingVideo] autoplay failed:",
                    error,
                );
            },
        );
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-10000
                bg-black
            "
        >
            <video
                ref={videoRef}
                src="/videos/ending.MOV"
                autoPlay
                playsInline
                preload="auto"
                onEnded={onEnded}
                className="
                    h-full
                    w-full
                    object-contain
                "
            />
        </div>
    );
}