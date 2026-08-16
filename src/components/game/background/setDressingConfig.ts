export type SceneMapId = "faculty-hall" | "stairway" | "laboratory" | "escape";

export type DressingItem = {
  url: string;

  position: [number, number, number];

  size: [number, number];

  rotation?: [number, number, number];

  opacity?: number;

  flipX?: boolean;

  color?: string;

  renderOrder?: number;
};

type SceneDressingConfig = {
  background: DressingItem[];

  midground: DressingItem[];

  foreground: DressingItem[];
};

// ========================================
// Shared Assets
// ========================================

const FOREST = "/decorations/shared/forest-bg.png";

const BRANCH_WIDE = "/decorations/shared/branch-wide.png";

const BRANCH_LONG = "/decorations/shared/branch-long.png";

const PIPE_COMPLEX = "/decorations/shared/pipe-complex.png";

const PIPE_THIN = "/decorations/shared/pipe-thin.png";

const PIPE_THICK = "/decorations/shared/pipe-thick.png";

const POLE = "/decorations/shared/pole.png";

// ========================================
// Config
// ========================================

export const SET_DRESSING: Record<SceneMapId, SceneDressingConfig> = {
  // =====================================
  // Faculty Hall
  // =====================================

  "faculty-hall": {
    background: [
      {
        url: FOREST,

        position: [28, 11, -20],

        size: [80, 30],

        opacity: 0.22,

        color: "#536372",
      },

      {
        url: FOREST,

        position: [90, 11, -20],

        size: [80, 30],

        opacity: 0.18,

        flipX: true,

        color: "#536372",
      },
    ],

    midground: [
      {
        url: PIPE_THIN,
        position: [-15, 11.5, -1.8],
        size: [24, 4],
      },
      {
        url: PIPE_THIN,
        position: [-15, 11.25, -2.25],
        size: [24, 4],
      },

      {
        url: PIPE_COMPLEX,

        position: [12, 7.4, -9.5],

        size: [22, 6],

        flipX: true,
      },

      {
        url: PIPE_THICK,

        position: [72, 7.5, -2.8],

        size: [20, 4],
      },
    ],

    foreground: [
      {
        url: BRANCH_WIDE,

        position: [28, 10, 5],

        size: [28, 9],

        opacity: 0.36,

        renderOrder: 10,
      },
    ],
  },

  // =====================================
  // Stairway
  // =====================================

  stairway: {
    background: [
      {
        url: FOREST,

        position: [25, 11, -20],

        size: [75, 30],

        opacity: 0.16,

        color: "#46515b",
      },

      {
        url: FOREST,

        position: [88, 11, -20],

        size: [75, 30],

        opacity: 0.16,

        flipX: true,

        color: "#46515b",
      },

      {
        url: FOREST,

        position: [145, 11, -20],

        size: [75, 30],

        opacity: 0.15,

        color: "#46515b",
      },
    ],

    midground: [
      {
        url: PIPE_COMPLEX,

        position: [34, 6, -2.8],

        size: [25, 9],
      },

      {
        url: PIPE_THIN,

        position: [-14, 11, -9],

        size: [25, 4],

        flipX: true,
      },
      {
        url: PIPE_THIN,

        position: [-14, 10.25, -8.5],

        size: [30, 4],

        flipX: true,
      },
      {
        url: PIPE_THIN,

        position: [10, 11, -8.5],

        size: [25, 4],

        flipX: true,
      },
      {
        url: PIPE_THIN,

        position: [15, 10.25, -8.5],

        size: [30, 4],

        flipX: true,
      },

      {
        url: POLE,

        position: [103, 6.5, -1.8],

        size: [4, 13],

        opacity: 0.7,
      },
    ],

    foreground: [
      {
        url: BRANCH_LONG,

        position: [48, 12, 5.5],

        size: [30, 8],

        opacity: 0.3,

        flipX: true,

        renderOrder: 10,
      },

      {
        url: BRANCH_WIDE,

        position: [105, 11, 5],

        size: [26, 8],

        opacity: 0.27,

        renderOrder: 10,
      },
    ],
  },

  // =====================================
  // Laboratory
  // =====================================

  laboratory: {
    background: [
      {
        url: FOREST,

        position: [30, 11, -21],

        size: [80, 30],

        opacity: 0.12,

        color: "#415364",
      },

      {
        url: FOREST,

        position: [95, 11, -21],

        size: [80, 30],

        opacity: 0.12,

        flipX: true,

        color: "#415364",
      },

      {
        url: FOREST,

        position: [155, 11, -21],

        size: [80, 30],

        opacity: 0.1,

        color: "#415364",
      },
    ],

    midground: [
      {
        url: PIPE_THICK,

        position: [20, 7.4, -2.4],

        size: [22, 4.5],
      },

      {
        url: PIPE_COMPLEX,

        position: [62, 6.2, -2.6],

        size: [25, 9],

        flipX: true,
      },

      {
        url: PIPE_THIN,

        position: [100, 7.7, -2.5],

        size: [28, 4],
      },

      {
        url: PIPE_COMPLEX,

        position: [133, 6.5, -2.8],

        size: [22, 8],
      },
    ],

    foreground: [
      {
        url: BRANCH_LONG,

        position: [38, 12, 5.3],

        size: [28, 8],

        opacity: 0.22,

        renderOrder: 10,
      },

      {
        url: BRANCH_WIDE,

        position: [122, 11, 5.4],

        size: [30, 9],

        opacity: 0.25,

        flipX: true,

        renderOrder: 10,
      },
    ],
  },

  // =====================================
  // Escape
  // =====================================

  escape: {
    background: [
      {
        url: FOREST,

        position: [25, 10, -20],

        size: [80, 30],
      },

      {
        url: FOREST,

        position: [88, 10, -20],

        size: [80, 30],

        flipX: true,
      },

      {
        url: FOREST,

        position: [150, 10, -20],

        size: [80, 30],
      },
    ],

    midground: [
      {
        url: POLE,

        position: [23, 6, -1.5],

        size: [4, 12],
      },

      {
        url: PIPE_COMPLEX,

        position: [67, 5, -2.5],

        size: [26, 9],
      },

      {
        url: PIPE_THICK,

        position: [105, 5.8, -2],

        size: [30, 5],

        flipX: true,
      },
    ],

    foreground: [
      {
        url: BRANCH_WIDE,

        position: [20, 11, 5.5],

        size: [30, 9],

        opacity: 0.72,

        renderOrder: 10,
      },

      {
        url: BRANCH_LONG,

        position: [70, 12, 5.7],

        size: [34, 9],

        flipX: true,

        opacity: 0.75,

        renderOrder: 10,
      },

      {
        url: BRANCH_WIDE,

        position: [125, 11, 5.4],

        size: [30, 9],

        flipX: true,

        opacity: 0.7,

        renderOrder: 10,
      },
    ],
  },
};
