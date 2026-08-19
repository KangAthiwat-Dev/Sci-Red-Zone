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
import {
  ESCAPE_CHASE_CRAWLER_ZOMBIE_POSITION,
  ESCAPE_CHASE_NORMAL_ZOMBIE_POSITION,
} from "./escape/escapeConfig";
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
import EscapeAlertSound from "./escape/EscapeAlertSound";
import EscapeScanDisplay from "./escape/EscapeScanDisplay";
import EscapeZombieIntroCamera from "./escape/EscapeZombieIntroCamera";
import { InteractionLockProvider } from "./interactions/InteractionLockContext";
import SceneMusic from "./audio/SceneMusic";
import type { SceneMusicId } from "./audio/sceneMusicConfig";
import { OBJECTIVE_EVENTS } from "./objectives/objectiveConfig";
import { useObjectiveTracker } from "./objectives/useObjectiveTracker";
import DamageOverlay from "./damage/DamageOverlay";
import GameOverOverlay from "./damage/GameOverOverlay";
import FpsDebug from "./debug/FpsDebug";
import GpuSpikeDebug from "./debug/GpuSpikeDebug";
import GpuWarmup from "./debug/GpuWarmup";
import PlayerPositionDebug from "./debug/PlayerPositionDebug";

const MODEL_BOXWOOD_POSITION: [number, number, number] = [46, 1.65, -1.2];

type GameSceneProps = {
  showPlayerPositionDebug?: boolean;
  showPerformanceDebug?: boolean;
};

export default function GameScene({
  showPlayerPositionDebug = false,
  showPerformanceDebug = false,
}: GameSceneProps) {
  const [mapEnterTransitionActive, setMapEnterTransitionActive] = useState(
    () => (GAME_MAPS[0]?.enterTransition?.steps.length ?? 0) > 0,
  );

  const [escapePhase, setEscapePhase] = useState<EscapePhase>("control");

  const [escapeConsoleHolding, setEscapeConsoleHolding] = useState(false);

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

  const [mapRespawnKey, setMapRespawnKey] = useState(0);

  const [damageEffectId, setDamageEffectId] = useState(0);

  const [damageSlowActive, setDamageSlowActive] = useState(false);

  const damageSlowTimerRef = useRef<number | null>(null);

  /*
   * ไม่ต้องสร้าง gameOver state ซ้ำ
   * HP 0 = Game Over ทันที
   */
  const gameOver = playerHealth <= 0;

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

  const playerPositionDebugRef = useRef<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  const mapTransitionBusyRef = useRef(false);

  const currentMap = (
    GAME_MAPS[currentMapIndex] ??
    GAME_MAPS[0]
  )!;

  const isLastMap = currentMapIndex === GAME_MAPS.length - 1;

  const {
    currentObjective,
    completeObjectiveEvent,
    resetMapObjectives,
  } = useObjectiveTracker(currentMap.id);

  const escapeSequenceInteractionLocked =
    currentMap.id === "escape" &&
    (escapePhase === "warning" || escapePhase === "zombie-intro");

  const escapeSequenceLocksPlayer =
    currentMap.id === "escape" &&
    (escapeConsoleHolding || escapeSequenceInteractionLocked);

  const escapeSceneMusicTrackId:
    | SceneMusicId
    | undefined =
    currentMap.id === "escape" && escapePhase === "chase"
      ? "escape-chase"
      : undefined;

  const sceneMusicEnabled =
    !endingStarted &&
    (
      currentMap.id !== "escape" ||
      escapePhase === "control" ||
      escapePhase === "chase"
    );

  const interactionUiLocked =
    stairwayWirePuzzleOpen ||
    activeLabPuzzle !== null ||
    antidoteInteractionActive ||
    escapeSequenceInteractionLocked ||
    endingStarted ||
    gameOver;

  /*
   * Pause Rapier เฉพาะตอนเปิด Puzzle UI
   *
   * ตัว Puzzle เป็น DOM/UI อยู่นอก Physics
   * จึงยังทำงานตามปกติ
   */
  const physicsPaused = stairwayWirePuzzleOpen || activeLabPuzzle !== null;

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
      /*
       * Map ใหม่ยังไม่พร้อม
       *
       * รอ MapAssetGate
       * รายงานกลับมาอีกครั้ง
       */
      setMapAssetsReady(false);

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
      completeObjectiveEvent(
        OBJECTIVE_EVENTS.FACULTY_HALL_EXIT,
      );

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

      completeObjectiveEvent(
        OBJECTIVE_EVENTS.STAIRWAY_EXIT,
      );

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
      completeObjectiveEvent(
        OBJECTIVE_EVENTS.LAB_EXIT,
      );

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

  function completeEscapeConsoleScan() {
    if (currentMap.id !== "escape") {
      return;
    }

    if (escapePhase !== "control") {
      return;
    }

    /*
     * Bio Scan ลดถึง 10%
     * แล้วเข้าสู่ Warning
     */
    completeObjectiveEvent(
      OBJECTIVE_EVENTS.ESCAPE_CONSOLE_COMPLETED,
    );

    setEscapePhase("warning");
  }

  function handleEscapeAlertEnded() {
    if (currentMap.id !== "escape") {
      return;
    }

    if (escapePhase !== "warning") {
      return;
    }

    setEscapePhase("zombie-intro");
  }

  function handleEscapeZombieIntroComplete() {
    if (currentMap.id !== "escape") {
      return;
    }

    if (escapePhase !== "zombie-intro") {
      return;
    }

    completeObjectiveEvent(
      OBJECTIVE_EVENTS.ESCAPE_CHASE_STARTED,
    );

    setEscapePhase("chase");
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
    /*
     * ตายแล้วไม่รับ damage ซ้ำ
     */
    if (gameOver || endingStarted) {
      return;
    }

    // ==================================
    // Damage Visual + Camera
    // ==================================

    setDamageEffectId((current) => current + 1);

    // ==================================
    // Temporary Slow
    // ==================================

    setDamageSlowActive(true);

    if (damageSlowTimerRef.current !== null) {
      window.clearTimeout(damageSlowTimerRef.current);
    }

    damageSlowTimerRef.current = window.setTimeout(() => {
      setDamageSlowActive(false);

      damageSlowTimerRef.current = null;
    }, 700);

    // ==================================
    // HP
    // ==================================

    setPlayerHealth((current) => Math.max(0, current - damage));
  }

  function respawnCurrentMap() {
    // ==============================
    // HP
    // ==============================

    setPlayerHealth(100);

    // ==============================
    // Damage Effect
    // ==============================

    setDamageSlowActive(false);

    if (damageSlowTimerRef.current !== null) {
      window.clearTimeout(damageSlowTimerRef.current);

      damageSlowTimerRef.current = null;
    }

    // ==============================
    // Reset Current Scene
    // ==============================

    if (currentMap.id === "escape") {
      /*
       * กลับไปก่อนเปิดเครื่อง
       *
       * Console เปิดใช้งานอีกครั้ง
       * Scan ปิด
       * Zombie ยังไม่ Spawn
       */
      setEscapePhase("control");

      setEscapeConsoleHolding(false);

      resetMapObjectives(currentMap.id);

      setEndingStarted(false);

      setEndingVideoVisible(false);
    }

    // ==============================
    // Respawn Player / Enemy
    // ==============================

    setMapRespawnKey((current) => current + 1);
  }

  useEffect(() => {
    return () => {
      if (damageSlowTimerRef.current !== null) {
        window.clearTimeout(damageSlowTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // ====================================
    // Cache Map ถัดไปล่วงหน้า
    // ====================================

    const nextMap = GAME_MAPS[currentMapIndex + 1];

    if (nextMap) {
      preloadMapAssets(nextMap.id);
    }

    /* Zombie ใช้เฉพาะฉาก Escape จึงเริ่มโหลดระหว่างเล่น Laboratory */
    if (nextMap?.id === "escape" || currentMap.id === "escape") {
      preloadEnemyAssets();
    }
  }, [currentMap.id, currentMapIndex]);

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

    setEscapePhase("escaped");

    completeObjectiveEvent(
      OBJECTIVE_EVENTS.ESCAPE_EXIT,
    );

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
      <SceneMusic
        mapId={currentMap.id}
        trackId={escapeSceneMusicTrackId}
        enabled={sceneMusicEnabled}
        masterVolume={0.7}
      />

      <EscapeAlertSound
        active={
          currentMap.id === "escape" &&
          escapePhase === "warning"
        }
        onEnded={handleEscapeAlertEnded}
      />

      <Canvas
        shadows={false}
        dpr={0.75}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
        }}
        camera={{
          position: [0, 4, 12],
          fov: 48,
          near: 0.1,
          far: 200,
        }}
      >
        {showPerformanceDebug && <GpuSpikeDebug />}

        <GpuWarmup enabled={mapAssetsReady} warmupKey={currentMap.id} />

        {currentMap.id === "faculty-hall" && <HallLighting />}
        {currentMap.id === "stairway" && <StairwayLighting />}
        {currentMap.id === "laboratory" && <LaboratoryLighting />}
        {currentMap.id === "escape" && <EscapeLighting />}

        {currentMap.id === "escape" && (
          <EscapeZombieIntroCamera
            active={escapePhase === "zombie-intro"}
          />
        )}

        <Suspense fallback={null}>
          <MapAssetGate
            key={`map-assets-${currentMap.id}`}
            mapId={currentMap.id}
            setReady={setMapAssetsReady}
          >
            <SceneSetDressing mapId={currentMap.id} />

            <InteractionLockProvider locked={interactionUiLocked}>
              <Physics
                gravity={[0, -18, 0]}
                debug={false}
                paused={physicsPaused}
              >
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
                        completeObjectiveEvent(
                          OBJECTIVE_EVENTS.STAIRWAY_DOOR_INSPECTED,
                        );

                        setStairwayProgress((current) => ({
                          ...current,
                          doorInspected: true,
                        }));
                      }}
                      onKeycardRequested={() => {
                        completeObjectiveEvent(
                          OBJECTIVE_EVENTS.KEYCARD_REQUESTED,
                        );

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
                        completeObjectiveEvent(
                          OBJECTIVE_EVENTS.KEYCARD_COLLECTED,
                        );

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
                    key={`escape-console-${mapRespawnKey}`}
                    enabled={escapePhase === "control"}
                    onHoldingChange={setEscapeConsoleHolding}
                    onComplete={completeEscapeConsoleScan}
                  />
                )}

                {currentMap.id === "escape" && (
                  <EscapeScanDisplay
                    active={escapePhase === "warning"}
                  />
                )}

                {mapAssetsReady &&
                  currentMap.id === "escape" &&
                  currentMap.exit && (
                    <EscapeEndingTrigger
                      position={currentMap.exit.position}
                      halfExtents={currentMap.exit.halfExtents}
                      enabled={
                        escapePhase === "chase" &&
                        !endingStarted &&
                        !gameOver
                      }
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
                        completeObjectiveEvent(
                          OBJECTIVE_EVENTS.ANTIDOTE_COLLECTED,
                        );

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
                    onPlaced={() => {
                      completeObjectiveEvent(
                        OBJECTIVE_EVENTS.CRATE_PLACED,
                      );
                    }}
                  />
                )}

                {mapAssetsReady && (
                  <Player
                    key={`player-${currentMap.id}-${mapRespawnKey}`}
                    mapId={currentMap.id}
                    pushState={pushState}
                    spawnPosition={currentMap.spawnPosition}
                    damageEffectId={damageEffectId}
                    damageSlowActive={damageSlowActive}
                    debugPositionRef={
                      showPlayerPositionDebug
                        ? playerPositionDebugRef
                        : undefined
                    }
                    onObjectiveEvent={completeObjectiveEvent}
                    controlsLocked={
                      gameOver ||
                      endingStarted ||
                      stairwayWirePuzzleOpen ||
                      activeLabPuzzle !== null ||
                      antidoteInteractionActive ||
                      escapeSequenceLocksPlayer ||
                      mapEnterTransitionActive
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
                  (escapePhase === "zombie-intro" ||
                    escapePhase === "chase") &&
                  !endingStarted &&
                  !gameOver && (
                    <>
                      <ZombieEnemy
                        key={`zombie-normal-${mapRespawnKey}`}
                        position={ESCAPE_CHASE_NORMAL_ZOMBIE_POSITION}
                        patrolDistance={5}
                        introScream={escapePhase === "zombie-intro"}
                        onIntroScreamComplete={
                          handleEscapeZombieIntroComplete
                        }
                        onAttackHit={handleZombieAttack}
                      />

                      {escapePhase === "chase" && (
                        <ZombieEnemy
                          key={`zombie-crawler-${mapRespawnKey}`}
                          position={ESCAPE_CHASE_CRAWLER_ZOMBIE_POSITION}
                          patrolDistance={4}
                          variant="crawler"
                          onAttackHit={handleZombieAttack}
                        />
                      )}
                    </>
                  )}
              </Physics>
            </InteractionLockProvider>
          </MapAssetGate>
        </Suspense>
      </Canvas>

      {showPerformanceDebug && <FpsDebug />}

      {showPlayerPositionDebug && (
        <PlayerPositionDebug positionRef={playerPositionDebugRef} />
      )}

      <GameHUD
        health={playerHealth}
        maxHealth={100}
        objectiveTitle={
          currentObjective?.objective.title ??
          "OBJECTIVE COMPLETE"
        }
        objectiveHint={
          currentObjective?.objective.hint ??
          "เดินหน้าต่อไป"
        }
        objectiveProgressLabel={
          currentObjective?.progressLabel
        }
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

      <DamageOverlay hitKey={damageEffectId} />

      <GameOverOverlay visible={gameOver} onRestart={respawnCurrentMap} />

      {stairwayWirePuzzleOpen && (
        <WirePuzzle
          onClose={() => {
            setStairwayWirePuzzleOpen(false);
          }}
          onComplete={() => {
            completeObjectiveEvent(
              OBJECTIVE_EVENTS.WIRE_PUZZLE_COMPLETED,
            );

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
            completeObjectiveEvent(
              OBJECTIVE_EVENTS.DNA_COMPLETED,
            );

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
            completeObjectiveEvent(
              OBJECTIVE_EVENTS.CELL_COMPLETED,
            );

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
            completeObjectiveEvent(
              OBJECTIVE_EVENTS.CHEMICAL_COMPLETED,
            );

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

      {currentMap.id === "escape" && (
        <EndingVideo
          visible={endingVideoVisible}
          onEnded={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
