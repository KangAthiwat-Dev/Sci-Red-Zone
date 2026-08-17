"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect, useRef, useState } from "react";
import GameMap from "./maps/GameMap";
import { GAME_MAPS } from "./maps/mapConfig";
import Player from "./player/Player";
import ModelBoxWood from "./objects/WoodenCrateModel";
import {
  DEFAULT_PUSH_INTERACTION_STATE,
  type PushInteractionState,
} from "./interactions/push/pushTypes";
import MapFadeOverlay from "./maps/MapFadeOverlay";
import DNAConsole from "./lab/interactions/DNAConsole";
import DNAPuzzle from "./lab/puzzles/DNAPuzzle";
import CellScanner from "./lab/interactions/CellScanner";
import CellPuzzle from "./lab/puzzles/CellPuzzle";
import ChemicalConsole from "./lab/interactions/ChemicalConsole";
import ChemicalPuzzle from "./lab/puzzles/ChemicalPuzzle";
import AntidoteMachine from "./lab/interactions/AntidoteMachine";
import EscapeControlConsole from "./escape/EscapeControlConsole";
import type { EscapePhase } from "./escape/escapeTypes";
import HallLighting from "./lights/HallLighting";
import StairwayLighting from "./lights/StairwayLighting";
import { DEFAULT_STAIRWAY_PROGRESS } from "./stairway/stairwayTypes";
import StairwayDoorStatus from "./stairway/interactions/StairwayDoorStatus";
import WirePanel from "./stairway/interactions/WirePanel";
import KeycardPickup from "./stairway/interactions/KeycardPickup";
import WirePuzzle from "./stairway/puzzles/WirePuzzle";
import LaboratoryLighting from "./lights/LaboratoryLighting";
import SceneSetDressing from "./background/SceneSetDressing";
import EscapeLighting from "./lights/EscapeLighting";
import ZombieEnemy from "./enemies/zombie/ZombieEnemy";
import MapAssetGate from "./loading/MapAssetGate";
import { preloadEnemyAssets, preloadMapAssets } from "./loading/gameAssetCache";
import EscapeEndingTrigger from "./escape/EscapeEndingTrigger";
import EndingVideo from "./escape/EndingVideo";
import GameHUD from "./ui/GameHUD";
import GameLoadingScreen from "./ui/GameLoadingScreen";
import EscapeScanDisplay from "./escape/EscapeScanDisplay";
import { InteractionLockProvider } from "./interactions/InteractionLockContext";
import SceneMusic from "./audio/SceneMusic";

const MODEL_BOXWOOD_POSITION: [number, number, number] = [46, 1.65, -1.2];

export default function GameScene() {
  const [mapEnterTransitionActive, setMapEnterTransitionActive] = useState(
    () => (GAME_MAPS[0]?.enterTransition?.steps.length ?? 0) > 0,
  );

  const [escapePhase, setEscapePhase] = useState<EscapePhase>("control");

  const [activeLabPuzzle, setActiveLabPuzzle] = useState<
    "dna" | "cell" | "chemical" | null
  >(null);

  const [dnaCompleted, setDnaCompleted] = useState(false);

  const [cellCompleted, setCellCompleted] = useState(false);

  const [chemicalCompleted, setChemicalCompleted] = useState(false);

  const [antidoteCollected, setAntidoteCollected] = useState(false);

  const [antidoteInteractionActive, setAntidoteInteractionActive] =
    useState(false);

  const [showAntidoteMessage, setShowAntidoteMessage] = useState(false);

  const [playerHealth, setPlayerHealth] = useState(100);

  const [pushState, setPushState] = useState<PushInteractionState>(
    DEFAULT_PUSH_INTERACTION_STATE,
  );

  const [currentMapIndex, setCurrentMapIndex] = useState(0);

  const [mapExitTransitionActive, setMapExitTransitionActive] = useState(false);

  const [mapFadeVisible, setMapFadeVisible] = useState(true);

  const [mapAssetsReady, setMapAssetsReady] = useState(false);

  const [stairwayProgress, setStairwayProgress] = useState(
    DEFAULT_STAIRWAY_PROGRESS,
  );

  const [stairwayWirePuzzleOpen, setStairwayWirePuzzleOpen] = useState(false);

  const [endingStarted, setEndingStarted] = useState(false);

  const [endingVideoVisible, setEndingVideoVisible] = useState(false);

  const mapTransitionBusyRef = useRef(false);

  const currentMap = GAME_MAPS[currentMapIndex];

  const isLastMap = currentMapIndex === GAME_MAPS.length - 1;

  if (!currentMap) {
    return null;
  }

  const interactionUiLocked =
    stairwayWirePuzzleOpen ||
    activeLabPuzzle !== null ||
    antidoteInteractionActive ||
    endingStarted;

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
    fadeToNextMap();
  }

  function fadeToNextMap() {
    setMapFadeVisible(true);

    const nextMapIndex = Math.min(currentMapIndex + 1, GAME_MAPS.length - 1);

    const nextMap = GAME_MAPS[nextMapIndex];

    window.setTimeout(() => {
      setCurrentMapIndex(nextMapIndex);

      setMapExitTransitionActive(false);

      // ============================
      // Intro ของ Map ใหม่
      // ============================

      const hasEnterTransition =
        (nextMap?.enterTransition?.steps.length ?? 0) > 0;

      setMapEnterTransitionActive(hasEnterTransition);

      /*
       * ให้ Map ใหม่ mount ตอนจอดำก่อน
       */
      window.setTimeout(() => {
        setMapFadeVisible(false);

        mapTransitionBusyRef.current = false;
      }, 100);
    }, 500);
  }

  function handleMapExitRequested() {
    if (mapTransitionBusyRef.current) {
      return;
    }

    if (isLastMap) {
      return;
    }

    // ============================
    // Hall → Stairway
    // ============================

    if (currentMap.id === "faculty-hall") {
      startMapExitTransition();

      return;
    }

    // ============================
    // Stairway → Laboratory
    // ============================

    if (currentMap.id === "stairway") {
      // --------------------------
      // ยังไม่ได้ซ่อมไฟ
      // --------------------------

      if (!stairwayProgress.powerRestored) {
        setStairwayProgress((current) => ({
          ...current,
          doorInspected: true,
        }));

        return;
      }

      // --------------------------
      // ไฟกลับมาแล้ว
      // แต่ยังไม่มี Keycard
      // --------------------------

      if (!stairwayProgress.keycardCollected) {
        setStairwayProgress((current) => ({
          ...current,
          keycardRequested: true,
        }));

        return;
      }

      // --------------------------
      // พร้อมออก Scene
      // --------------------------

      mapTransitionBusyRef.current = true;

      fadeToNextMap();

      return;
    }

    // ============================
    // Laboratory → Escape
    // ============================

    if (currentMap.id === "laboratory") {
      /*
       * ยังไม่ได้ Antidote
       * ห้ามออกจาก Lab
       */
      if (!antidoteCollected) {
        return;
      }

      /*
       * กัน Transition ซ้ำ
       */
      mapTransitionBusyRef.current = true;

      /*
       * Fade ดำ
       * → เปลี่ยน Map
       * → Fade กลับ
       */
      fadeToNextMap();

      return;
    }
  }

  function startEscapeAlarm() {
    if (currentMap.id !== "escape") {
      return;
    }

    if (escapePhase !== "control") {
      return;
    }

    /*
     * เริ่ม Bio Scan
     *
     * ตอนนี้ Player จะถูก Lock
     * เพราะ escapePhase === "alarm"
     */
    setEscapePhase("alarm");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMapFadeVisible(false);
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handleZombieAttack(damage: number) {
    setPlayerHealth((current) => Math.max(0, current - damage));
  }

  useEffect(() => {
    // ====================================
    // Cache Enemy
    // ====================================

    preloadEnemyAssets();

    // ====================================
    // Cache Map ถัดไปล่วงหน้า
    // ====================================

    const nextMap = GAME_MAPS[currentMapIndex + 1];

    if (nextMap) {
      preloadMapAssets(nextMap.id);
    }
  }, [currentMapIndex]);

  function startEndingSequence() {
    /*
     * กัน Trigger ซ้ำ
     */
    if (endingStarted) {
      return;
    }

    if (currentMap.id !== "escape") {
      return;
    }

    // ============================
    // Lock Game
    // ============================

    setEndingStarted(true);

    /*
     * Fade จอดำก่อน
     */
    setMapFadeVisible(true);

    // ============================
    // Fade → Video
    // ============================

    window.setTimeout(() => {
      /*
       * ตอนนี้จอดำเต็มแล้ว
       */
      setEndingVideoVisible(true);

      /*
       * เอา Fade ออก
       * เพื่อเผย Video
       */
      window.setTimeout(() => {
        setMapFadeVisible(false);
      }, 100);
    }, 500);
  }

  return (
    <div className="relative h-full w-full">
      <SceneMusic mapId={currentMap.id} masterVolume={0.7} />

      <Canvas
        shadows
        dpr={1}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, 4, 12],
          fov: 48,
          near: 0.1,
          far: 200,
        }}
      >
        {currentMap.id === "faculty-hall" && <HallLighting />}
        {currentMap.id === "stairway" && <StairwayLighting />}
        {currentMap.id === "laboratory" && <LaboratoryLighting />}
        {currentMap.id === "escape" && <EscapeLighting />}

        <SceneSetDressing mapId={currentMap.id} />

        <Suspense fallback={null}>
          <MapAssetGate
            key={`map-assets-${currentMap.id}`}
            mapId={currentMap.id}
            setReady={setMapAssetsReady}
          >
            <InteractionLockProvider locked={interactionUiLocked}>
              <Physics gravity={[0, -18, 0]} debug={false}>
                <GameMap
                  key={`map-${currentMap.id}`}
                  map={currentMap}
                  isLastMap={isLastMap}
                  onExit={handleMapExitRequested}
                  stairwayExitEnabled={
                    stairwayProgress.powerRestored &&
                    stairwayProgress.keycardCollected
                  }
                  labExitEnabled={antidoteCollected}
                />

                {currentMap.id === "stairway" && (
                  <>
                    <StairwayDoorStatus
                      progress={stairwayProgress}
                      onDoorInspected={() => {
                        setStairwayProgress((current) => ({
                          ...current,
                          doorInspected: true,
                        }));
                      }}
                      onKeycardRequested={() => {
                        setStairwayProgress((current) => ({
                          ...current,
                          keycardRequested: true,
                        }));
                      }}
                    />

                    <WirePanel
                      enabled={
                        stairwayProgress.doorInspected &&
                        !stairwayProgress.powerRestored
                      }
                      completed={stairwayProgress.powerRestored}
                      onOpen={() => {
                        setStairwayWirePuzzleOpen(true);
                      }}
                    />

                    <KeycardPickup
                      enabled={stairwayProgress.keycardRequested}
                      collected={stairwayProgress.keycardCollected}
                      onCollected={() => {
                        setStairwayProgress((current) => ({
                          ...current,

                          keycardCollected: true,
                        }));
                      }}
                    />
                  </>
                )}

                {currentMap.id === "escape" && (
                  <EscapeControlConsole
                    enabled={escapePhase === "control"}
                    onActivate={startEscapeAlarm}
                  />
                )}

                {currentMap.id === "escape" && (
                  <EscapeScanDisplay
                    active={escapePhase === "alarm"}
                    onComplete={() => {
                      setEscapePhase("chase");
                    }}
                  />
                )}

                {mapAssetsReady &&
                  currentMap.id === "escape" &&
                  currentMap.exit && (
                    <EscapeEndingTrigger
                      position={currentMap.exit.position}
                      halfExtents={currentMap.exit.halfExtents}
                      enabled={!endingStarted}
                      onEnter={startEndingSequence}
                    />
                  )}

                {/* Puzzles */}
                {currentMap.id === "laboratory" && (
                  <>
                    <DNAConsole
                      completed={dnaCompleted}
                      onOpen={() => {
                        setActiveLabPuzzle("dna");
                      }}
                    />

                    <CellScanner
                      completed={cellCompleted}
                      enabled={dnaCompleted}
                      onOpen={() => {
                        setActiveLabPuzzle("cell");
                      }}
                    />

                    <ChemicalConsole
                      completed={chemicalCompleted}
                      enabled={cellCompleted}
                      onOpen={() => {
                        setActiveLabPuzzle("chemical");
                      }}
                    />

                    <AntidoteMachine
                      unlocked={chemicalCompleted}
                      collected={antidoteCollected}
                      onHoldingChange={setAntidoteInteractionActive}
                      onCollected={() => {
                        setAntidoteCollected(true);

                        setAntidoteInteractionActive(false);

                        setShowAntidoteMessage(true);

                        window.setTimeout(() => {
                          setShowAntidoteMessage(false);
                        }, 2500);
                      }}
                    />
                  </>
                )}

                {mapAssetsReady && currentMap.id === "faculty-hall" && (
                  <ModelBoxWood
                    position={MODEL_BOXWOOD_POSITION}
                    onPushStateChange={setPushState}
                  />
                )}

                {mapAssetsReady && (
                  <Player
                    key={`player-${currentMap.id}`}
                    pushState={pushState}
                    spawnPosition={currentMap.spawnPosition}
                    controlsLocked={
                      endingStarted ||
                      stairwayWirePuzzleOpen ||
                      activeLabPuzzle !== null ||
                      antidoteInteractionActive ||
                      mapEnterTransitionActive ||
                      (currentMap.id === "escape" && escapePhase === "alarm")
                    }
                    mapEnterTransition={{
                      active: mapEnterTransitionActive,

                      steps: currentMap.enterTransition?.steps ?? [],
                    }}
                    onMapEnterWalkComplete={() => {
                      setMapEnterTransitionActive(false);
                    }}
                    mapExitTransition={{
                      active: mapExitTransitionActive,

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

                          rotationY: Math.PI / 2,
                        },
                      ],
                    }}
                    onMapExitWalkComplete={handleMapExitWalkComplete}
                  />
                )}

                {mapAssetsReady && currentMap.id === "faculty-hall" && <></>}

                {mapAssetsReady &&
                  currentMap.id === "escape" &&
                  escapePhase === "chase" && (
                    <>
                      <ZombieEnemy
                        position={[10, 5, 0]}
                        patrolDistance={5}
                        onAttackHit={handleZombieAttack}
                      />

                      <ZombieEnemy
                        position={[90, 5, 0]}
                        patrolDistance={4}
                        variant="crawler"
                        onAttackHit={handleZombieAttack}
                      />
                    </>
                  )}
              </Physics>
            </InteractionLockProvider>
          </MapAssetGate>
        </Suspense>
      </Canvas>

      <GameHUD
        health={playerHealth}
        maxHealth={100}
        objectiveTitle="ESCAPE THE FACILITY"
        objectiveHint="สำรวจพื้นที่ ค้นหาไอเทมสำคัญ และหาทางออก"
        items={[
          {
            id: "keycard",
            label: "Keycard",
            shortLabel: "KC",
            acquired: stairwayProgress.keycardCollected,
          },

          {
            id: "dna-data",
            label: "DNA Data",
            shortLabel: "DNA",
            acquired: dnaCompleted,
          },

          {
            id: "cell-data",
            label: "Cell Data",
            shortLabel: "CELL",
            acquired: cellCompleted,
          },

          {
            id: "formula",
            label: "Chemical Formula",
            shortLabel: "CHEM",
            acquired: chemicalCompleted,
          },

          {
            id: "antidote",
            label: "Antidote",
            shortLabel: "MED",
            acquired: antidoteCollected,
          },
        ]}
      />

      {stairwayWirePuzzleOpen && (
        <WirePuzzle
          onClose={() => {
            setStairwayWirePuzzleOpen(false);
          }}
          onComplete={() => {
            setStairwayProgress((current) => ({
              ...current,
              powerRestored: true,
            }));

            setStairwayWirePuzzleOpen(false);
          }}
        />
      )}

      {/* UI Puzzle */}
      {activeLabPuzzle === "dna" && (
        <DNAPuzzle
          onClose={() => {
            setActiveLabPuzzle(null);
          }}
          onComplete={() => {
            setDnaCompleted(true);

            setActiveLabPuzzle(null);
          }}
        />
      )}

      {activeLabPuzzle === "cell" && (
        <CellPuzzle
          onClose={() => {
            setActiveLabPuzzle(null);
          }}
          onComplete={() => {
            setCellCompleted(true);

            setActiveLabPuzzle(null);
          }}
        />
      )}

      {activeLabPuzzle === "chemical" && (
        <ChemicalPuzzle
          onClose={() => {
            setActiveLabPuzzle(null);
          }}
          onComplete={() => {
            setChemicalCompleted(true);

            setActiveLabPuzzle(null);
          }}
        />
      )}

      {showAntidoteMessage && (
        <div
          className="
      pointer-events-none
      absolute
      left-1/2
      top-20
      z-8000
      -translate-x-1/2
      rounded-xl
      border
      border-emerald-400/30
      bg-black/85
      px-8
      py-4
      text-center
      text-white
      shadow-2xl
      backdrop-blur-sm
    "
        >
          <div className="text-xs tracking-[0.3em] text-emerald-400">
            SYNTHESIS COMPLETE
          </div>

          <div
            className="
        mt-1
        text-xl
        font-bold
      "
          >
            ANTIDOTE ACQUIRED
          </div>
        </div>
      )}

      <MapFadeOverlay visible={mapFadeVisible} />

      <GameLoadingScreen
        visible={!mapAssetsReady && !endingVideoVisible}
        mapLabel={currentMap.label}
      />

      <EndingVideo
        visible={endingVideoVisible}
        onEnded={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
