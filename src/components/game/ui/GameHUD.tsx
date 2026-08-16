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
    md:top-4
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
          <ControlChip keys="A / D" action="เดิน" />

          <ControlChip keys="Shift + A / D" action="วิ่ง" />

          <ControlChip keys="Space" action="กระโดด" />

          <ControlChip keys="C / Ctrl" action="ย่อ" />

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
  label: string;
  shortLabel: string;
  acquired?: boolean;
};

function InventorySlot({
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
        <span
          className={`
            font-mono
            text-[9px]
            font-semibold
            tracking-[0.12em]

            ${acquired ? "text-emerald-200" : "text-white/20"}
          `}
        >
          {shortLabel}
        </span>
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
