"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState } from "react";

import Map from "./Map";
import Player from "./Player";
import ModelPrinter from "./ModelPrinter";

const MODEL_PRINTER_POSITION: [
  number,
  number,
  number,
] = [16, 1.65, -1.2];

export default function GameScene() {
  const [isPlayerPushing, setIsPlayerPushing] =
    useState(false);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{
          /*
           * ค่านี้เป็นแค่ค่าเริ่มต้น
           * Player จะเข้ามาควบคุมกล้องต่อ
           */
          position: [0, 4, 12],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
      >
        <color
          attach="background"
          args={["#151515"]}
        />

        <ambientLight intensity={0.8} />

        <directionalLight
          castShadow
          position={[-5, 10, 8]}
          intensity={2}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Physics
          gravity={[0, -18, 0]}
        >
          <Map />

          <ModelPrinter
            position={MODEL_PRINTER_POSITION}
            onPushingChange={setIsPlayerPushing}
          />

          <Player isPushing={isPlayerPushing} />
        </Physics>
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-black/70 px-4 py-3 text-sm leading-6 text-white">
        A / D = เดิน
        <br />
        Shift + A / D = วิ่ง
        <br />
        Space = กระโดด
        <br />
        C / Ctrl = กดค้างเพื่อย่อ
        <br />
        E = ดัน Printer
      </div>
    </div>
  );
}
