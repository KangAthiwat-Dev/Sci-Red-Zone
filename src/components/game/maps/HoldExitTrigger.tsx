"use client";

import {
    Html,
} from "@react-three/drei";

import {
    CuboidCollider,
    RigidBody,
} from "@react-three/rapier";

import {
    useFrame,
} from "@react-three/fiber";

import {
    useEffect,
    useRef,
    useState,
} from "react";

type HoldExitTriggerProps = {
    position: [
        number,
        number,
        number,
    ];

    halfExtents: [
        number,
        number,
        number,
    ];

    onComplete: () => void;

    holdDuration?: number;

    promptOffsetY?: number;

    enabled?: boolean;

    showPrompt?: boolean;
};

type TerminalState =
    | "idle"
    | "encoding"
    | "granted";

const ACCESS_CODE = [
    "7",
    "4",
    "2",
    "9",
];

const RING_RADIUS = 26;

const RING_CIRCUMFERENCE =
    2 *
    Math.PI *
    RING_RADIUS;

export default function HoldExitTrigger({
    position,
    halfExtents,
    onComplete,
    holdDuration = 2.2,
    promptOffsetY = 2,
    enabled = true,
    showPrompt = true,
}: HoldExitTriggerProps) {
    const playerInsideRef =
        useRef(false);

    const holdingERef =
        useRef(false);

    const holdTimeRef =
        useRef(0);

    const completedRef =
        useRef(false);

    const progressCircleRef =
        useRef<SVGCircleElement | null>(
            null,
        );

    const percentRef =
        useRef<HTMLSpanElement | null>(
            null,
        );

    const codeRefs =
        useRef<
            Array<
                HTMLSpanElement | null
            >
        >([]);

    const [
        isPlayerNear,
        setIsPlayerNear,
    ] = useState(false);

    const [
        terminalState,
        setTerminalState,
    ] =
        useState<TerminalState>(
            "idle",
        );

    const [
        activeKey,
        setActiveKey,
    ] = useState<
        string | null
    >(null);

    // ========================================
    // Reset UI
    // ========================================

    function resetTerminalUI() {
        if (
            progressCircleRef.current
        ) {
            progressCircleRef.current.style
                .strokeDashoffset =
                `${RING_CIRCUMFERENCE}`;
        }

        if (
            percentRef.current
        ) {
            percentRef.current.textContent =
                "0%";
        }

        codeRefs.current.forEach(
            (
                element,
                index,
            ) => {
                if (!element) {
                    return;
                }

                element.textContent =
                    "•";

                element.style.color =
                    "rgba(255,255,255,0.25)";

                element.style.borderColor =
                    "rgba(255,255,255,0.1)";
            },
        );

        setActiveKey(null);
    }

    // ========================================
    // Stop Hold
    // ========================================

    function stopHolding() {
        if (
            completedRef.current
        ) {
            return;
        }

        holdingERef.current =
            false;

        holdTimeRef.current =
            0;

        setTerminalState(
            "idle",
        );

        resetTerminalUI();
    }

    // ========================================
    // Keyboard
    // ========================================

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (
                event.code !==
                    "KeyE" ||
                event.repeat
            ) {
                return;
            }

            if (!enabled) {
                return;
            }

            if (
                !playerInsideRef.current
            ) {
                return;
            }

            if (
                completedRef.current
            ) {
                return;
            }

            event.preventDefault();

            holdTimeRef.current =
                0;

            holdingERef.current =
                true;

            setTerminalState(
                "encoding",
            );

            resetTerminalUI();
        }

        function handleKeyUp(
            event: KeyboardEvent,
        ) {
            if (
                event.code !==
                "KeyE"
            ) {
                return;
            }

            stopHolding();
        }

        function handleBlur() {
            stopHolding();
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        window.addEventListener(
            "keyup",
            handleKeyUp,
        );

        window.addEventListener(
            "blur",
            handleBlur,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            window.removeEventListener(
                "keyup",
                handleKeyUp,
            );

            window.removeEventListener(
                "blur",
                handleBlur,
            );
        };
    }, [
        enabled,
    ]);

    // ========================================
    // Encode Progress
    // ========================================

    useFrame((_, delta) => {
        if (
            !enabled ||
            completedRef.current ||
            !playerInsideRef.current ||
            !holdingERef.current
        ) {
            return;
        }

        const safeDelta =
            Math.min(
                delta,
                0.1,
            );

        holdTimeRef.current +=
            safeDelta;

        const progress =
            Math.min(
                holdTimeRef.current /
                    holdDuration,
                1,
            );

        // ====================================
        // Ring
        // ====================================

        const offset =
            RING_CIRCUMFERENCE *
            (
                1 -
                progress
            );

        if (
            progressCircleRef.current
        ) {
            progressCircleRef.current.style
                .strokeDashoffset =
                `${offset}`;
        }

        // ====================================
        // Percentage
        // ====================================

        if (
            percentRef.current
        ) {
            percentRef.current.textContent =
                `${Math.round(
                    progress *
                        100,
                )}%`;
        }

        // ====================================
        // Reveal Code
        // ====================================

        const revealedCount =
            Math.min(
                ACCESS_CODE.length,
                Math.floor(
                    progress *
                        ACCESS_CODE.length +
                        0.01,
                ),
            );

        for (
            let index = 0;
            index <
            ACCESS_CODE.length;
            index += 1
        ) {
            const element =
                codeRefs.current[
                    index
                ];

            if (!element) {
                continue;
            }

            if (
                index <
                revealedCount
            ) {
                element.textContent =
                    ACCESS_CODE[
                        index
                    ];

                element.style.color =
                    "#67e8f9";

                element.style.borderColor =
                    "rgba(34,211,238,0.65)";
            } else {
                element.textContent =
                    "•";

                element.style.color =
                    "rgba(255,255,255,0.25)";

                element.style.borderColor =
                    "rgba(255,255,255,0.1)";
            }
        }

        // ====================================
        // Fake Keypad Animation
        // ====================================

        const currentIndex =
            Math.min(
                ACCESS_CODE.length -
                    1,
                Math.floor(
                    progress *
                        ACCESS_CODE.length,
                ),
            );

        setActiveKey(
            ACCESS_CODE[
                currentIndex
            ],
        );

        // ====================================
        // ยังไม่เสร็จ
        // ====================================

        if (progress < 1) {
            return;
        }

        // ====================================
        // ACCESS GRANTED
        // ====================================

        completedRef.current =
            true;

        holdingERef.current =
            false;

        setActiveKey(null);

        setTerminalState(
            "granted",
        );

        if (
            progressCircleRef.current
        ) {
            progressCircleRef.current.style
                .strokeDashoffset =
                "0";
        }

        if (
            percentRef.current
        ) {
            percentRef.current.textContent =
                "100%";
        }

        /*
         * ให้เห็น ACCESS GRANTED
         * แวบนึงก่อนเข้า map ต่อ
         */
        window.setTimeout(
            () => {
                onComplete();
            },
            450,
        );
    });

    // ========================================
    // Reset ถ้า Disable
    // ========================================

    useEffect(() => {
        if (enabled) {
            return;
        }

        if (
            completedRef.current
        ) {
            return;
        }

        holdingERef.current =
            false;

        holdTimeRef.current =
            0;

        setTerminalState(
            "idle",
        );

        resetTerminalUI();
    }, [
        enabled,
    ]);

    return (
        <>
            {/* ======================
                Trigger
            ====================== */}

            <RigidBody
                type="fixed"
                colliders={false}
            >
                <CuboidCollider
                    sensor
                    args={
                        halfExtents
                    }
                    position={
                        position
                    }

                    onIntersectionEnter={({
                        other,
                    }) => {
                        if (
                            other
                                .rigidBodyObject
                                ?.name !==
                            "player"
                        ) {
                            return;
                        }

                        playerInsideRef.current =
                            true;

                        setIsPlayerNear(
                            true,
                        );
                    }}

                    onIntersectionExit={({
                        other,
                    }) => {
                        if (
                            other
                                .rigidBodyObject
                                ?.name !==
                            "player"
                        ) {
                            return;
                        }

                        playerInsideRef.current =
                            false;

                        setIsPlayerNear(
                            false,
                        );

                        stopHolding();
                    }}
                />
            </RigidBody>

            {/* ======================
                ACCESS TERMINAL UI
            ====================== */}

            {showPrompt &&
                enabled &&
                isPlayerNear &&
                !completedRef.current && (
                    <Html
                        position={[
                            position[0],
                            position[1] +
                                promptOffsetY,
                            position[2],
                        ]}
                        center
                    >
                        <div
                            className="
                                w-[320px]
                                select-none
                                overflow-hidden
                                rounded-xl
                                border
                                border-cyan-400/30
                                bg-[#020a0f]/95
                                font-mono
                                text-white
                                shadow-[0_0_40px_rgba(34,211,238,0.15)]
                                backdrop-blur-xl
                            "
                        >
                            {/* =================
                                TOP BAR
                            ================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-cyan-400/15
                                    bg-cyan-400/5
                                    px-4
                                    py-2
                                "
                            >
                                <div
                                    className="
                                        text-[9px]
                                        font-bold
                                        tracking-[0.3em]
                                        text-cyan-300
                                    "
                                >
                                    ACCESS TERMINAL
                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-[8px]
                                        text-white/30
                                    "
                                >
                                    SECURE

                                    <span
                                        className="
                                            h-1.5
                                            w-1.5
                                            animate-pulse
                                            rounded-full
                                            bg-cyan-400
                                        "
                                    />
                                </div>
                            </div>

                            <div
                                className="
                                    px-5
                                    py-4
                                "
                            >
                                {/* =================
                                    STATUS
                                ================= */}

                                <div
                                    className="
                                        text-[9px]
                                        uppercase
                                        tracking-[0.2em]
                                        text-white/35
                                    "
                                >
                                    DOOR SECURITY
                                    PROTOCOL
                                </div>

                                <div
                                    className={`
                                        mt-1
                                        text-sm
                                        font-bold
                                        tracking-[0.08em]

                                        ${
                                            terminalState ===
                                            "granted"
                                                ? "text-emerald-300"
                                                : terminalState ===
                                                    "encoding"
                                                  ? "text-cyan-300"
                                                  : "text-white"
                                        }
                                    `}
                                >
                                    {terminalState ===
                                    "granted"
                                        ? "ACCESS GRANTED"
                                        : terminalState ===
                                            "encoding"
                                          ? "ENCODING ACCESS KEY..."
                                          : "AUTHORIZATION REQUIRED"}
                                </div>

                                {/* =================
                                    MAIN
                                ================= */}

                                <div
                                    className="
                                        mt-4
                                        flex
                                        items-center
                                        gap-5
                                    "
                                >
                                    {/* Ring */}

                                    <div
                                        className="
                                            relative
                                            h-[74px]
                                            w-[74px]
                                            shrink-0
                                        "
                                    >
                                        <svg
                                            viewBox="0 0 72 72"
                                            className="
                                                h-full
                                                w-full
                                                -rotate-90
                                            "
                                        >
                                            <circle
                                                cx="36"
                                                cy="36"
                                                r={
                                                    RING_RADIUS
                                                }
                                                fill="none"
                                                stroke="rgba(255,255,255,0.08)"
                                                strokeWidth="5"
                                            />

                                            <circle
                                                ref={
                                                    progressCircleRef
                                                }
                                                cx="36"
                                                cy="36"
                                                r={
                                                    RING_RADIUS
                                                }
                                                fill="none"
                                                stroke={
                                                    terminalState ===
                                                    "granted"
                                                        ? "#34d399"
                                                        : "#22d3ee"
                                                }
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                strokeDasharray={
                                                    RING_CIRCUMFERENCE
                                                }
                                                strokeDashoffset={
                                                    RING_CIRCUMFERENCE
                                                }
                                            />
                                        </svg>

                                        <div
                                            className="
                                                absolute
                                                inset-0
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            {terminalState ===
                                            "idle" ? (
                                                <div
                                                    className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        items-center
                                                        justify-center
                                                        rounded-md
                                                        bg-white
                                                        text-lg
                                                        font-black
                                                        text-black
                                                    "
                                                >
                                                    E
                                                </div>
                                            ) : (
                                                <span
                                                    ref={
                                                        percentRef
                                                    }
                                                    className="
                                                        text-[11px]
                                                        font-bold
                                                        text-cyan-200
                                                    "
                                                >
                                                    0%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Code */}

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >
                                        <div
                                            className="
                                                text-[8px]
                                                uppercase
                                                tracking-[0.2em]
                                                text-white/30
                                            "
                                        >
                                            ENCRYPTION KEY
                                        </div>

                                        <div
                                            className="
                                                mt-2
                                                flex
                                                gap-2
                                            "
                                        >
                                            {ACCESS_CODE.map(
                                                (
                                                    _,
                                                    index,
                                                ) => (
                                                    <span
                                                        key={
                                                            index
                                                        }
                                                        ref={(
                                                            element,
                                                        ) => {
                                                            codeRefs.current[
                                                                index
                                                            ] =
                                                                element;
                                                        }}
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-md
                                                            border
                                                            border-white/10
                                                            bg-black/40
                                                            text-lg
                                                            font-black
                                                            text-white/25
                                                        "
                                                    >
                                                        •
                                                    </span>
                                                ),
                                            )}
                                        </div>

                                        <div
                                            className="
                                                mt-3
                                                text-[9px]
                                                leading-relaxed
                                                text-white/35
                                            "
                                        >
                                            {terminalState ===
                                            "encoding"
                                                ? "KEEP E PRESSED · VERIFYING KEY..."
                                                : "HOLD E TO BEGIN ENCRYPTION"}
                                        </div>
                                    </div>
                                </div>

                                {/* =================
                                    KEYPAD
                                ================= */}

                                <div
                                    className="
                                        mt-4
                                        grid
                                        grid-cols-3
                                        gap-1.5
                                        border-t
                                        border-white/5
                                        pt-4
                                    "
                                >
                                    {[
                                        "1",
                                        "2",
                                        "3",
                                        "4",
                                        "5",
                                        "6",
                                        "7",
                                        "8",
                                        "9",
                                    ].map(
                                        (
                                            key,
                                        ) => (
                                            <div
                                                key={
                                                    key
                                                }
                                                className={`
                                                    flex
                                                    h-7
                                                    items-center
                                                    justify-center
                                                    rounded
                                                    border
                                                    text-[10px]
                                                    transition

                                                    ${
                                                        activeKey ===
                                                        key
                                                            ? "border-cyan-300/80 bg-cyan-400/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                                                            : "border-white/5 bg-white/[0.025] text-white/20"
                                                    }
                                                `}
                                            >
                                                {
                                                    key
                                                }
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* =================
                                SCAN LINE
                            ================= */}

                            {terminalState ===
                                "encoding" && (
                                <div
                                    className="
                                        h-[2px]
                                        w-full
                                        animate-pulse
                                        bg-cyan-300/50
                                        shadow-[0_0_12px_rgba(34,211,238,0.7)]
                                    "
                                />
                            )}
                        </div>
                    </Html>
                )}
        </>
    );
}