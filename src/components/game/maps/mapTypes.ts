export type MapId = "faculty-hall" | "stairway" | "laboratory" | "escape";

export type Vector3Tuple = [number, number, number];

export type MapTransitionStep = {
  velocityX: number;
  velocityZ: number;
  duration: number;
  rotationY: number;
};

export type MapDefinition = {
  id: MapId;

  label: string;

  spawnPosition: Vector3Tuple;

  enterTransition?: {
    steps: MapTransitionStep[];
  };

  exit: {
    position: Vector3Tuple;

    halfExtents: Vector3Tuple;
  };
};
