export type StairwayProgress = {
    doorInspected: boolean;

    powerRestored: boolean;

    keycardRequested: boolean;

    keycardCollected: boolean;
};

export const DEFAULT_STAIRWAY_PROGRESS:
    StairwayProgress = {
    doorInspected: false,

    powerRestored: false,

    keycardRequested: false,

    keycardCollected: false,
};