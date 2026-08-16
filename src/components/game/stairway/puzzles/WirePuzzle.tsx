"use client";

import {
    useState,
} from "react";

type WireColor =
    | "red"
    | "blue"
    | "yellow";

type WirePuzzleProps = {
    onComplete: () => void;

    onClose: () => void;
};

const WIRES: {
    id: WireColor;
    label: string;
    className: string;
}[] = [
    {
        id: "red",
        label: "RED",
        className:
            "bg-red-500",
    },

    {
        id: "blue",
        label: "BLUE",
        className:
            "bg-blue-500",
    },

    {
        id: "yellow",
        label: "YELLOW",
        className:
            "bg-yellow-400",
    },
];

/*
 * จงใจเรียง Socket ไม่ตรงกับฝั่งซ้าย
 */
const SOCKETS: WireColor[] = [
    "blue",
    "yellow",
    "red",
];

export default function WirePuzzle({
    onComplete,
    onClose,
}: WirePuzzleProps) {
    const [
        selectedWire,
        setSelectedWire,
    ] =
        useState<WireColor | null>(
            null,
        );

    const [
        connected,
        setConnected,
    ] = useState<
        Set<WireColor>
    >(
        () =>
            new Set<WireColor>(),
    );

    const [
        message,
        setMessage,
    ] = useState(
        "เลือกสายไฟ แล้วต่อเข้าช่องสีเดียวกัน",
    );

    function connectWire(
        socket:
            WireColor,
    ) {
        if (
            selectedWire ===
            null
        ) {
            setMessage(
                "เลือกสายไฟก่อน",
            );

            return;
        }

        if (
            selectedWire !==
            socket
        ) {
            setMessage(
                "ต่อสายผิดช่อง",
            );

            setSelectedWire(
                null,
            );

            return;
        }

        const next =
            new Set(
                connected,
            );

        next.add(
            selectedWire,
        );

        setConnected(next);

        setSelectedWire(
            null,
        );

        if (
            next.size ===
            WIRES.length
        ) {
            setMessage(
                "ระบบไฟฟ้ากลับมาทำงานแล้ว",
            );

            window.setTimeout(
                () => {
                    onComplete();
                },
                500,
            );

            return;
        }

        setMessage(
            "เชื่อมต่อสำเร็จ",
        );
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[9000]
                flex
                items-center
                justify-center
                bg-black/80
                backdrop-blur-sm
            "
        >
            <div
                className="
                    w-[700px]
                    max-w-[90vw]
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#101419]
                    p-8
                    text-white
                    shadow-2xl
                "
            >
                <div
                    className="
                        text-xs
                        tracking-[0.35em]
                        text-red-400
                    "
                >
                    ELECTRICAL
                    MAINTENANCE
                </div>

                <h2
                    className="
                        mt-2
                        text-2xl
                        font-bold
                    "
                >
                    ระบบจ่ายไฟประตู
                </h2>

                <p
                    className="
                        mt-1
                        text-sm
                        text-white/50
                    "
                >
                    {
                        message
                    }
                </p>

                <div
                    className="
                        mt-8
                        grid
                        grid-cols-[1fr_100px_1fr]
                        items-center
                        gap-6
                    "
                >
                    {/* LEFT */}

                    <div
                        className="
                            space-y-5
                        "
                    >
                        {WIRES.map(
                            (
                                wire,
                            ) => {
                                const done =
                                    connected.has(
                                        wire.id,
                                    );

                                return (
                                    <button
                                        key={
                                            wire.id
                                        }
                                        disabled={
                                            done
                                        }
                                        onClick={() => {
                                            setSelectedWire(
                                                wire.id,
                                            );

                                            setMessage(
                                                `${wire.label} selected`,
                                            );
                                        }}
                                        className={`
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-lg
                                            border
                                            px-4
                                            py-3
                                            transition

                                            ${
                                                done
                                                    ? "border-emerald-500/30 bg-emerald-500/10 opacity-40"
                                                    : selectedWire ===
                                                      wire.id
                                                    ? "border-white/70 bg-white/10"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        <div
                                            className={`
                                                h-3
                                                w-14
                                                rounded-full
                                                ${wire.className}
                                            `}
                                        />

                                        {
                                            wire.label
                                        }
                                    </button>
                                );
                            },
                        )}
                    </div>

                    {/* CENTER */}

                    <div
                        className="
                            text-center
                            text-3xl
                            text-white/20
                        "
                    >
                        →
                    </div>

                    {/* RIGHT */}

                    <div
                        className="
                            space-y-5
                        "
                    >
                        {SOCKETS.map(
                            (
                                socket,
                            ) => {
                                const wire =
                                    WIRES.find(
                                        (
                                            value,
                                        ) =>
                                            value.id ===
                                            socket,
                                    )!;

                                const done =
                                    connected.has(
                                        socket,
                                    );

                                return (
                                    <button
                                        key={
                                            socket
                                        }
                                        disabled={
                                            done
                                        }
                                        onClick={() =>
                                            connectWire(
                                                socket,
                                            )
                                        }
                                        className={`
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-lg
                                            border
                                            px-4
                                            py-3
                                            transition

                                            ${
                                                done
                                                    ? "border-emerald-400 bg-emerald-500/15"
                                                    : "border-white/10 bg-black/30 hover:border-white/40"
                                            }
                                        `}
                                    >
                                        SOCKET

                                        <div
                                            className={`
                                                h-5
                                                w-5
                                                rounded-full
                                                ${wire.className}
                                            `}
                                        />
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                <div
                    className="
                        mt-8
                        flex
                        justify-end
                    "
                >
                    <button
                        onClick={
                            onClose
                        }
                        className="
                            rounded-lg
                            border
                            border-white/10
                            px-5
                            py-2
                            text-sm
                            text-white/60
                            hover:bg-white/5
                        "
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}