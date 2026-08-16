"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

// ========================================
// Types
// ========================================

type CellData = {
    id: number;

    x: number;
    y: number;

    radius: number;

    vx: number;
    vy: number;

    bad: boolean;

    found: boolean;

    phase: number;

    wobble: number;
};

type RippleData = {
    id: number;

    x: number;
    y: number;

    radius: number;
};

type CellPuzzleProps = {
    onComplete: () => void;

    onClose: () => void;
};

// ========================================
// Config
// ========================================

const TOTAL_CELLS = 14;

const BAD_CELLS = 4;

// ========================================
// Helpers
// ========================================

function random(
    min: number,
    max: number,
) {
    return (
        min +
        Math.random() *
            (max - min)
    );
}

function shuffle<T>(
    source: T[],
) {
    const result = [
        ...source,
    ];

    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() *
                    (i + 1),
            );

        [
            result[i],
            result[j],
        ] = [
            result[j],
            result[i],
        ];
    }

    return result;
}

// ========================================
// Create Level
// ========================================

function createLevel():
    CellData[] {
    /*
     * true = เซลล์ผิดปกติ
     * false = เซลล์ปกติ
     */
    const badFlags =
        shuffle([
            ...Array(
                BAD_CELLS,
            ).fill(true),

            ...Array(
                TOTAL_CELLS -
                    BAD_CELLS,
            ).fill(false),
        ]) as boolean[];

    return badFlags.map(
        (
            bad,
            index,
        ) => {
            /*
             * radius ใช้ coordinate
             * แบบ normalized 0-1
             */
            const radius =
                random(
                    0.055,
                    0.077,
                );

            /*
             * สุ่มตำแหน่งภายในวงกลม
             */
            const angle =
                random(
                    0,
                    Math.PI *
                        2,
                );

            const distance =
                Math.sqrt(
                    Math.random(),
                ) *
                (0.5 -
                    radius -
                    0.025);

            const x =
                0.5 +
                Math.cos(
                    angle,
                ) *
                    distance;

            const y =
                0.5 +
                Math.sin(
                    angle,
                ) *
                    distance;

            /*
             * ความเร็ว
             */
            const movementAngle =
                random(
                    0,
                    Math.PI *
                        2,
                );

            const speed =
                random(
                    0.025,
                    0.05,
                );

            return {
                id: index,

                x,
                y,

                radius,

                vx:
                    Math.cos(
                        movementAngle,
                    ) *
                    speed,

                vy:
                    Math.sin(
                        movementAngle,
                    ) *
                    speed,

                bad,

                found: false,

                phase:
                    random(
                        0,
                        Math.PI *
                            2,
                    ),

                wobble: 0,
            };
        },
    );
}

// ========================================
// Cell Puzzle
// ========================================

export default function CellPuzzle({
    onComplete,
    onClose,
}: CellPuzzleProps) {
    // ========================================
    // State
    // ========================================

    const [
        cells,
        setCells,
    ] =
        useState<
            CellData[]
        >([]);

    const [
        foundCount,
        setFoundCount,
    ] =
        useState(0);

    const [
        hintActive,
        setHintActive,
    ] =
        useState(false);

    const [
        win,
        setWin,
    ] =
        useState(false);

    const [
        ripples,
        setRipples,
    ] =
        useState<
            RippleData[]
        >([]);

    // ========================================
    // Refs
    // ========================================

    const lastFrameRef =
        useRef(0);

    const foundIdsRef =
        useRef<
            Set<number>
        >(
            new Set(),
        );

    const timerRefs =
        useRef<
            Set<number>
        >(
            new Set(),
        );

    const rippleIdRef =
        useRef(0);

    // ========================================
    // Timer Helper
    // ========================================

    const addTimer =
        useCallback(
            (
                callback:
                    () => void,

                delay: number,
            ) => {
                const id =
                    window.setTimeout(
                        () => {
                            timerRefs.current.delete(
                                id,
                            );

                            callback();
                        },

                        delay,
                    );

                timerRefs.current.add(
                    id,
                );

                return id;
            },
            [],
        );

    const clearTimers =
        useCallback(() => {
            timerRefs.current.forEach(
                (timer) => {
                    window.clearTimeout(
                        timer,
                    );
                },
            );

            timerRefs.current.clear();
        }, []);

    // ========================================
    // Reset
    // ========================================

    const resetPuzzle =
        useCallback(() => {
            clearTimers();

            foundIdsRef.current.clear();

            setCells(
                createLevel(),
            );

            setFoundCount(
                0,
            );

            setHintActive(
                false,
            );

            setWin(
                false,
            );

            setRipples(
                [],
            );

            lastFrameRef.current =
                performance.now();
        }, [
            clearTimers,
        ]);

    // ========================================
    // Start
    // ========================================

    useEffect(() => {
        resetPuzzle();

        return () => {
            clearTimers();
        };
    }, [
        resetPuzzle,
        clearTimers,
    ]);

    // ========================================
    // Cell Movement
    // ========================================

    useEffect(() => {
        if (win) {
            return;
        }

        let frameId = 0;

        function update(
            time: number,
        ) {
            const previousTime =
                lastFrameRef.current ||
                time;

            const delta =
                Math.min(
                    (time -
                        previousTime) /
                        1000,

                    0.05,
                );

            lastFrameRef.current =
                time;

            setCells(
                (current) =>
                    current.map(
                        (cell) => {
                            if (
                                cell.found
                            ) {
                                return cell;
                            }

                            let x =
                                cell.x +
                                cell.vx *
                                    delta;

                            let y =
                                cell.y +
                                cell.vy *
                                    delta;

                            let vx =
                                cell.vx;

                            let vy =
                                cell.vy;

                            /*
                             * ตำแหน่งจากจุดกึ่งกลาง
                             */
                            const dx =
                                x -
                                0.5;

                            const dy =
                                y -
                                0.5;

                            const distance =
                                Math.hypot(
                                    dx,
                                    dy,
                                );

                            /*
                             * ขอบเขตที่ Cell
                             * สามารถอยู่ได้
                             */
                            const limit =
                                0.5 -
                                cell.radius -
                                0.015;

                            /*
                             * ชนขอบกล้อง
                             */
                            if (
                                distance >
                                limit
                            ) {
                                const safeDistance =
                                    Math.max(
                                        distance,
                                        0.0001,
                                    );

                                const nx =
                                    dx /
                                    safeDistance;

                                const ny =
                                    dy /
                                    safeDistance;

                                /*
                                 * Reflection
                                 */
                                const dot =
                                    vx *
                                        nx +
                                    vy *
                                        ny;

                                vx -=
                                    2 *
                                    dot *
                                    nx;

                                vy -=
                                    2 *
                                    dot *
                                    ny;

                                /*
                                 * บังคับกลับเข้า
                                 * วงกลม
                                 */
                                x =
                                    0.5 +
                                    nx *
                                        limit;

                                y =
                                    0.5 +
                                    ny *
                                        limit;
                            }

                            /*
                             * เซลล์ผิดปกติ
                             * ขยับเบี้ยว ๆ เพิ่ม
                             */
                            const wobble =
                                Math.sin(
                                    time *
                                        (cell.bad
                                            ? 0.003
                                            : 0.0015) +
                                        cell.phase,
                                ) *
                                (cell.bad
                                    ? 5
                                    : 1.2);

                            return {
                                ...cell,

                                x,
                                y,

                                vx,
                                vy,

                                wobble,
                            };
                        },
                    ),
            );

            frameId =
                requestAnimationFrame(
                    update,
                );
        }

        frameId =
            requestAnimationFrame(
                update,
            );

        return () => {
            cancelAnimationFrame(
                frameId,
            );
        };
    }, [
        win,
    ]);

    // ========================================
    // Success
    // ========================================

    function showWin() {
        setWin(true);

        /*
         * ขึ้น Success ก่อน
         * แล้วให้ GameScene จัดการต่อ
         */
        addTimer(
            () => {
                onComplete();
            },

            1400,
        );
    }

    // ========================================
    // Cell Click
    // ========================================

    function handleCellClick(
        cell: CellData,
    ) {
        if (
            win ||
            cell.found
        ) {
            return;
        }

        // =====================================
        // Normal Cell
        // =====================================

        if (!cell.bad) {
            /*
             * ไม่มี penalty
             * แค่ ripple บอกว่าเลือกแล้ว
             */

            rippleIdRef.current +=
                1;

            const rippleId =
                rippleIdRef.current;

            setRipples(
                (current) => [
                    ...current,

                    {
                        id:
                            rippleId,

                        x:
                            cell.x,

                        y:
                            cell.y,

                        radius:
                            cell.radius,
                    },
                ],
            );

            addTimer(
                () => {
                    setRipples(
                        (
                            current,
                        ) =>
                            current.filter(
                                (
                                    ripple,
                                ) =>
                                    ripple.id !==
                                    rippleId,
                            ),
                    );
                },

                500,
            );

            return;
        }

        // =====================================
        // Abnormal Cell
        // =====================================

        if (
            foundIdsRef.current.has(
                cell.id,
            )
        ) {
            return;
        }

        foundIdsRef.current.add(
            cell.id,
        );

        setCells(
            (current) =>
                current.map(
                    (
                        currentCell,
                    ) =>
                        currentCell.id ===
                        cell.id
                            ? {
                                  ...currentCell,

                                  found:
                                      true,
                              }
                            : currentCell,
                ),
        );

        setFoundCount(
            (current) => {
                const next =
                    current +
                    1;

                /*
                 * เจอครบ 4 ตัว
                 */
                if (
                    next ===
                    BAD_CELLS
                ) {
                    addTimer(
                        showWin,
                        450,
                    );
                }

                return next;
            },
        );
    }

    // ========================================
    // Hint
    // ========================================

    function showHint() {
        if (
            hintActive ||
            win
        ) {
            return;
        }

        setHintActive(
            true,
        );

        addTimer(
            () => {
                setHintActive(
                    false,
                );
            },

            900,
        );
    }

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
                bg-black/55
                p-6
                backdrop-blur-[2px]
            "
        >
            {/* =================================
                Panel
            ================================= */}

            <div
                className="
                    relative
                    w-full
                    max-w-130
                    overflow-hidden
                    rounded-3xl
                    border
                    border-cyan-300/20
                    bg-slate-950/95
                    p-5
                    text-white
                    shadow-[0_30px_100px_rgba(0,0,0,0.75)]
                "
            >
                {/* Background Glow */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        -left-24
                        -top-24
                        h-72
                        w-72
                        rounded-full
                        bg-cyan-500/10
                        blur-3xl
                    "
                />

                <div
                    className="
                        pointer-events-none
                        absolute
                        -bottom-24
                        -right-20
                        h-72
                        w-72
                        rounded-full
                        bg-red-500/10
                        blur-3xl
                    "
                />

                {/* =================================
                    Close
                ================================= */}

                <button
                    type="button"
                    onClick={
                        onClose
                    }
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
                    aria-label="ปิด Cell Puzzle"
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
                        LAB MISSION ·
                        PUZZLE 2
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
                        หา Cell ผิดปกติ
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        ส่องกล้องหาเซลล์ที่รูปร่าง
                        ผิดปกติ แล้วเลือกให้ครบ
                    </p>
                </div>

                {/* =================================
                    Counter
                ================================= */}

                <div
                    className="
                        relative
                        z-10
                        my-3
                        flex
                        justify-center
                    "
                >
                    <div
                        className="
                            rounded-full
                            border
                            border-emerald-300/25
                            bg-emerald-400/10
                            px-4
                            py-1.5
                            text-xs
                            font-semibold
                            text-emerald-200
                        "
                    >
                        พบแล้ว{" "}

                        <span
                            className="
                                text-sm
                                font-black
                                text-white
                            "
                        >
                            {
                                foundCount
                            }
                        </span>

                        {" "}/{" "}

                        {
                            BAD_CELLS
                        }
                    </div>
                </div>

                {/* =================================
                    Microscope Holder

                    ขนาดย่อตามความสูงจอ
                    เพื่อไม่เกิด Scroll
                ================================= */}

                <div
                    className="
                        relative
                        z-10
                        flex
                        justify-center
                    "
                >
                    {/* Outer microscope ring */}

                    <div
                        className="
                            relative
                            aspect-square
                            w-[min(52vh,380px)]
                            max-w-full
                            rounded-full
                            bg-slate-900
                            p-3
                            shadow-[0_20px_55px_rgba(0,0,0,0.65),0_0_0_1px_rgba(125,211,252,0.15)]
                        "
                    >
                        {/* Fake metal ring */}

                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                rounded-full
                                border-10
                                border-slate-800
                                shadow-[inset_0_3px_8px_rgba(255,255,255,0.08),inset_0_-8px_16px_rgba(0,0,0,0.55)]
                            "
                        />

                        {/* =================================
                            Scope
                        ================================= */}

                        <div
                            className="
                                relative
                                h-full
                                w-full
                                overflow-hidden
                                rounded-full
                                border
                                border-sky-200/15
                                bg-[radial-gradient(circle_at_38%_30%,#173d75_0%,#0b234d_45%,#06142f_72%,#020817_100%)]
                                shadow-[inset_0_0_70px_rgba(0,0,0,0.75),0_0_25px_rgba(59,130,246,0.18)]
                            "
                        >
                            {/* =============================
                                Microscope light
                            ============================= */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-[16%]
                                    top-[10%]
                                    h-[45%]
                                    w-[45%]
                                    rounded-full
                                    bg-cyan-200/10
                                    blur-2xl
                                "
                            />

                            {/* =============================
                                Fake floating particles
                            ============================= */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-[26%]
                                    top-[20%]
                                    h-1
                                    w-1
                                    rounded-full
                                    bg-cyan-100/50
                                    shadow-[40px_40px_0_rgba(207,250,254,0.25),100px_10px_0_rgba(207,250,254,0.2),150px_90px_0_rgba(207,250,254,0.2),30px_160px_0_rgba(207,250,254,0.18),180px_150px_0_rgba(207,250,254,0.18)]
                                "
                            />

                            {/* =============================
                                Cells
                            ============================= */}

                            {cells.map(
                                (
                                    cell,
                                ) => (
                                    <Cell
                                        key={
                                            cell.id
                                        }
                                        cell={
                                            cell
                                        }
                                        hintActive={
                                            hintActive
                                        }
                                        onClick={() => {
                                            handleCellClick(
                                                cell,
                                            );
                                        }}
                                    />
                                ),
                            )}

                            {/* =============================
                                Normal Cell Ripple
                            ============================= */}

                            {ripples.map(
                                (
                                    ripple,
                                ) => (
                                    <div
                                        key={
                                            ripple.id
                                        }
                                        className="
                                            pointer-events-none
                                            absolute
                                            animate-ping
                                            rounded-full
                                            border-2
                                            border-sky-200/70
                                        "
                                        style={{
                                            left: `${
                                                (
                                                    ripple.x -
                                                    ripple.radius
                                                ) *
                                                100
                                            }%`,

                                            top: `${
                                                (
                                                    ripple.y -
                                                    ripple.radius
                                                ) *
                                                100
                                            }%`,

                                            width: `${
                                                ripple.radius *
                                                200
                                            }%`,

                                            height: `${
                                                ripple.radius *
                                                200
                                            }%`,
                                        }}
                                    />
                                ),
                            )}

                            {/* =============================
                                Crosshair
                            ============================= */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-1/2
                                    top-[8%]
                                    h-[84%]
                                    w-px
                                    -translate-x-1/2
                                    bg-sky-100/10
                                "
                            />

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-[8%]
                                    top-1/2
                                    h-px
                                    w-[84%]
                                    -translate-y-1/2
                                    bg-sky-100/10
                                "
                            />

                            {/* =============================
                                Center Reticle
                            ============================= */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-1/2
                                    top-1/2
                                    h-5
                                    w-5
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    rounded-full
                                    border
                                    border-sky-100/10
                                "
                            />

                            {/* =============================
                                Vignette
                            ============================= */}

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    rounded-full
                                    shadow-[inset_0_0_75px_35px_rgba(0,0,0,0.55)]
                                "
                            />
                        </div>
                    </div>
                </div>

                {/* =================================
                    Legend
                ================================= */}

                <div
                    className="
                        relative
                        z-10
                        mt-3
                        flex
                        justify-center
                        gap-5
                        text-[10px]
                        text-slate-400
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-1.5
                        "
                    >
                        <span
                            className="
                                h-2
                                w-2
                                rounded-full
                                bg-emerald-300
                                shadow-[0_0_8px_rgba(110,231,183,0.7)]
                            "
                        />

                        Cell ปกติ
                    </div>

                    <div
                        className="
                            flex
                            items-center
                            gap-1.5
                        "
                    >
                        <span
                            className="
                                h-2
                                w-2
                                rounded-[40%_60%_55%_45%]
                                bg-rose-400
                                shadow-[0_0_8px_rgba(251,113,133,0.7)]
                            "
                        />

                        Cell ผิดปกติ
                    </div>
                </div>

                {/* =================================
                    Controls
                ================================= */}

                <div
                    className="
                        relative
                        z-10
                        mt-3
                        flex
                        justify-center
                        gap-2
                    "
                >
                    <button
                        type="button"
                        onClick={
                            showHint
                        }
                        disabled={
                            hintActive
                        }
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

                    <button
                        type="button"
                        onClick={
                            resetPuzzle
                        }
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

                {/* =================================
                    Success Overlay

                    คลุมแค่ Panel
                    ไม่คลุมทั้ง Game
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
                                🔬
                            </div>

                            <h3
                                className="
                                    mt-3
                                    text-xl
                                    font-bold
                                    text-emerald-200
                                "
                            >
                                ตรวจพบครบแล้ว!
                            </h3>

                            <p
                                className="
                                    mt-2
                                    text-xs
                                    text-slate-400
                                "
                            >
                                แยกเซลล์ที่มีรูปร่างผิดปกติ
                                ได้ครบทั้งหมด
                            </p>

                            <div
                                className="
                                    mx-auto
                                    mt-5
                                    h-1
                                    w-24
                                    animate-pulse
                                    rounded-full
                                    bg-emerald-400
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
// Cell
// ========================================

type CellProps = {
    cell: CellData;

    hintActive: boolean;

    onClick: () => void;
};

function Cell({
    cell,
    hintActive,
    onClick,
}: CellProps) {
    const diameter =
        cell.radius *
        200;

    const hint =
        hintActive &&
        cell.bad &&
        !cell.found;

    // ========================================
    // Good Cell
    // ========================================

    const goodBackground =
        "radial-gradient(circle at 30% 25%, #e2fff9 0%, #8af5df 16%, #4fe3c8 40%, #23ad9d 68%, #0c5e58 100%)";

    // ========================================
    // Bad Cell
    // ========================================

    const badBackground =
        "radial-gradient(circle at 28% 24%, #dcfff8 0%, #76ecd6 15%, #42cdb6 40%, #238d81 67%, #0b4f4a 100%)";

    return (
        <button
            type="button"
            onClick={
                onClick
            }
            disabled={
                cell.found
            }
            className={`
                absolute
                flex
                touch-none
                select-none
                items-center
                justify-center
                border
                outline-none
                transition-[opacity,filter]
                duration-500
                ${
                    cell.bad
                        ? "border-rose-200/15"
                        : "border-cyan-100/20"
                }
                ${
                    cell.found
                        ? "pointer-events-none opacity-0"
                        : "cursor-crosshair opacity-100"
                }
                ${
                    hint
                        ? "z-20 brightness-125"
                        : ""
                }
            `}
            style={{
                left: `${
                    (cell.x -
                        cell.radius) *
                    100
                }%`,

                top: `${
                    (cell.y -
                        cell.radius) *
                    100
                }%`,

                width:
                    `${diameter}%`,

                height:
                    `${diameter}%`,

                /*
                 * Fake 3D wobble
                 */
                transform: `
                    rotate(${cell.wobble}deg)
                    scale(${
                        cell.found
                            ? 1.5
                            : 1
                    })
                `,

                borderRadius:
                    cell.bad
                        ? "62% 38% 55% 45% / 48% 62% 38% 52%"
                        : "50%",

                background:
                    cell.bad
                        ? badBackground
                        : goodBackground,

                boxShadow:
                    hint
                        ? `
                            0 0 0 3px rgba(255,255,255,.85),
                            0 0 28px rgba(251,113,133,.95),
                            inset 3px 4px 9px rgba(255,255,255,.25),
                            inset -5px -7px 12px rgba(0,0,0,.35)
                        `
                        : `
                            0 7px 12px rgba(0,0,0,.38),
                            0 0 14px rgba(79,227,200,.24),
                            inset 3px 4px 8px rgba(255,255,255,.25),
                            inset -5px -7px 11px rgba(0,0,0,.30)
                        `,
            }}
        >
            {/* =================================
                Bottom Depth
            ================================= */}

            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-[7%]
                    left-[18%]
                    h-[18%]
                    w-[64%]
                    rounded-full
                    bg-black/25
                    blur-[3px]
                "
            />

            {/* =================================
                Nucleus
            ================================= */}

            <div
                className="
                    pointer-events-none
                    relative
                    flex
                    items-center
                    justify-center
                    shadow-[inset_2px_2px_4px_rgba(255,255,255,0.14),inset_-3px_-4px_5px_rgba(0,0,0,0.35)]
                "
                style={{
                    width:
                        cell.bad
                            ? "43%"
                            : "35%",

                    height:
                        cell.bad
                            ? "35%"
                            : "35%",

                    borderRadius:
                        cell.bad
                            ? "58% 42% 60% 40% / 50% 62% 38% 50%"
                            : "50%",

                    background:
                        cell.bad
                            ? "radial-gradient(circle at 30% 25%, #3ebbac, #176d66 55%, #073d3a)"
                            : "radial-gradient(circle at 30% 25%, #52cabb, #218f84 55%, #0c544e)",
                }}
            >
                <div
                    className="
                        absolute
                        left-[18%]
                        top-[15%]
                        h-[25%]
                        w-[25%]
                        rounded-full
                        bg-white/20
                        blur-[1px]
                    "
                />
            </div>

            {/* =================================
                Surface Highlight

                ทำให้ดูเหมือนวัตถุทรงกลม
            ================================= */}

            <div
                className="
                    pointer-events-none
                    absolute
                    left-[17%]
                    top-[12%]
                    h-[24%]
                    w-[31%]
                    rotate-[-25deg]
                    rounded-full
                    bg-white/20
                    blur-[1px]
                "
            />

            {/* Tiny reflection */}

            <div
                className="
                    pointer-events-none
                    absolute
                    left-[25%]
                    top-[15%]
                    h-[8%]
                    w-[8%]
                    rounded-full
                    bg-white/60
                    blur-[0.5px]
                "
            />
        </button>
    );
}