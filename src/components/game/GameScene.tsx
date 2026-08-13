"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useRef, useState } from "react";
import GameMap from "./maps/GameMap";
import {
  GAME_MAPS,
} from "./maps/mapConfig";
import Player from "./player/Player";
import ModelPrinter from "./objects/ModelPrinter";
import {
  DEFAULT_PUSH_INTERACTION_STATE,
  type PushInteractionState,
} from "./interactions/push/pushTypes";
import MapFadeOverlay from "./maps/MapFadeOverlay";
import GameBackground from "./background/GameBackground";

const MODEL_PRINTER_POSITION: [
  number,
  number,
  number,
] = [46, 1.65, -1.2];

export default function GameScene() {
  const [pushState, setPushState] = useState<PushInteractionState>(
    DEFAULT_PUSH_INTERACTION_STATE,
  );

  const [
    currentMapIndex,
    setCurrentMapIndex,
  ] = useState(0);

  const [
    mapExitTransitionActive,
    setMapExitTransitionActive,
  ] = useState(false);

  const [
    mapFadeVisible,
    setMapFadeVisible,
  ] = useState(false);

  const mapTransitionBusyRef =
    useRef(false);

  const currentMap =
    GAME_MAPS[currentMapIndex];

  const isLastMap =
    currentMapIndex ===
    GAME_MAPS.length - 1;

  function goToNextMap() {
    if (isLastMap) {
      return;
    }

    setCurrentMapIndex(
      (current) =>
        Math.min(
          current + 1,
          GAME_MAPS.length - 1,
        ),
    );
  }

  function startMapExitTransition() {
    if (mapTransitionBusyRef.current) {
      return;
    }

    if (isLastMap) {
      return;
    }

    mapTransitionBusyRef.current = true;

    /*
     * ยังไม่เปลี่ยน Map
     *
     * แค่สั่ง Player
     * ให้หันและเดินเข้าไปก่อน
     */
    setMapExitTransitionActive(true);
  }

  function handleMapExitWalkComplete() {
    /*
     * เริ่ม Fade ดำ
     */
    setMapFadeVisible(true);

    /*
     * รอจนจอดำก่อน
     */
    window.setTimeout(() => {
      setCurrentMapIndex(
        (current) =>
          Math.min(
            current + 1,
            GAME_MAPS.length - 1,
          ),
      );

      /*
       * Player ตัวใหม่จะถูก Spawn
       * เพราะ key เปลี่ยนตาม Map
       */
      setMapExitTransitionActive(false);

      /*
       * ให้ Map ใหม่ render
       * อยู่หลังจอดำก่อนเล็กน้อย
       */
      window.setTimeout(() => {
        setMapFadeVisible(false);

        mapTransitionBusyRef.current =
          false;
      }, 100);
    }, 500);
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{
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
          debug={true}
        >
          <GameMap
            key={`map-${currentMap.id}`}
            map={currentMap}
            isLastMap={isLastMap}
            onExit={startMapExitTransition}
          />

          {/* Printer ตอนนี้อยู่ MAP 0 ก่อน */}

          {currentMap.id ===
            "faculty-hall" && (
              <ModelPrinter
                position={
                  MODEL_PRINTER_POSITION
                }

                /*
                 * props Push เดิมของคุณ
                 * ใส่เหมือนเดิมตรงนี้
                 */
                onPushStateChange={
                  setPushState
                }
              />
            )}

          <Player
            key={`player-${currentMap.id}`}

            pushState={pushState}

            spawnPosition={
              currentMap.spawnPosition
            }

            mapExitTransition={{
              active:
                mapExitTransitionActive,

              steps: [
                // ======================
                // ช่วง 1
                // เดินเข้าไปด้านลึก
                // ======================

                {
                  velocityX: 0,
                  velocityZ: -5,

                  duration: 2.8,

                  rotationY: Math.PI,
                },

                // ======================
                // ช่วง 2
                // ถึงมุมแล้วเลี้ยวขวา
                // ======================

                {
                  velocityX: 4,
                  velocityZ: 0,

                  duration: 1,

                  rotationY:
                    Math.PI / 2,
                },
              ],
            }}

            onMapExitWalkComplete={
              handleMapExitWalkComplete
            }
          />
        </Physics>
      </Canvas>

      <MapFadeOverlay
        visible={mapFadeVisible}
      />

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-black/70 px-4 py-3 text-sm leading-6 text-white">
        A / D = เดิน
        <br />
        Shift + A / D = วิ่ง
        <br />
        Space = กระโดด
        <br />
        C / Ctrl = กดเพื่อย่อ
        <br />
        E = ดัน Printer
      </div>
    </div>
  );
}
