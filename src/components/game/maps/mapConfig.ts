import type { MapDefinition } from "./mapTypes";

export const GAME_MAPS: MapDefinition[] = [
  // ==============================
  // MAP 0 โถงคณะ / Tutorial
  // ==============================
  {
    id: "faculty-hall",
    label: "Faculty Hall",
    spawnPosition: [-13.5, 1, 0],
    enterTransition: {
      steps: [
        {
          velocityX: 3,
          velocityZ: 0,
          duration: 1.2,
          rotationY: Math.PI / 2,
        },
      ],
    },
    exit: {
      position: [82, 2, 0],
      halfExtents: [0.5, 3, 2],
    },
  },

  // ==============================
  // MAP 2 ทางเดินไฟดับ
  // ==============================

  {
    id: "stairway",
    label: "Stairway",
    spawnPosition: [-9, 2, 0],
    enterTransition: {
      steps: [
        {
          velocityX: 3,
          velocityZ: 0,
          duration: 1.2,
          rotationY: Math.PI / 2,
        },
      ],
    },
    exit: {
      position: [114, 2, 0],
      halfExtents: [0.6, 3, 2],
    },
  },

  // ==============================
  // MAP 2 laboratory
  // ==============================
  {
    id: "laboratory",
    label: "Laboratory",
    spawnPosition: [-9, 2, 0],
    enterTransition: {
      steps: [
        {
          velocityX: 3,
          velocityZ: 0,
          duration: 1.2,
          rotationY: Math.PI / 2,
        },
      ],
    },
    exit: {
      position: [143, 2, 0],
      halfExtents: [1.5, 2, 1.5],
    },
  },

  // ==============================
  // MAP 3 Escape
  // ==============================
  {
    id: "escape",
    label: "Escape",
    spawnPosition: [-9, 2, 0],
    enterTransition: {
      steps: [
        {
          velocityX: 3,
          velocityZ: 0,
          duration: 1.2,
          rotationY: Math.PI / 2,
        },
      ],
    },
    exit: {
      position: [120, 2, 0],

      halfExtents: [0.5, 3, 2],
    },
  },
];
