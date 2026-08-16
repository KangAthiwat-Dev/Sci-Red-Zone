"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

// ========================================
// Types
// ========================================

type BaseLetter = "A" | "T" | "G" | "C";

type DNARow = {
  id: number;
  left: BaseLetter;
  answer: BaseLetter;
  filled: boolean;
  y: number;
  leftX: number;
  rightX: number;
};

type TrayTile = {
  id: number;
  letter: BaseLetter;
};

type DragState = {
  tileId: number;
  letter: BaseLetter;
};

type DNAPuzzleProps = {
  onComplete: () => void;
  onClose: () => void;
};

// ========================================
// Config
// ========================================

const PAIR: Record<BaseLetter, BaseLetter> = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

const COLOR: Record<BaseLetter, string> = {
  A: "#34e5a3",
  T: "#ffb454",
  G: "#4da6ff",
  C: "#ff6bb5",
};

const BASES: BaseLetter[] = ["A", "T", "G", "C"];

const ROW_COUNT = 5;

const CENTER_X = 200;
const HELIX_RADIUS = 92;

const TOP = 70;
const BOTTOM = 490;

let tileIdCounter = 0;

// ========================================
// DNA Math
// ========================================

function phase(y: number) {
  return ((y - TOP) / (BOTTOM - TOP)) * Math.PI * 2.4;
}

function strandX(y: number, side: -1 | 1) {
  return CENTER_X + side * HELIX_RADIUS * Math.cos(phase(y));
}

// ========================================
// Shuffle
// ========================================

function shuffle<T>(source: T[]) {
  const result = [...source];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// ========================================
// Create Level
// ========================================

function createLevel(): DNARow[] {
  const rows: DNARow[] = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const y = TOP + ((BOTTOM - TOP) * i) / (ROW_COUNT - 1);

    const left = BASES[Math.floor(Math.random() * BASES.length)];

    rows.push({
      id: i,

      left,

      answer: PAIR[left],

      filled: false,

      y,

      leftX: strandX(y, -1),

      rightX: strandX(y, 1),
    });
  }

  return rows;
}

// ========================================
// Create Tray
// ========================================

function createTray(level: DNARow[]): TrayTile[] {
  return shuffle(level.map((row) => row.answer)).map((letter) => {
    tileIdCounter += 1;

    return {
      id: tileIdCounter,

      letter,
    };
  });
}

// ========================================
// Component
// ========================================

export default function DNAPuzzle({ onComplete, onClose }: DNAPuzzleProps) {
  const [level, setLevel] = useState<DNARow[]>([]);

  const [tray, setTray] = useState<TrayTile[]>([]);

  const [drag, setDrag] = useState<DragState | null>(null);

  const [dragPosition, setDragPosition] = useState({
    x: 0,
    y: 0,
  });

  const [hintedSlot, setHintedSlot] = useState<number | null>(null);

  const [wrongSlot, setWrongSlot] = useState<number | null>(null);

  const [win, setWin] = useState(false);

  // ========================================
  // Refs
  // ========================================

  const slotRefs = useRef<Map<number, SVGGElement>>(new Map());

  const completeTimer = useRef<number | null>(null);

  const hintTimer = useRef<number | null>(null);

  const wrongTimer = useRef<number | null>(null);

  // ========================================
  // Clear Timers
  // ========================================

  const clearTimers = useCallback(() => {
    if (completeTimer.current !== null) {
      window.clearTimeout(completeTimer.current);

      completeTimer.current = null;
    }

    if (hintTimer.current !== null) {
      window.clearTimeout(hintTimer.current);

      hintTimer.current = null;
    }

    if (wrongTimer.current !== null) {
      window.clearTimeout(wrongTimer.current);

      wrongTimer.current = null;
    }
  }, []);

  // ========================================
  // Reset
  // ========================================

  const resetPuzzle = useCallback(() => {
    clearTimers();

    const nextLevel = createLevel();

    setLevel(nextLevel);

    setTray(createTray(nextLevel));

    setDrag(null);

    setHintedSlot(null);

    setWrongSlot(null);

    setWin(false);
  }, [clearTimers]);

  useEffect(() => {
    resetPuzzle();

    return () => {
      clearTimers();
    };
  }, [resetPuzzle, clearTimers]);

  // ========================================
  // SVG Backbone
  // ========================================

  function createBackbonePath(side: -1 | 1) {
    let path = "";

    for (let y = TOP; y <= BOTTOM; y += 6) {
      const x = strandX(y, side);

      if (y === TOP) {
        path += `M ${x.toFixed(1)} ${y}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y}`;
      }
    }

    return path;
  }

  // ========================================
  // Find Slot
  // ========================================

  function findNearestSlot(pointerX: number, pointerY: number) {
    let bestIndex: number | null = null;

    let bestDistance = Number.POSITIVE_INFINITY;

    level.forEach((row, index) => {
      if (row.filled) {
        return;
      }

      const element = slotRefs.current.get(index);

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;

      const centerY = rect.top + rect.height / 2;

      const distance = Math.hypot(
        pointerX - centerX,

        pointerY - centerY,
      );

      if (distance < bestDistance) {
        bestDistance = distance;

        bestIndex = index;
      }
    });

    return bestDistance < 64 ? bestIndex : null;
  }

  // ========================================
  // Win
  // ========================================

  function showWin() {
    setWin(true);

    completeTimer.current = window.setTimeout(() => {
      completeTimer.current = null;

      onComplete();
    }, 1400);
  }

  // ========================================
  // Drop
  // ========================================

  function handleDrop(
    dragState: DragState,

    pointerX: number,
    pointerY: number,
  ) {
    const slotIndex = findNearestSlot(pointerX, pointerY);

    if (slotIndex === null) {
      return;
    }

    const row = level[slotIndex];

    // =====================================
    // Wrong
    // =====================================

    if (dragState.letter !== row.answer) {
      setWrongSlot(slotIndex);

      if (wrongTimer.current !== null) {
        window.clearTimeout(wrongTimer.current);
      }

      wrongTimer.current = window.setTimeout(() => {
        setWrongSlot(null);

        wrongTimer.current = null;
      }, 450);

      return;
    }

    // =====================================
    // Correct
    // =====================================

    const nextLevel = level.map((current, index) =>
      index === slotIndex
        ? {
            ...current,
            filled: true,
          }
        : current,
    );

    setLevel(nextLevel);

    setTray((current) =>
      current.filter((tile) => tile.id !== dragState.tileId),
    );

    if (nextLevel.every((row) => row.filled)) {
      window.setTimeout(showWin, 350);
    }
  }

  // ========================================
  // Drag Start
  // ========================================

  function handleDragStart(
    event: ReactPointerEvent<HTMLButtonElement>,

    tile: TrayTile,
  ) {
    if (drag || win) {
      return;
    }

    event.preventDefault();

    setDrag({
      tileId: tile.id,

      letter: tile.letter,
    });

    setDragPosition({
      x: event.clientX,

      y: event.clientY,
    });
  }

  // ========================================
  // Pointer Move / Up
  // ========================================

  useEffect(() => {
    if (!drag) {
      return;
    }

    function handleMove(event: PointerEvent) {
      event.preventDefault();

      setDragPosition({
        x: event.clientX,

        y: event.clientY,
      });
    }

    function handleUp(event: PointerEvent) {
      if (!drag) {
        return;
      }

      handleDrop(
        drag,

        event.clientX,

        event.clientY,
      );

      setDrag(null);
    }

    window.addEventListener("pointermove", handleMove, {
      passive: false,
    });

    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);

      window.removeEventListener("pointerup", handleUp);
    };
  }, [drag?.tileId, level]);

  // ========================================
  // Hint
  // ========================================

  function showHint() {
    const index = level.findIndex((row) => !row.filled);

    if (index === -1) {
      return;
    }

    setHintedSlot(index);

    if (hintTimer.current !== null) {
      window.clearTimeout(hintTimer.current);
    }

    hintTimer.current = window.setTimeout(() => {
      setHintedSlot(null);

      hintTimer.current = null;
    }, 900);
  }

  // ========================================
  // Render
  // ========================================

  return (
    <div
      className="
                fixed
                inset-0
                z-[9000]
                flex
                items-center
                justify-center
                overflow-hidden
                bg-black/55
                p-6
                backdrop-blur-[2px]
            "
    >
      {/* =================================
                Puzzle Panel
            ================================= */}

      <div
        className="
                    relative
                    flex
                    h-[min(720px,calc(100vh-48px))]
                    w-full
                    max-w-[520px]
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-cyan-300/20
                    bg-slate-950/95
                    text-white
                    shadow-[0_30px_100px_rgba(0,0,0,0.75)]
                "
      >
        {/* =================================
                    Glow
                ================================= */}

        <div
          className="
                        pointer-events-none
                        absolute
                        -left-20
                        -top-24
                        h-72
                        w-72
                        rounded-full
                        bg-blue-600/15
                        blur-3xl
                    "
        />

        <div
          className="
                        pointer-events-none
                        absolute
                        -bottom-24
                        -right-20
                        h-64
                        w-64
                        rounded-full
                        bg-fuchsia-500/10
                        blur-3xl
                    "
        />

        {/* =================================
                    Close
                ================================= */}

        <button
          type="button"
          onClick={onClose}
          className="
                        absolute
                        right-4
                        top-4
                        z-30
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        bg-black/25
                        text-xl
                        text-white/50
                        transition
                        hover:bg-white/10
                        hover:text-white
                    "
        >
          ×
        </button>

        {/* =================================
                    Header
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        shrink-0
                        px-6
                        pb-2
                        pt-5
                        text-center
                    "
        >
          <div
            className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.35em]
                            text-cyan-300/60
                        "
          >
            LAB MISSION · PUZZLE 1
          </div>

          <h2
            className="
                            mt-1
                            text-2xl
                            font-bold
                            tracking-wide
                            text-cyan-100
                        "
          >
            ต่อเกลียว DNA
          </h2>

          <p
            className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
          >
            จับคู่เบสให้ครบ แล้วเกลียวจะสว่างขึ้น
          </p>
        </div>

        {/* =================================
                    Rules
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        flex
                        shrink-0
                        justify-center
                        gap-2
                        px-4
                        py-2
                    "
        >
          <div
            className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-white/10
                            bg-white/5
                            px-3
                            py-1
                            text-xs
                        "
          >
            <BaseBadge letter="A" />

            <span className="text-white/40">—</span>

            <BaseBadge letter="T" />
          </div>

          <div
            className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-white/10
                            bg-white/5
                            px-3
                            py-1
                            text-xs
                        "
          >
            <BaseBadge letter="G" />

            <span className="text-white/40">—</span>

            <BaseBadge letter="C" />
          </div>
        </div>

        {/* =================================
                    DNA Stage

                    flex-1 + min-h-0
                    ทำให้มันย่อเอง
                    ไม่เกิด Scroll
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        min-h-0
                        flex-1
                        px-4
                    "
        >
          <svg
            viewBox="0 0 400 560"
            preserveAspectRatio="xMidYMid meet"
            className="
                            h-full
                            w-full
                        "
          >
            <defs>
              {/* Glow */}

              <filter id="dnaGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />

                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Backbone */}

              <linearGradient id="dnaBackbone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#bae6fd" />

                <stop offset="0.5" stopColor="#60a5fa" />

                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* =================================
                            Fake 3D Shadow
                        ================================= */}

            <g opacity="0.3" transform="translate(0 6)">
              <path
                d={createBackbonePath(-1)}
                fill="none"
                stroke="#020617"
                strokeWidth="11"
                strokeLinecap="round"
              />

              <path
                d={createBackbonePath(1)}
                fill="none"
                stroke="#020617"
                strokeWidth="11"
                strokeLinecap="round"
              />
            </g>

            {/* =================================
                            Backbone
                        ================================= */}

            <path
              d={createBackbonePath(-1)}
              fill="none"
              stroke="url(#dnaBackbone)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.8"
              filter="url(#dnaGlow)"
            />

            <path
              d={createBackbonePath(1)}
              fill="none"
              stroke="url(#dnaBackbone)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.8"
              filter="url(#dnaGlow)"
            />

            {/* =================================
                            Rows
                        ================================= */}

            {level.map((row, index) => {
              /*
               * ทำ node ที่อยู่ "ด้านหน้า"
               * ใหญ่กว่าเล็กน้อย
               * เพื่อหลอกตาเป็น 3D
               */
              const depth = 1 + 0.18 * Math.sin(phase(row.y));

              const radius = 25 * depth;

              const isHinted = hintedSlot === index && !row.filled;

              const isWrong = wrongSlot === index;

              return (
                <g key={row.id}>
                  {/* Bond */}

                  <line
                    x1={row.leftX}
                    y1={row.y + 4}
                    x2={row.rightX}
                    y2={row.y + 4}
                    stroke="#020617"
                    strokeWidth="7"
                    opacity="0.35"
                    strokeLinecap="round"
                  />

                  <line
                    x1={row.leftX}
                    y1={row.y}
                    x2={row.rightX}
                    y2={row.y}
                    stroke={row.filled ? "#dbeafe" : "#64748b"}
                    strokeWidth={3 * depth}
                    opacity={row.filled ? 0.9 : 0.3}
                    strokeLinecap="round"
                    filter={row.filled ? "url(#dnaGlow)" : undefined}
                  />

                  {/* Left */}

                  <BaseNode
                    x={row.leftX}
                    y={row.y}
                    radius={radius}
                    letter={row.left}
                  />

                  {/* Right Slot */}

                  <g
                    ref={(element) => {
                      if (element) {
                        slotRefs.current.set(index, element);
                      } else {
                        slotRefs.current.delete(index);
                      }
                    }}
                    transform={`translate(${row.rightX}, ${row.y})`}
                  >
                    {row.filled ? (
                      <BaseNodeInner radius={radius} letter={row.answer} />
                    ) : (
                      <>
                        <circle
                          r={radius + 4}
                          fill={
                            isHinted
                              ? COLOR[row.answer]
                              : isWrong
                                ? "#ef4444"
                                : "#0f172a"
                          }
                          opacity={isHinted ? 0.35 : isWrong ? 0.3 : 0.8}
                          stroke={
                            isHinted
                              ? COLOR[row.answer]
                              : isWrong
                                ? "#f87171"
                                : "#64748b"
                          }
                          strokeWidth={isWrong ? 4 : 2}
                          strokeDasharray="6 5"
                        />

                        <circle r={radius - 4} fill="#020617" opacity="0.65" />

                        <text
                          fill={isWrong ? "#fca5a5" : "#94a3b8"}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="22"
                          fontWeight="700"
                          className="pointer-events-none"
                        >
                          ?
                        </text>
                      </>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* =================================
                    Tray
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        shrink-0
                        border-t
                        border-white/5
                        px-5
                        pb-5
                        pt-3
                    "
        >
          <div
            className="
                            mb-2
                            text-center
                            text-[11px]
                            text-slate-400
                        "
          >
            ลากเบสขึ้นไปวางในช่อง ?
          </div>

          <div
            className="
                            flex
                            min-h-12
                            justify-center
                            gap-2
                        "
          >
            {tray.map((tile) => {
              const isDragging = drag?.tileId === tile.id;

              return (
                <button
                  key={tile.id}
                  type="button"
                  onPointerDown={(event) => {
                    handleDragStart(event, tile);
                  }}
                  className={`
                                            flex
                                            h-12
                                            w-12
                                            touch-none
                                            select-none
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-white/20
                                            text-lg
                                            font-black
                                            text-slate-950
                                            shadow-lg
                                            transition
                                            hover:-translate-y-1
                                            ${
                                              isDragging
                                                ? "scale-90 opacity-20"
                                                : ""
                                            }
                                        `}
                  style={{
                    background: COLOR[tile.letter],

                    boxShadow: `0 0 18px ${COLOR[tile.letter]}55`,
                  }}
                >
                  {tile.letter}
                </button>
              );
            })}
          </div>

          {/* Controls */}

          <div
            className="
                            mt-3
                            flex
                            justify-center
                            gap-2
                        "
          >
            <button
              type="button"
              onClick={showHint}
              className="
                                rounded-lg
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-2
                                text-xs
                                font-semibold
                                text-white/70
                                transition
                                hover:bg-white/10
                                hover:text-white
                            "
            >
              💡 ใบ้
            </button>

            <button
              type="button"
              onClick={resetPuzzle}
              className="
                                rounded-lg
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-2
                                text-xs
                                font-semibold
                                text-white/70
                                transition
                                hover:bg-white/10
                                hover:text-white
                            "
            >
              ↻ เริ่มใหม่
            </button>
          </div>
        </div>

        {/* =================================
                    Success
                ================================= */}

        {win && (
          <div
            className="
                            absolute
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            rounded-3xl
                            bg-slate-950/80
                            backdrop-blur-md
                        "
          >
            <div
              className="
                                mx-6
                                w-full
                                max-w-xs
                                rounded-2xl
                                border
                                border-cyan-300/20
                                bg-slate-900
                                p-7
                                text-center
                                shadow-2xl
                            "
            >
              <div
                className="
                                    animate-bounce
                                    text-4xl
                                "
              >
                🧬
              </div>

              <div
                className="
                                    mt-3
                                    text-xl
                                    font-bold
                                    text-cyan-200
                                "
              >
                วิเคราะห์ DNA สำเร็จ!
              </div>

              <div
                className="
                                    mt-2
                                    text-xs
                                    text-slate-400
                                "
              >
                DNA MATCH CONFIRMED
              </div>

              <div
                className="
                                    mx-auto
                                    mt-5
                                    h-1
                                    w-24
                                    animate-pulse
                                    rounded-full
                                    bg-cyan-400
                                "
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================
                Drag Ghost
            ================================= */}

      {drag && (
        <div
          className="
                        pointer-events-none
                        fixed
                        z-[10000]
                        flex
                        h-14
                        w-14
                        -translate-x-1/2
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-white/30
                        text-xl
                        font-black
                        text-slate-950
                        shadow-2xl
                    "
          style={{
            left: dragPosition.x,

            top: dragPosition.y,

            background: COLOR[drag.letter],

            boxShadow: `0 0 28px ${COLOR[drag.letter]}99`,
          }}
        >
          {drag.letter}
        </div>
      )}
    </div>
  );
}

// ========================================
// Small Components
// ========================================

function BaseBadge({ letter }: { letter: BaseLetter }) {
  return (
    <span
      className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                text-[10px]
                font-black
                text-slate-950
            "
      style={{
        background: COLOR[letter],
      }}
    >
      {letter}
    </span>
  );
}

function BaseNode({
  x,
  y,
  radius,
  letter,
}: {
  x: number;
  y: number;
  radius: number;
  letter: BaseLetter;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <BaseNodeInner radius={radius} letter={letter} />
    </g>
  );
}

function BaseNodeInner({
  radius,
  letter,
}: {
  radius: number;
  letter: BaseLetter;
}) {
  return (
    <>
      {/* Fake depth */}

      <circle cy="5" r={radius} fill="#020617" opacity="0.55" />

      <circle r={radius} fill={COLOR[letter]} filter="url(#dnaGlow)" />

      <circle
        cy={-radius * 0.25}
        r={radius * 0.55}
        fill="#ffffff"
        opacity="0.14"
      />

      <circle
        r={radius}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.45"
      />

      <text
        fill="#08111f"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontWeight="800"
        className="pointer-events-none"
      >
        {letter}
      </text>
    </>
  );
}
