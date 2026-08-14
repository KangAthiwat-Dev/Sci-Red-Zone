"use client";

import {
    useState,
} from "react";

type DNAAnswer =
    | "A"
    | "O"
    | "B";

type DNAPuzzleProps = {
    onComplete: () => void;

    onClose: () => void;
};

const CORRECT_ANSWER:
    DNAAnswer = "B";

export default function DNAPuzzle({
    onComplete,
    onClose,
}: DNAPuzzleProps) {
    const [
        selectedAnswer,
        setSelectedAnswer,
    ] =
        useState<DNAAnswer | null>(
            null,
        );

    const [
        message,
        setMessage,
    ] = useState("");

    function handleAnalyze() {
        if (!selectedAnswer) {
            setMessage(
                "กรุณาเลือกผลการวิเคราะห์",
            );

            return;
        }

        if (
            selectedAnswer !==
            CORRECT_ANSWER
        ) {
            setMessage(
                "ไม่พบความสอดคล้องของ DNA — ลองใหม่อีกครั้ง",
            );

            return;
        }

        setMessage(
            "DNA MATCH CONFIRMED",
        );

        /*
         * แสดงผลสำเร็จสั้น ๆ
         * แล้วปิด Puzzle
         */
        window.setTimeout(() => {
            onComplete();
        }, 700);
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
                p-6
                backdrop-blur-sm
            "
        >
            <div
                className="
                    relative
                    w-full
                    max-w-2xl
                    overflow-hidden
                    rounded-2xl
                    border
                    border-cyan-400/30
                    bg-slate-950
                    p-8
                    text-white
                    shadow-2xl
                "
            >
                {/* ==================
                    Close
                ================== */}

                <button
                    type="button"
                    onClick={onClose}
                    className="
                        absolute
                        right-5
                        top-4
                        text-2xl
                        text-white/60
                        hover:text-white
                    "
                >
                    ×
                </button>

                {/* ==================
                    Header
                ================== */}

                <div
                    className="
                        text-xs
                        uppercase
                        tracking-[0.35em]
                        text-cyan-400
                    "
                >
                    Laboratory System
                </div>

                <h2
                    className="
                        mt-2
                        text-3xl
                        font-bold
                    "
                >
                    DNA ANALYSIS
                </h2>

                <p
                    className="
                        mt-2
                        text-white/60
                    "
                >
                    วิเคราะห์ตัวอย่าง DNA
                    และเลือกผลที่ตรงกับข้อมูล
                </p>

                {/* ==================
                    DNA Visual
                ================== */}

                <div
                    className="
                        my-8
                        flex
                        h-36
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-400/20
                        bg-cyan-950/20
                    "
                >
                    <div
                        className="
                            font-mono
                            text-3xl
                            tracking-[0.3em]
                            text-cyan-300
                        "
                    >
                        ╲╱╲╱╲╱╲╱╲╱
                    </div>
                </div>

                {/* ==================
                    Choices
                ================== */}

                <div
                    className="
                        grid
                        grid-cols-3
                        gap-4
                    "
                >
                    {(
                        [
                            "A",
                            "O",
                            "B",
                        ] as DNAAnswer[]
                    ).map(
                        (
                            answer,
                        ) => {
                            const selected =
                                selectedAnswer ===
                                answer;

                            return (
                                <button
                                    key={
                                        answer
                                    }
                                    type="button"
                                    onClick={() => {
                                        setSelectedAnswer(
                                            answer,
                                        );

                                        setMessage(
                                            "",
                                        );
                                    }}
                                    className={`
                                        h-20
                                        rounded-xl
                                        border
                                        text-2xl
                                        font-bold
                                        transition
                                        ${
                                            selected
                                                ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                                        }
                                    `}
                                >
                                    {
                                        answer
                                    }
                                </button>
                            );
                        },
                    )}
                </div>

                {/* ==================
                    Message
                ================== */}

                <div
                    className="
                        mt-5
                        min-h-6
                        text-center
                        text-sm
                        text-cyan-300
                    "
                >
                    {message}
                </div>

                {/* ==================
                    Analyze
                ================== */}

                <button
                    type="button"
                    onClick={
                        handleAnalyze
                    }
                    className="
                        mt-4
                        w-full
                        rounded-xl
                        bg-cyan-400
                        px-6
                        py-4
                        font-bold
                        text-slate-950
                        transition
                        hover:bg-cyan-300
                    "
                >
                    วิเคราะห์ตัวอย่าง
                </button>
            </div>
        </div>
    );
}