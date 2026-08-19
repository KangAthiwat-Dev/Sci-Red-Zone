"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ========================================
// Types
// ========================================

type RGB = [number, number, number];

type Reagent = {
  name: string;

  rgb: RGB;
};

type TargetFormula = {
  id: number;

  pair: [number, number];

  color: RGB;

  done: boolean;
};

type MixStatus = "idle" | "success" | "error";

type ChemicalPuzzleProps = {
  onComplete: () => void;

  onClose: () => void;
};

// ========================================
// Reagents
// ========================================

const REAGENTS: Reagent[] = [
  {
    name: "ฟ้า",
    rgb: [47, 107, 255],
  },

  {
    name: "เหลือง",
    rgb: [255, 210, 31],
  },

  {
    name: "แดง",
    rgb: [255, 59, 78],
  },

  {
    name: "เขียวมิ้นต์",
    rgb: [35, 213, 200],
  },

  {
    name: "ม่วงแดง",
    rgb: [255, 79, 216],
  },

  {
    name: "เขียวมะนาว",
    rgb: [139, 255, 58],
  },
];

// ========================================
// Candidate Formula Pairs
// ========================================

const CANDIDATES: Array<[number, number]> = [
  [2, 1],
  [0, 4],
  [3, 1],
  [0, 3],
  [2, 0],
  [4, 1],
  [3, 4],
  [5, 0],
];

const TARGET_COUNT = 3;

// ========================================
// Helpers
// ========================================

function rgbString(rgb: RGB) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function rgbaString(rgb: RGB, alpha: number) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function blend(a: RGB, b: RGB): RGB {
  return [
    Math.round((a[0] + b[0]) / 2),

    Math.round((a[1] + b[1]) / 2),

    Math.round((a[2] + b[2]) / 2),
  ];
}

function colorDistance(a: RGB, b: RGB) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

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

function createTargets(): TargetFormula[] {
  const candidates = shuffle(CANDIDATES);

  const selected: TargetFormula[] = [];

  for (const pair of candidates) {
    const color = blend(
      REAGENTS[pair[0]].rgb,

      REAGENTS[pair[1]].rgb,
    );

    /*
     * สีเป้าหมายแต่ละสูตร
     * ต้องต่างกันพอสมควร
     */
    const tooSimilar = selected.some(
      (target) => colorDistance(target.color, color) < 70,
    );

    if (tooSimilar) {
      continue;
    }

    selected.push({
      id: selected.length,

      pair: [pair[0], pair[1]],

      color,

      done: false,
    });

    if (selected.length === TARGET_COUNT) {
      break;
    }
  }

  /*
   * กันกรณีสุ่มแล้ว
   * หาไม่ครบ 3 สูตร
   */
  if (selected.length < TARGET_COUNT) {
    for (const pair of CANDIDATES) {
      if (selected.length === TARGET_COUNT) {
        break;
      }

      const exists = selected.some(
        (target) => target.pair[0] === pair[0] && target.pair[1] === pair[1],
      );

      if (exists) {
        continue;
      }

      selected.push({
        id: selected.length,

        pair: [pair[0], pair[1]],

        color: blend(
          REAGENTS[pair[0]].rgb,

          REAGENTS[pair[1]].rgb,
        ),

        done: false,
      });
    }
  }

  return selected;
}

// ========================================
// Component
// ========================================

export default function ChemicalPuzzle({
  onComplete,
  onClose,
}: ChemicalPuzzleProps) {
  // ========================================
  // State
  // ========================================

  const [targets, setTargets] = useState<TargetFormula[]>([]);

  const [selected, setSelected] = useState<number[]>([]);

  const [hintIndices, setHintIndices] = useState<number[]>([]);

  const [toast, setToast] = useState("");

  const [mixStatus, setMixStatus] = useState<MixStatus>("idle");

  const [win, setWin] = useState(false);

  // ========================================
  // Timers
  // ========================================

  const timersRef = useRef<Set<number>>(new Set());

  const addTimer = useCallback(
    (
      callback: () => void,

      delay: number,
    ) => {
      const timer = window.setTimeout(
        () => {
          timersRef.current.delete(timer);

          callback();
        },

        delay,
      );

      timersRef.current.add(timer);

      return timer;
    },
    [],
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timersRef.current.clear();
  }, []);

  // ========================================
  // Reset
  // ========================================

  const resetPuzzle = useCallback(() => {
    clearTimers();

    setTargets(createTargets());

    setSelected([]);

    setHintIndices([]);

    setToast("");

    setMixStatus("idle");

    setWin(false);
  }, [clearTimers]);

  useEffect(() => {
    resetPuzzle();

    return () => {
      clearTimers();
    };
  }, [resetPuzzle, clearTimers]);

  // ========================================
  // Selected Color
  // ========================================

  const previewColor = useMemo<RGB | null>(() => {
    if (selected.length === 0) {
      return null;
    }

    if (selected.length === 1) {
      return REAGENTS[selected[0]].rgb;
    }

    return blend(
      REAGENTS[selected[0]].rgb,

      REAGENTS[selected[1]].rgb,
    );
  }, [selected]);

  // ========================================
  // Toast
  // ========================================

  function showToast(message: string) {
    setToast(message);

    addTimer(
      () => {
        setToast("");
      },

      1600,
    );
  }

  // ========================================
  // Select Bottle
  // ========================================

  function toggleReagent(index: number) {
    if (win || mixStatus !== "idle") {
      return;
    }

    const currentIndex = selected.indexOf(index);

    // =====================================
    // Remove
    // =====================================

    if (currentIndex >= 0) {
      setSelected((current) => current.filter((value) => value !== index));

      return;
    }

    // =====================================
    // Max 2
    // =====================================

    if (selected.length >= 2) {
      showToast("⚠️ ผสมได้ครั้งละ 2 ขวดเท่านั้น");

      return;
    }

    setSelected((current) => [...current, index]);
  }

  // ========================================
  // Clear Selection
  // ========================================

  function clearSelection() {
    if (mixStatus !== "idle") {
      return;
    }

    setSelected([]);
  }

  // ========================================
  // Complete
  // ========================================

  function showWin() {
    setWin(true);

    addTimer(
      () => {
        onComplete();
      },

      1400,
    );
  }

  // ========================================
  // Mix
  // ========================================

  function handleMix() {
    if (selected.length !== 2 || mixStatus !== "idle" || win) {
      return;
    }

    const mixedColor = blend(
      REAGENTS[selected[0]].rgb,

      REAGENTS[selected[1]].rgb,
    );

    const targetIndex = targets.findIndex(
      (target) => !target.done && colorDistance(target.color, mixedColor) < 22,
    );

    // =====================================
    // Wrong Formula
    // =====================================

    if (targetIndex === -1) {
      setMixStatus("error");

      showToast("สูตรไม่ตรงกับสารที่ต้องการ");

      addTimer(
        () => {
          setMixStatus("idle");

          setSelected([]);
        },

        550,
      );

      return;
    }

    // =====================================
    // Correct Formula
    // =====================================

    setMixStatus("success");

    const nextTargets = targets.map((target, index) =>
      index === targetIndex
        ? {
            ...target,

            done: true,
          }
        : target,
    );

    setTargets(nextTargets);

    addTimer(
      () => {
        setSelected([]);

        setMixStatus("idle");
      },

      700,
    );

    if (nextTargets.every((target) => target.done)) {
      addTimer(showWin, 750);
    }
  }

  // ========================================
  // Hint
  // ========================================

  function showHint() {
    if (win) {
      return;
    }

    const target = targets.find((current) => !current.done);

    if (!target) {
      return;
    }

    setHintIndices([target.pair[0], target.pair[1]]);

    addTimer(
      () => {
        setHintIndices([]);
      },

      900,
    );
  }

  // ========================================
  // Liquid Height
  // ========================================

  const liquidHeight =
    selected.length === 0 ? "12%" : selected.length === 1 ? "45%" : "70%";

  const liquidColor =
    mixStatus === "error"
      ? "rgb(120, 110, 95)"
      : previewColor
        ? rgbString(previewColor)
        : "rgba(160, 190, 230, 0.15)";

  // ========================================
  // Render
  // ========================================

  return (
    <div
      className="
                fixed
                inset-0
                z-9000
                flex
                items-center
                justify-center
                overflow-hidden
                bg-black/80
                p-6
            "
    >
      {/* =================================
                Panel
            ================================= */}

      <div
        className="
                    relative
                    flex
                    h-[min(740px,calc(100vh-48px))]
                    w-full
                    max-w-140
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-violet-300/20
                    bg-slate-950/95
                    p-5
                    text-white
                    shadow-[0_30px_100px_rgba(0,0,0,0.75)]
                "
      >
        {/* =================================
                    Background Glow
                ================================= */}

        <div
          className="
    pointer-events-none
    absolute
    -left-24
    -top-28
    h-72
    w-72
    rounded-full
    bg-[radial-gradient(circle,rgba(52,211,153,0.09)_0%,transparent_70%)]
  "
        />

        <div
          className="
    pointer-events-none
    absolute
    -bottom-24
    -right-24
    h-72
    w-72
    rounded-full
    bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)]
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
                        z-50
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        bg-black/30
                        text-xl
                        text-white/50
                        transition
                        hover:bg-white/10
                        hover:text-white
                    "
          aria-label="ปิด Chemical Puzzle"
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
                        text-center
                    "
        >
          <div
            className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.35em]
                            text-emerald-300/60
                        "
          >
            LAB MISSION · PUZZLE 3
          </div>

          <h2
            className="
                            mt-1
                            text-2xl
                            font-bold
                            tracking-wide
                            text-emerald-100
                        "
          >
            ผสมสารยับยั้ง
          </h2>

          <p
            className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
          >
            เลือกสาร 2 ขวด แล้วผสมให้ได้สีตรงกับสูตร
          </p>
        </div>

        {/* =================================
                    Targets
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        mt-3
                        shrink-0
                    "
        >
          <div
            className="
                            flex
                            justify-center
                            gap-6
                        "
          >
            {targets.map((target, index) => (
              <TargetTube key={target.id} index={index} target={target} />
            ))}
          </div>

          <div
            className="
                            mt-1
                            text-center
                            text-[10px]
                            text-slate-500
                        "
          >
            สูตรสีที่ต้องสังเคราะห์
          </div>
        </div>

        {/* =================================
                    Main Station
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        flex
                        min-h-0
                        flex-1
                        items-center
                        justify-center
                        py-2
                    "
        >
          <div
            className="
                            flex
                            flex-col
                            items-center
                        "
          >
            {/* =============================
                            Beaker
                        ============================= */}

            <div
              className={`
                                relative
                                h-37.5
                                w-31.25
                                transition
                                duration-300
                                ${mixStatus === "success" ? "scale-105" : ""}
                                ${mixStatus === "error" ? "rotate-2" : ""}
                            `}
            >
              {/* Back glow */}

              <div
                className={`
    pointer-events-none
    absolute
    inset-3
    rounded-full
    transition
    duration-300

    ${
      mixStatus === "success"
        ? "bg-[radial-gradient(circle,rgba(110,231,183,0.30)_0%,transparent_72%)]"
        : mixStatus === "error"
          ? "bg-[radial-gradient(circle,rgba(180,83,9,0.22)_0%,transparent_72%)]"
          : "bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_72%)]"
    }
  `}
              />

              {/* Fake rear glass */}

              <div
                className="
                                    absolute
                                    inset-x-0
                                    bottom-0
                                    top-2
                                    overflow-hidden
                                    rounded-b-[30px]
                                    rounded-t-xl
                                    border-[3px]
                                    border-t-0
                                    border-sky-100/30
                                    bg-white/2.5
                                    shadow-[inset_8px_0_12px_rgba(255,255,255,0.05),inset_-12px_-10px_20px_rgba(0,0,0,0.38),0_12px_25px_rgba(0,0,0,0.4)]
                                "
              >
                {/* Liquid */}

                <div
                  className="
                                        absolute
                                        inset-x-0
                                        bottom-0
                                        transition-all
                                        duration-500
                                    "
                  style={{
                    height: liquidHeight,

                    background: liquidColor,

                    boxShadow: previewColor
                      ? `inset 0 0 24px ${rgbaString(
                          previewColor,
                          0.7,
                        )}, 0 0 18px ${rgbaString(previewColor, 0.25)}`
                      : undefined,
                  }}
                >
                  {/* Liquid top */}

                  <div
                    className="
                                            absolute
                                            -top-1
                                            left-0
                                            right-0
                                            h-3
                                            rounded-[50%]
                                            bg-white/20
                                        "
                  />

                  {/* Bubbles */}

                  {selected.length === 2 && mixStatus !== "error" && (
                    <>
                      <Bubble left="18%" bottom="12%" size={7} delay="0s" />

                      <Bubble left="35%" bottom="24%" size={5} delay="0.2s" />

                      <Bubble left="53%" bottom="10%" size={8} delay="0.4s" />

                      <Bubble left="72%" bottom="30%" size={5} delay="0.1s" />

                      <Bubble left="82%" bottom="14%" size={6} delay="0.3s" />
                    </>
                  )}
                </div>

                {/* Glass Highlight */}

                <div
                  className="
                                        pointer-events-none
                                        absolute
                                        left-3
                                        top-3
                                        h-[70%]
                                        w-3
                                        rounded-full
                                        bg-linear-to-b
                                        from-white/30
                                        to-transparent
                                        blur-[1px]
                                    "
                />

                <div
                  className="
                                        pointer-events-none
                                        absolute
                                        right-3
                                        top-10
                                        h-[48%]
                                        w-1.5
                                        rounded-full
                                        bg-white/10
                                        blur-[1px]
                                    "
                />
              </div>

              {/* Rim */}

              <div
                className="
                                    pointer-events-none
                                    absolute
                                    -left-1
                                    -right-1
                                    top-0
                                    h-4
                                    rounded-full
                                    border-2
                                    border-sky-100/35
                                    bg-slate-800/40
                                    shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),0_3px_6px_rgba(0,0,0,0.4)]
                                "
              />
            </div>

            {/* =============================
                            Selected Slots
                        ============================= */}

            <div
              className="
                                mt-3
                                flex
                                items-center
                                gap-2
                            "
            >
              <ChemicalSlot reagentIndex={selected[0]} />

              <span
                className="
                                    text-sm
                                    font-bold
                                    text-white/30
                                "
              >
                +
              </span>

              <ChemicalSlot reagentIndex={selected[1]} />
            </div>

            {/* =============================
                            Mix Actions
                        ============================= */}

            <div
              className="
                                mt-3
                                flex
                                gap-2
                            "
            >
              <button
                type="button"
                onClick={clearSelection}
                disabled={selected.length === 0 || mixStatus !== "idle"}
                className="
                                    rounded-lg
                                    border
                                    border-white/10
                                    bg-white/5
                                    px-4
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-white/60
                                    transition
                                    hover:bg-white/10
                                    hover:text-white
                                    disabled:cursor-default
                                    disabled:opacity-30
                                "
              >
                เทออก
              </button>

              <button
                type="button"
                onClick={handleMix}
                disabled={selected.length !== 2 || mixStatus !== "idle"}
                className="
                                    rounded-lg
                                    bg-linear-to-r
                                    from-emerald-300
                                    to-violet-400
                                    px-5
                                    py-2
                                    text-xs
                                    font-black
                                    text-slate-950
                                    shadow-[0_0_18px_rgba(126,240,208,0.15)]
                                    transition
                                    hover:brightness-110
                                    disabled:cursor-default
                                    disabled:opacity-30
                                "
              >
                ผสม
              </button>
            </div>
          </div>
        </div>

        {/* =================================
                    Reagent Shelf
                ================================= */}

        <div
          className="
                        relative
                        z-10
                        shrink-0
                        border-t
                        border-white/5
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
            เลือกสาร 2 ขวด
          </div>

          <div
            className="
                            flex
                            justify-center
                            gap-3
                        "
          >
            {REAGENTS.map((reagent, index) => {
              const isSelected = selected.includes(index);

              const isHint = hintIndices.includes(index);

              return (
                <ReagentBottle
                  key={reagent.name}
                  reagent={reagent}
                  selected={isSelected}
                  hint={isHint}
                  onClick={() => {
                    toggleReagent(index);
                  }}
                />
              );
            })}
          </div>

          {/* =================================
                        Hint
                    ================================= */}

          <div
            className="
                            mt-3
                            flex
                            justify-center
                        "
          >
            <button
              type="button"
              onClick={showHint}
              disabled={hintIndices.length > 0}
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
                                disabled:opacity-40
                            "
            >
              💡 ใบ้
            </button>
          </div>
        </div>

        {/* =================================
                    Toast
                ================================= */}

        {toast && (
          <div
            className="
                            absolute
                            bottom-5
                            left-1/2
                            z-80
                            -translate-x-1/2
                            whitespace-nowrap
                            rounded-xl
                            border
                            border-rose-300/30
                            bg-rose-950/90
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-rose-200
                            shadow-xl
                            backdrop-blur-md
                        "
          >
            {toast}
          </div>
        )}

        {/* =================================
                    Win
                ================================= */}

        {win && (
          <div
            className="
                            absolute
                            inset-0
                            z-100
                            flex
                            items-center
                            justify-center
                            rounded-3xl
                            bg-slate-950/85
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
                                border-emerald-300/20
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
                🧪
              </div>

              <h3
                className="
                                    mt-3
                                    text-xl
                                    font-bold
                                    text-emerald-200
                                "
              >
                ผสมสารยับยั้งสำเร็จ!
              </h3>

              <p
                className="
                                    mt-2
                                    text-xs
                                    text-slate-400
                                "
              >
                สังเคราะห์สารครบทุกสูตรแล้ว
              </p>

              <div
                className="
                                    mx-auto
                                    mt-5
                                    h-1
                                    w-24
                                    animate-pulse
                                    rounded-full
                                    bg-linear-to-r
                                    from-emerald-300
                                    to-violet-400
                                "
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// Target Tube
// ========================================

function TargetTube({
  target,
  index,
}: {
  target: TargetFormula;

  index: number;
}) {
  return (
    <div
      className="
                flex
                flex-col
                items-center
                gap-1.5
            "
    >
      <div
        className={`
                    relative
                    h-18
                    w-9.5
                    overflow-hidden
                    rounded-b-2xl
                    rounded-t-md
                    border-2
                    border-t-0
                    bg-white/2.5
                    shadow-[inset_3px_0_5px_rgba(255,255,255,0.06),inset_-5px_-5px_8px_rgba(0,0,0,0.3)]
                    ${
                      target.done
                        ? "border-emerald-300/70"
                        : "border-sky-100/25"
                    }
                `}
      >
        {/* Liquid */}

        <div
          className="
                        absolute
                        inset-x-0
                        bottom-0
                        h-[78%]
                    "
          style={{
            background: rgbString(target.color),

            boxShadow: `inset 0 0 12px ${rgbaString(target.color, 0.7)}`,
          }}
        >
          <div
            className="
                            absolute
                            -top-1
                            left-0
                            right-0
                            h-2
                            rounded-full
                            bg-white/20
                        "
          />
        </div>

        {/* Glass highlight */}

        <div
          className="
                        pointer-events-none
                        absolute
                        left-1.5
                        top-2
                        h-[65%]
                        w-1.5
                        rounded-full
                        bg-white/20
                        blur-[0.5px]
                    "
        />

        {/* Done */}

        {target.done && (
          <div
            className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-emerald-950/20
                            text-xl
                            font-black
                            text-white
                            drop-shadow-lg
                        "
          >
            ✓
          </div>
        )}
      </div>

      <div
        className={`
                    text-[10px]
                    font-semibold
                    ${target.done ? "text-emerald-300" : "text-slate-500"}
                `}
      >
        สีที่ {index + 1}
      </div>
    </div>
  );
}

// ========================================
// Selected Slot
// ========================================

function ChemicalSlot({ reagentIndex }: { reagentIndex: number | undefined }) {
  const reagent = reagentIndex !== undefined ? REAGENTS[reagentIndex] : null;

  return (
    <div
      className={`
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border-2
                ${reagent ? "border-white/30" : "border-dashed border-white/15"}
            `}
      style={{
        background: reagent ? rgbString(reagent.rgb) : "rgba(255,255,255,0.02)",

        boxShadow: reagent
          ? `inset 2px 2px 5px rgba(255,255,255,.25), inset -4px -4px 6px rgba(0,0,0,.25), 0 0 10px ${rgbaString(
              reagent.rgb,
              0.25,
            )}`
          : undefined,
      }}
    >
      {reagent && (
        <div
          className="
                        absolute
                        left-[18%]
                        top-[12%]
                        h-[30%]
                        w-[30%]
                        rounded-full
                        bg-white/30
                        blur-[1px]
                    "
        />
      )}
    </div>
  );
}

// ========================================
// Reagent Bottle
// ========================================

function ReagentBottle({
  reagent,
  selected,
  hint,
  onClick,
}: {
  reagent: Reagent;

  selected: boolean;

  hint: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={reagent.name}
      className={`
                relative
                h-18
                w-12
                shrink-0
                transition
                duration-200
                ${
                  selected ? "-translate-y-2 scale-105" : "hover:-translate-y-1"
                }
            `}
    >
      {/* Bottle shadow */}

      <div
        className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-2
                    right-2
                    h-2
                    rounded-full
                    bg-black/40
                    blur-[3px]
                "
      />

      {/* Neck */}

      <div
        className="
                    absolute
                    left-1/2
                    top-1
                    h-4
                    w-4
                    -translate-x-1/2
                    rounded-t
                    border-x
                    border-white/20
                    bg-white/10
                "
      />

      {/* Cap */}

      <div
        className="
                    absolute
                    left-1/2
                    top-0
                    z-20
                    h-2
                    w-5
                    -translate-x-1/2
                    rounded
                    bg-slate-300
                    shadow-[inset_0_2px_2px_rgba(255,255,255,0.6),0_2px_3px_rgba(0,0,0,0.35)]
                "
      />

      {/* Glass */}

      <div
        className={`
                    absolute
                    bottom-1
                    left-1
                    right-1
                    top-4
                    overflow-hidden
                    rounded-b-xl
                    rounded-t-lg
                    border-2
                    bg-white/[0.035]
                    shadow-[inset_4px_3px_6px_rgba(255,255,255,0.07),inset_-6px_-6px_9px_rgba(0,0,0,0.3)]
                    ${
                      selected
                        ? "border-white/80"
                        : hint
                          ? "border-white"
                          : "border-white/25"
                    }
                    ${hint ? "animate-pulse" : ""}
                `}
        style={{
          boxShadow: hint
            ? `0 0 0 3px rgba(255,255,255,.7), 0 0 22px ${rgbaString(
                reagent.rgb,
                0.8,
              )}, inset 4px 3px 6px rgba(255,255,255,.15)`
            : selected
              ? `0 0 16px ${rgbaString(
                  reagent.rgb,
                  0.55,
                )}, inset 4px 3px 6px rgba(255,255,255,.12)`
              : undefined,
        }}
      >
        {/* Liquid */}

        <div
          className="
                        absolute
                        inset-x-0
                        bottom-0
                        h-[72%]
                    "
          style={{
            background: `linear-gradient(
                                90deg,
                                ${rgbaString(reagent.rgb, 0.65)},
                                ${rgbString(reagent.rgb)} 45%,
                                ${rgbaString(reagent.rgb, 0.75)}
                            )`,

            boxShadow: `inset 0 0 14px ${rgbaString(reagent.rgb, 0.75)}`,
          }}
        >
          <div
            className="
                            absolute
                            -top-1
                            left-0
                            right-0
                            h-2
                            rounded-full
                            bg-white/20
                        "
          />
        </div>

        {/* Fake 3D glass highlight */}

        <div
          className="
                        pointer-events-none
                        absolute
                        left-1.5
                        top-2
                        h-[62%]
                        w-1.5
                        rounded-full
                        bg-linear-to-b
                        from-white/35
                        to-transparent
                        blur-[0.5px]
                    "
        />

        <div
          className="
                        pointer-events-none
                        absolute
                        right-1.5
                        top-5
                        h-[42%]
                        w-1
                        rounded-full
                        bg-white/10
                    "
        />
      </div>
    </button>
  );
}

// ========================================
// Bubble
// ========================================

function Bubble({
  left,
  bottom,
  size,
  delay,
}: {
  left: string;

  bottom: string;

  size: number;

  delay: string;
}) {
  return (
    <div
      className="
                absolute
                animate-bounce
                rounded-full
                border
                border-white/40
                bg-white/25
            "
      style={{
        left,

        bottom,

        width: size,

        height: size,

        animationDelay: delay,

        animationDuration: "1.5s",
      }}
    />
  );
}
