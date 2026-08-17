export type SceneDecoration = {
  id: string;

  src: string;

  position: [number, number, number];

  size: [number, number];

  rotation?: [number, number, number];

  opacity?: number;

  flipX?: boolean;

  renderOrder?: number;
};

export type SceneDecorationMap = {
  "faculty-hall": SceneDecoration[];
  stairway: SceneDecoration[];
  laboratory: SceneDecoration[];
  escape: SceneDecoration[];
};

// ========================================
// Z LAYERS
// ========================================
//
// Player โดยประมาณ = z 0
//
// -20     background ไกล
// -3      decoration หลัง Player
// -1      object หลัง Player
//  0      gameplay
// +1      object หน้า Playerเล็กน้อย
// +3/+5   foreground
//

export const SCENE_DRESSING: SceneDecorationMap = {
  // ========================================
  // MAP 1
  // FACULTY HALL
  // ========================================

  "faculty-hall": [
    // Windows
    {
      id: "hall-window-01",
      src: "/decorations/windows/break_window_verti.png",
      position: [20, 5, -9.8],
      size: [4.4, 6.6],
    },
    {
      id: "hall-window-02",
      src: "/decorations/windows/break_window_verti.png",
      position: [16, 5, -9.8],
      size: [4.4, 6.6],
    },
    {
      id: "hall-window-03",
      src: "/decorations/windows/break_window_verti.png",
      position: [12, 5, -9.8],
      size: [4.4, 6.6],
    },
    {
      id: "hall-window-04",
      src: "/decorations/windows/break_window_verti.png",
      position: [8, 5, -9.8],
      size: [4.4, 6.6],
    },
    {
      id: "hall-window-05",
      src: "/decorations/windows/break_window_verti.png",
      position: [4, 5, -9.8],
      size: [4.4, 6.6],
    },

    // Pipe
    {
      id: "hall-pipe-01",
      src: "/decorations/pipes/pipe-thin.png",
      position: [2, 8.7, -9],
      size: [15, 2],
      rotation: [0, 0, 0],
    },
    {
      id: "hall-pipe-02",
      src: "/decorations/pipes/pipe-thin.png",
      position: [15.5, 8.7, -9],
      size: [15, 2],
      rotation: [0, 0, 0],
    },
    {
      id: "hall-pipe-03",
      src: "/decorations/pipes/pipe-thin.png",
      position: [2, 8.9, -8],
      size: [15, 2],
      rotation: [0, 0, 0],
    },
    {
      id: "hall-pipe-04",
      src: "/decorations/pipes/pipe-thin.png",
      position: [15.5, 8.9, -8],
      size: [15, 2],
      rotation: [0, 0, 0],
    },
  ],

  // ========================================
  // MAP 2
  // STAIRWAY
  // ========================================

  stairway: [
    // {
    //   id: "stairway-locker-01",
    //   src: "/decorations/stairway/locker.png",
    //   position: [12, 1.6, -1],
    //   size: [2, 3.2],
    // },
    // {
    //   id: "stairway-chair-01",
    //   src: "/decorations/stairway/broken-chair.png",
    //   position: [28, 0.65, -0.7],
    //   size: [1.7, 1.3],
    //   flipX: true,
    // },
  ],

  // ========================================
  // MAP 3
  // LABORATORY
  // ========================================

  laboratory: [
    {
      id: "lab-dna-01",
      src: "/decorations/machine/dna.png",
      position: [19, 4, -2],
      size: [7, 9],
      rotation: [0, 0, 0],
    },
    {
      id: "lab-cell-01",
      src: "/decorations/machine/cell.png",
      position: [58, 3.7, -2],
      size: [5.5, 10],
      rotation: [0, 0, 0],
    },
    {
      id: "lab-chemical-01",
      src: "/decorations/machine/chemical.png",
      position: [99, 3.9, -2],
      size: [5.6, 9],
      rotation: [0, 0, 0],
    },
    {
      id: "lab-anly-01",
      src: "/decorations/machine/analy.png",
      position: [119, 3.9, -3],
      size: [18, 9],
      rotation: [0, 0, 0],
    },
    {
      id: "lab-get-se-01",
      src: "/decorations/machine/get_se.png",
      position: [124.5, 1.9, -2],
      size: [6, 4],
      rotation: [0, 0, 0],
    },
    
  ],

  // ========================================
  // MAP 4
  // ESCAPE
  // ========================================

  escape: [
    {
      id: "escape-system-control-01",
      src: "/decorations/machine/system_contrl.png",
      position: [22, 3, -3],
      size: [5, 6],
      rotation: [0, 0, 0],
    },
  ],
};
