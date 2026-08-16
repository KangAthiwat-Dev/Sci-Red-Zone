"use client";

type GameLoadingScreenProps = {
  visible: boolean;
  mapLabel?: string;
};

export default function GameLoadingScreen({
  visible,
  mapLabel = "FACILITY",
}: GameLoadingScreenProps) {
  return (
    <div
      className={`
        pointer-events-none
        fixed
        inset-0
        z-[10000]

        flex
        items-center
        justify-center

        bg-black

        transition-opacity
        duration-300

        ${
          visible
            ? "opacity-100"
            : "opacity-0"
        }
      `}
    >
      <style>
        {`
          @keyframes srz-loading-line {
            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(250%);
            }
          }

          @keyframes srz-loading-pulse {
            0%, 100% {
              opacity: 0.35;
            }

            50% {
              opacity: 1;
            }
          }
        `}
      </style>

      <div className="flex w-[260px] flex-col items-center text-center">
        <p
          className="
            text-[10px]
            font-semibold
            tracking-[0.45em]
            text-emerald-400
          "
        >
          SCI RED ZONE
        </p>

        <h2
          className="
            mt-5
            text-sm
            font-semibold
            tracking-[0.25em]
            text-white/90
          "
        >
          LOADING SECTOR
        </h2>

        <p
          className="
            mt-2
            text-[9px]
            uppercase
            tracking-[0.3em]
            text-white/35
          "
        >
          {mapLabel}
        </p>

        <div
          className="
            relative
            mt-6
            h-[2px]
            w-full
            overflow-hidden
            bg-white/10
          "
        >
          <div
            className="
              absolute
              inset-y-0
              left-0
              w-1/3
              bg-emerald-400
            "
            style={{
              animation:
                "srz-loading-line 1.1s ease-in-out infinite",
            }}
          />
        </div>

        <p
          className="
            mt-4
            text-[8px]
            tracking-[0.35em]
            text-white/25
          "
          style={{
            animation:
              "srz-loading-pulse 1.8s ease-in-out infinite",
          }}
        >
          INITIALIZING ENVIRONMENT
        </p>
      </div>
    </div>
  );
}