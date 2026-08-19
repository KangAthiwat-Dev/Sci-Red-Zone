"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import MainMenu from "./ui/MainMenu";
import IntroVideo from "./ui/IntroVideo";

type GamePhase = "menu" | "intro" | "game";

const GameScene = dynamic(() => import("./GameScene"), {
  ssr: false,
  loading: GameSceneLoading,
});

function GameSceneLoading() {
  return (
    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        bg-black
        font-mono
        text-xs
        tracking-[0.25em]
        text-white/55
      "
    >
      PREPARING GAME...
    </div>
  );
}

export default function GameFlow() {
  const [phase, setPhase] = useState<GamePhase>("menu");

  const [introReady, setIntroReady] = useState(false);

  return (
    <>
      {/* =========================
                MAIN MENU
            ========================= */}

      {phase === "menu" && (
        <MainMenu
          onStart={() => {
            /* ใช้ช่วง Intro โหลด JavaScript และ asset เริ่มต้นของเกม */
            void import("./GameScene");

            /*
             * ไม่ Block การเข้า Intro
             *
             * ถ้า Video ยังโหลดอยู่
             * IntroVideo จะเป็นคนแสดง
             * LOADING VIDEO... เอง
             */
            setPhase("intro");
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
          active={phase === "intro"}
          onReady={() => {
            setIntroReady(true);
          }}
          onComplete={() => {
            setPhase("game");
          }}
        />
      )}

      {/* =========================
                BLOCK MENU
                จน Intro พร้อม
            ========================= */}

      {phase === "menu" && !introReady && (
        <div
          className="
                            pointer-events-none
                            fixed
                            inset-0
                            z-20000
                            flex
                            items-end
                            justify-center
                            bg-black/10
                            pb-10
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
        <GameScene
          showPlayerPositionDebug={false}
          showPerformanceDebug={false}
        />
      )}
    </>
  );
}
