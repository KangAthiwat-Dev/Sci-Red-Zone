"use client";

// ========================================
// Types
// ========================================

type HudItem = {
  id: string;
  label: string;
  shortLabel: string;
  acquired?: boolean;
};

type GameHUDProps = {
  health?: number;
  maxHealth?: number;

  objectiveTitle?: string;
  objectiveHint?: string;

  items?: HudItem[];
};

// ========================================
// Game HUD
// ========================================

export default function GameHUD({
  health = 100,
  maxHealth = 100,

  objectiveTitle = "ESCAPE THE FACILITY",
  objectiveHint = "สำรวจพื้นที่และหาทางออก",

  items = [
    {
      id: "keycard",
      label: "Keycard",
      shortLabel: "KC",
      acquired: false,
    },
    {
      id: "antidote",
      label: "Antidote",
      shortLabel: "MED",
      acquired: false,
    },
    {
      id: "sample",
      label: "Sample",
      shortLabel: "DNA",
      acquired: false,
    },
  ],
}: GameHUDProps) {
  const safeMaxHealth = maxHealth > 0 ? maxHealth : 1;

  const healthPercent = Math.max(
    0,
    Math.min((health / safeMaxHealth) * 100, 100),
  );

  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-3000
        select-none
      "
    >
      {/* =====================================
          HP
          TOP CENTER
      ===================================== */}

      <div
        className="
          absolute
    left-3
    top-3

    w-[clamp(150px,20vw,210px)]

    md:left-4
    md:top-15
        "
      >
        <div
          className="
            mb-1.5
            flex
            items-center
            justify-between
          "
        >
          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-red-300
            "
          >
            HP
          </span>

          <span
            className="
              text-[9px]
              font-semibold
              text-white/75
            "
          >
            {health} / {maxHealth}
          </span>
        </div>

        <div
          className="
            h-1.75
            overflow-hidden
            rounded-full
            bg-white/15
          "
        >
          <div
            className="
              h-full
              rounded-full

              bg-linear-to-r
              from-red-500
              via-red-400
              to-orange-300

              transition-[width]
              duration-300
            "
            style={{
              width: `${healthPercent}%`,
            }}
          />
        </div>
      </div>

      {/* =====================================
          OBJECTIVE
          TOP RIGHT
      ===================================== */}

      <div
        className="
          absolute
          right-3
          top-3

          max-w-[min(280px,30vw)]

          text-right

          md:right-4
          md:top-4
        "
      >
        <p
          className="
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.3em]
            text-emerald-300/80

            md:text-[9px]
          "
        >
          Objective
        </p>

        <h2
          className="
            mt-1

            text-[10px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-white/90

            md:text-xs
          "
        >
          {objectiveTitle}
        </h2>

        {objectiveHint && (
          <p
            className="
              mt-0.5

              text-[9px]
              leading-relaxed
              text-white/40

              md:text-[10px]
            "
          >
            {objectiveHint}
          </p>
        )}
      </div>

      {/* =====================================
          ITEMS
          RIGHT CENTER
      ===================================== */}

      <div
        className="
          absolute
          right-3
          top-1/2

          -translate-y-1/2

          md:right-4
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
          "
        >
          {items.map((item) => (
            <InventorySlot
              key={item.id}
              id={item.id}
              label={item.label}
              shortLabel={item.shortLabel}
              acquired={item.acquired}
            />
          ))}
        </div>
      </div>

      {/* =====================================
          CONTROLS
          BOTTOM LEFT - HORIZONTAL
      ===================================== */}

      <div
        className="
          absolute
          bottom-3
          left-3

          max-w-[calc(100vw-24px)]

          md:bottom-4
          md:left-4
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-3
            gap-y-1.5
          "
        >
          <ControlChip keys="A/D" action="เดิน" />

          <ControlChip keys="Shift + A/D" action="วิ่ง" />

          <ControlChip keys="Space" action="กระโดด" />

          <ControlChip keys="C/Ctrl" action="ย่อ" />

          <ControlChip keys="Shift + A/D + C/Ctrl" action="สไลด์" />

          <ControlChip keys="E" action="โต้ตอบ" />
        </div>
      </div>
    </div>
  );
}

// ========================================
// Control Chip
// ========================================

type ControlChipProps = {
  keys: string;
  action: string;
};

function ControlChip({ keys, action }: ControlChipProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5

        text-[9px]
        text-white/45

        md:text-[10px]
      "
    >
      <span
        className="
          rounded-sm
          border
          border-white/15

          bg-black/30

          px-1.5
          py-0.5

          font-mono
          text-[8px]
          tracking-[0.08em]
          text-white/75

          backdrop-blur-sm

          md:text-[9px]
        "
      >
        {keys}
      </span>

      <span>{action}</span>
    </div>
  );
}

// ========================================
// Inventory Slot
// ========================================

type InventorySlotProps = {
  id: string;
  label: string;
  shortLabel: string;
  acquired?: boolean;
};

function InventorySlot({
  id,
  label,
  shortLabel,
  acquired = false,
}: InventorySlotProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        gap-1
      "
    >
      <div
        className={`
          flex
          h-[46px]
          w-[46px]
          items-center
          justify-center

          rounded-sm
          border

          transition-all
          duration-300

          md:h-[50px]
          md:w-[50px]

          ${
            acquired
              ? `
                border-emerald-300/50
                bg-emerald-400/10
                shadow-[0_0_12px_rgba(52,211,153,0.12)]
              `
              : `
                border-white/15
                bg-black/10
              `
          }
        `}
      >
        {acquired ? (
          <ItemIcon id={id} />
        ) : (
          <span
            className="
      font-mono
      text-sm
      text-white/15
    "
          >
            —
          </span>
        )}
      </div>

      <span
        className={`
          max-w-14.5
          truncate

          text-center
          text-[8px]

          md:text-[9px]

          ${acquired ? "text-white/70" : "text-white/30"}
        `}
      >
        {label}
      </span>
    </div>
  );
}

// ========================================
// Item Icon
// ========================================

type ItemIconProps = {
  id: string;
};

function ItemIcon({ id }: ItemIconProps) {
  // ======================================
  // Keycard
  // ======================================

  if (id === "keycard") {
    return (
      <svg
        viewBox="0 0 48 48"
        className="
          h-8
          w-8
          text-emerald-200
        "
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Card */}

        <rect x="6" y="11" width="36" height="26" rx="4" />

        {/* Stripe */}

        <path
          d="
            M 7 18
            H 41
          "
          opacity="0.5"
        />

        {/* Chip */}

        <rect x="11" y="23" width="9" height="7" rx="1" />

        <path
          d="
            M 23 25
            H 36
          "
          opacity="0.7"
        />

        <path
          d="
            M 23 29
            H 32
          "
          opacity="0.4"
        />
      </svg>
    );
  }

  // ======================================
  // Sample
  // ======================================

  if (id === "sample" || id === "dna-data") {
    return (
      <svg
        viewBox="0 0 48 48"
        className="
          h-8
          w-8
          text-cyan-200
        "
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tube lid */}

        <path
          d="
            M 17 7
            H 31
          "
        />

        <path
          d="
            M 19 7
            V 13
          "
        />

        <path
          d="
            M 29 7
            V 13
          "
        />

        {/* Tube */}

        <path
          d="
            M 19 13
            V 32
            C 19 38
              29 38
              29 32
            V 13
          "
        />

        {/* Liquid */}

        <path
          d="
            M 20 27
            C 23 25
              26 29
              28 27
            V 32
            C 28 36
              20 36
              20 32
            Z
          "
          fill="currentColor"
          stroke="none"
          opacity="0.35"
        />

        {/* DNA detail */}

        <path
          d="
            M 22 18
            C 28 20
              28 24
              22 26
          "
          opacity="0.8"
        />

        <path
          d="
            M 26 18
            C 20 20
              20 24
              26 26
          "
          opacity="0.8"
        />
      </svg>
    );
  }

  // ======================================
  // Cell Data
  // ======================================

  if (id === "cell-data") {
    return (
      <svg
        viewBox="0 0 48 48"
        className="
        h-8
        w-8
        text-cyan-200
      "
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cell membrane */}
        <circle cx="24" cy="24" r="15" />

        {/* Nucleus */}
        <circle cx="25" cy="23" r="6" />

        {/* Cell details */}
        <path
          d="
          M 13 19
          C 16 17
            18 18
            19 20
        "
          opacity="0.6"
        />

        <path
          d="
          M 30 31
          C 33 29
            35 29
            37 31
        "
          opacity="0.6"
        />

        <circle
          cx="17"
          cy="29"
          r="2"
          fill="currentColor"
          stroke="none"
          opacity="0.5"
        />

        <circle
          cx="33"
          cy="17"
          r="2"
          fill="currentColor"
          stroke="none"
          opacity="0.5"
        />
      </svg>
    );
  }

  // ======================================
  // Chemical Formula
  // ======================================

  if (id === "formula" || id === "chemical-data") {
    return (
      <svg
        viewBox="0 0 48 48"
        className="
        h-8
        w-8
        text-amber-200
      "
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Flask neck */}
        <path
          d="
          M 19 7
          H 29
        "
        />

        <path
          d="
          M 21 7
          V 19
        "
        />

        <path
          d="
          M 27 7
          V 19
        "
        />

        {/* Flask body */}
        <path
          d="
          M 21 19
          L 12 36
          C 11 39
            13 41
            16 41
          H 32
          C 35 41
            37 39
            36 36
          L 27 19
        "
        />

        {/* Chemical liquid */}
        <path
          d="
          M 16 31
          C 20 29
            23 33
            27 31
          C 30 30
            32 31
            34 33
          L 36 37
          C 36 39
            34 40
            32 40
          H 16
          C 14 40
            12 39
            13 37
          Z
        "
          fill="currentColor"
          stroke="none"
          opacity="0.3"
        />

        {/* Bubble */}
        <circle cx="20" cy="27" r="1.5" />

        <circle cx="28" cy="25" r="1.2" />
      </svg>
    );
  }

  // ======================================
  // Antidote
  // ======================================

  if (id === "antidote") {
    return (
      <svg
        viewBox="0 0 48 48"
        className="
          h-8
          w-8
          text-emerald-200
        "
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Bottle cap */}

        <rect x="18" y="6" width="12" height="6" rx="1" />

        {/* Bottle */}

        <path
          d="
            M 17 12
            V 17
            C 14 19
              12 22
              12 27
            V 37
            C 12 40
              14 42
              17 42
            H 31
            C 34 42
              36 40
              36 37
            V 27
            C 36 22
              34 19
              31 17
            V 12
          "
        />

        {/* Liquid */}

        <path
          d="
            M 14 31
            H 34
            V 37
            C 34 39
              32 40
              30 40
            H 18
            C 16 40
              14 39
              14 37
            Z
          "
          fill="currentColor"
          stroke="none"
          opacity="0.25"
        />

        {/* Medical + */}

        <path
          d="
            M 24 21
            V 29
          "
        />

        <path
          d="
            M 20 25
            H 28
          "
        />
      </svg>
    );
  }

  // ======================================
  // Unknown Item
  // ======================================

  return (
    <span
      className="
        font-mono
        text-xs
        text-emerald-200
      "
    >
      ?
    </span>
  );
}
