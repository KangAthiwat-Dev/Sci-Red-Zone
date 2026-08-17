"use client";

import {
    useState,
} from "react";

import GameScene from "./GameScene";

import MainMenu from "./ui/MainMenu";
import IntroVideo from "./ui/IntroVideo";

type GamePhase =
    | "menu"
    | "intro"
    | "game";

export default function GameFlow() {
    const [
        phase,
        setPhase,
    ] = useState<GamePhase>(
        "menu",
    );

    const [
        introReady,
        setIntroReady,
    ] = useState(false);

    return (
        <>
            {/* =========================
                MAIN MENU
            ========================= */}

            {phase === "menu" && (
                <MainMenu
                    onStart={() => {
                        /*
                         * กันไว้ชั้นหนึ่ง
                         * Intro ยังไม่พร้อมห้ามเข้า
                         */
                        if (!introReady) {
                            return;
                        }

                        setPhase(
                            "intro",
                        );
                    }}
                />
            )}

            {/* =========================
                INTRO VIDEO

                สำคัญ:
                Mount ตั้งแต่หน้า Menu
                เพื่อให้ preload
            ========================= */}

            {phase !== "game" && (
                <IntroVideo
                    active={
                        phase === "intro"
                    }
                    onReady={() => {
                        setIntroReady(
                            true,
                        );
                    }}
                    onComplete={() => {
                        setPhase(
                            "game",
                        );
                    }}
                />
            )}

            {/* =========================
                BLOCK MENU
                จน Intro พร้อม
            ========================= */}

            {phase === "menu" &&
                !introReady && (
                    <div
                        className="
                            fixed
                            inset-0
                            z-[20000]
                            flex
                            items-end
                            justify-center
                            bg-black/20
                            pb-10
                            backdrop-blur-[1px]
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                border
                                border-white/10
                                bg-black/80
                                px-5
                                py-3
                                text-xs
                                tracking-[0.2em]
                                text-white/70
                                backdrop-blur-md
                            "
                        >
                            <div
                                className="
                                    h-4
                                    w-4
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-white/20
                                    border-t-white
                                "
                            />

                            PREPARING INTRO...
                        </div>
                    </div>
                )}

            {/* =========================
                GAME
            ========================= */}

            {phase === "game" && (
                <GameScene />
            )}
        </>
    );
}