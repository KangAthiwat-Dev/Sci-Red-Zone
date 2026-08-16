"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

// ========================================
// Types
// ========================================

type StartScreenProps = {
  onStart: () => void;

  eyebrow?: string;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  hint?: string;

  backgroundImage?: string;
};

// ========================================
// Component
// ========================================

export default function StartScreen({
  onStart,

  eyebrow = "SCIENCE FACILITY",

  title = "SCI RED ZONE",

  subtitle = "SOMETHING WENT WRONG",

  buttonLabel = "START GAME",

  hint = "PRESS ENTER OR CLICK TO BEGIN",

  /*
   * ไฟล์:
   * public/images/hero.PNG
   */
  backgroundImage = "/images/hero.PNG",
}: StartScreenProps) {
  const [
    leaving,
    setLeaving,
  ] = useState(false);

  // ========================================
  // Start
  // ========================================

  const handleStart =
    useCallback(() => {
      if (leaving) {
        return;
      }

      setLeaving(true);

      window.setTimeout(() => {
        onStart();
      }, 600);
    }, [
      leaving,
      onStart,
    ]);

  // ========================================
  // Keyboard
  // ========================================

  useEffect(() => {
    if (leaving) {
      return;
    }

    const handleKey = (
      event: KeyboardEvent,
    ) => {
      if (
        event.code === "Enter" ||
        event.code === "Space"
      ) {
        event.preventDefault();

        handleStart();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey,
      );
    };
  }, [
    leaving,
    handleStart,
  ]);

  // ========================================
  // Render
  // ========================================

  return (
    <div
      className={`
        fixed
        inset-0
        z-50

        overflow-hidden
        bg-black

        transition-opacity
        duration-[600ms]
        ease-out

        ${
          leaving
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        }
      `}
    >
      {/* =================================
          Animations
      ================================= */}

      <style>
        {`
          @keyframes srz-image-enter {
            from {
              opacity: 0;
              transform: scale(1.035);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes srz-menu-enter {
            from {
              opacity: 0;
              transform: translateX(20px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes srz-title-enter {
            0% {
              opacity: 0;
              letter-spacing: 0.12em;
            }

            100% {
              opacity: 1;
              letter-spacing: 0.03em;
            }
          }

          @keyframes srz-hint {
            0%, 100% {
              opacity: 0.22;
            }

            50% {
              opacity: 0.7;
            }
          }

          @keyframes srz-button-line {
            0% {
              transform: scaleX(0);
              opacity: 0;
            }

            100% {
              transform: scaleX(1);
              opacity: 1;
            }
          }
        `}
      </style>

      {/* =================================
          LEFT HERO IMAGE
      ================================= */}

      <div
        className="
          absolute
          inset-y-0
          left-0

          h-full
          w-full

          md:w-[62%]
          lg:w-[60%]
        "
        style={{
          animation:
            "srz-image-enter 1.4s ease-out both",
        }}
      >
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 62vw"
          className="
            object-cover

            object-[50%_28%]

            md:object-[48%_30%]
            lg:object-[48%_30%]
          "
        />

        {/* vignette บน / ล่าง */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0

            bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_22%,transparent_70%,rgba(0,0,0,0.75)_100%)]
          "
        />

        {/* fade ภาพเข้า black ฝั่งขวา */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0

            hidden
            md:block

            bg-[linear-gradient(90deg,transparent_0%,transparent_55%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.88)_88%,black_100%)]
          "
        />
      </div>

      {/* =================================
          MOBILE DARK OVERLAY
      ================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0

          bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.22)_42%,rgba(0,0,0,0.96)_78%,black_100%)]

          md:hidden
        "
      />

      {/* =================================
          DESKTOP BLACK RIGHT AREA
      ================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0

          hidden
          w-[46%]

          bg-black

          md:block
        "
      />

      {/* fade เชื่อมอีกชั้น */}
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-[43%]

          hidden
          w-[22%]

          bg-gradient-to-r
          from-transparent
          via-black/65
          to-black

          md:block
        "
      />

      {/* =================================
          MAIN MENU
      ================================= */}

      <main
        className="
          relative
          z-10

          flex
          h-full
          w-full

          items-end
          justify-center

          px-6
          pb-[9vh]

          md:items-center
          md:justify-end
          md:px-[5vw]
          md:pb-0

          lg:px-[7vw]
        "
      >
        <section
          className="
            flex
            w-full

            max-w-[620px]

            flex-col
            items-center

            text-center

            md:w-[46vw]
            md:max-w-[650px]
          "
          style={{
            animation:
              "srz-menu-enter 1s ease-out 0.2s both",
          }}
        >
          {/* Eyebrow */}

          <p
            className="
              mb-4

              font-mono

              text-[10px]
              font-semibold

              uppercase
              tracking-[0.58em]

              text-emerald-500

              sm:text-xs
              lg:text-sm
            "
          >
            {eyebrow}
          </p>

          {/* Title */}

          <h1
            className="
              whitespace-nowrap

              text-[clamp(2.7rem,5.1vw,5.6rem)]
              font-black

              uppercase

              leading-none

              text-white

              drop-shadow-[0_5px_24px_rgba(0,0,0,0.8)]
            "
            style={{
              animation:
                "srz-title-enter 1s ease-out 0.35s both",
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}

          <p
            className="
              mt-5

              font-mono

              text-[9px]
              font-medium

              uppercase
              tracking-[0.45em]

              text-zinc-500

              sm:text-[11px]
              lg:text-sm
            "
          >
            {subtitle}
          </p>

          {/* Small Divider */}

          <div
            className="
              my-8
              flex
              items-center
              gap-2

              md:my-10
            "
          >
            <span
              className="
                h-px
                w-7
                bg-zinc-800
              "
            />

            <span
              className="
                h-1
                w-1
                rotate-45
                bg-emerald-600/80
              "
            />

            <span
              className="
                h-px
                w-7
                bg-zinc-800
              "
            />
          </div>

          {/* =================================
              START BUTTON
          ================================= */}

          <button
            type="button"
            disabled={leaving}
            onClick={handleStart}
            className="
              group
              relative

              flex

              h-[78px]
              w-full
              max-w-[400px]

              items-center
              justify-center

              overflow-hidden

              border
              border-zinc-700

              bg-zinc-950/60

              transition-all
              duration-300

              hover:border-zinc-400
              hover:bg-zinc-900/80

              focus:outline-none
              focus-visible:border-white

              disabled:pointer-events-none

              sm:h-[84px]
            "
          >
            {/* hover background */}

            <span
              className="
                pointer-events-none

                absolute
                inset-0

                origin-left
                scale-x-0

                bg-white/[0.045]

                transition-transform
                duration-500

                group-hover:scale-x-100
              "
            />

            {/* green left indicator */}

            <span
              className="
                pointer-events-none

                absolute
                left-0
                top-1/2

                h-0
                w-[2px]

                -translate-y-1/2

                bg-emerald-500

                transition-all
                duration-300

                group-hover:h-[38px]
              "
            />

            {/* right indicator */}

            <span
              className="
                pointer-events-none

                absolute
                right-0
                top-1/2

                h-0
                w-[2px]

                -translate-y-1/2

                bg-emerald-500

                transition-all
                duration-300

                group-hover:h-[38px]
              "
            />

            <span
              className="
                relative

                font-mono

                text-sm
                font-bold

                uppercase

                tracking-[0.32em]

                text-zinc-100

                transition-all
                duration-300

                group-hover:tracking-[0.38em]
                group-hover:text-white

                sm:text-base
              "
            >
              {buttonLabel}
            </span>
          </button>

          {/* =================================
              Hint
          ================================= */}

          <p
            className="
              mt-10

              font-mono

              text-[9px]

              uppercase
              tracking-[0.4em]

              text-zinc-600

              sm:text-[11px]
            "
            style={{
              animation:
                "srz-hint 2.5s ease-in-out infinite",
            }}
          >
            {hint}
          </p>
        </section>
      </main>

      {/* =================================
          Edge details
      ================================= */}

      <div
        className="
          pointer-events-none

          absolute
          bottom-5
          left-6

          hidden

          font-mono
          text-[8px]

          tracking-[0.32em]

          text-zinc-700

          md:block
        "
      >
        FACILITY ACCESS // RESTRICTED
      </div>

      <div
        className="
          pointer-events-none

          absolute
          bottom-5
          right-6

          hidden

          font-mono
          text-[8px]

          tracking-[0.32em]

          text-zinc-800

          md:block
        "
      >
        SCI RED ZONE
      </div>
    </div>
  );
}