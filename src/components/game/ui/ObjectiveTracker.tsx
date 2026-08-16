"use client";

type ObjectiveTrackerProps = {
    title: string;

    description?: string;
};

export default function ObjectiveTracker({
    title,
    description,
}: ObjectiveTrackerProps) {
    return (
        <div
            className="
        pointer-events-none
        fixed
        right-6
        top-6
        z-5000
        w-[320px]
        select-none
    "
        >
            <div
                className="
                    border-l-2
                    border-white/50
                    bg-black/45
                    px-4
                    py-3
                    text-white
                    shadow-lg
                    backdrop-blur-sm
                "
            >
                <div
                    className="
                        mt-1
                        text-sm
                        font-semibold
                    "
                >
                    {title}
                </div>

                {description && (
                    <div
                        className="
                            mt-1
                            text-xs
                            text-white/50
                        "
                    >
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}