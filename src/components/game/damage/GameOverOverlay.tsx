"use client";

type GameOverOverlayProps = {
  visible: boolean;

  onRestart: () => void;
};

export default function GameOverOverlay({
  visible,
  onRestart,
}: GameOverOverlayProps) {
  return (
    <div
      className={`
        fixed
        inset-0
        z-[20000]

        flex
        items-center
        justify-center

        bg-black/85

        transition-opacity
        duration-700

        ${
          visible
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }
      `}
      style={{
        background: `
          radial-gradient(
            circle at center,
            rgba(35, 0, 0, 0.65),
            rgba(0, 0, 0, 0.96) 70%
          )
        `,
      }}
    >
      <div
        className="
          flex
          flex-col
          items-center
          text-center
        "
      >
        <div
          className="
            text-[10px]
            font-semibold
            tracking-[0.45em]
            text-red-400/60
          "
        >
          SUBJECT TERMINATED
        </div>

        <h1
          className="
            mt-3
            text-5xl
            font-black
            tracking-[0.12em]
            text-red-500
            drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]
          "
        >
          GAME OVER
        </h1>

        <div
          className="
            mt-3
            h-px
            w-40
            bg-linear-to-r
            from-transparent
            via-red-500/60
            to-transparent
          "
        />

        <p
          className="
            mt-5
            text-xs
            tracking-[0.2em]
            text-white/35
          "
        >
          BIOLOGICAL SIGNAL LOST
        </p>

        <button
          type="button"
          onClick={
            onRestart
          }
          className="
            mt-9

            border
            border-red-400/40

            bg-red-500/10

            px-8
            py-3

            text-xs
            font-bold
            tracking-[0.25em]
            text-red-100

            transition

            hover:border-red-300
            hover:bg-red-500/20
          "
        >
          เล่นใหม่
        </button>
      </div>
    </div>
  );
}