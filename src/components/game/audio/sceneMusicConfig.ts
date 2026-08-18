export type GameMapId =
    | "faculty-hall"
    | "stairway"
    | "laboratory"
    | "escape";

export type SceneMusicId =
    | GameMapId
    | "escape-chase";

export type SceneMusicConfig = {
    src: string;

    volume: number;

    fadeInMs: number;

    fadeOutMs: number;
};

export const SCENE_MUSIC: Record<
    SceneMusicId,
    SceneMusicConfig
> = {
    "faculty-hall": {
        src: "/sounds/music/faculty-hall.mp3",

        volume: 0.45,

        fadeInMs: 1800,

        fadeOutMs: 1200,
    },

    stairway: {
        src: "/sounds/music/stairway-web.mp3",

        volume: 0.4,

        fadeInMs: 1400,

        fadeOutMs: 900,
    },

    laboratory: {
        src: "/sounds/music/laboratory-web.mp3",

        volume: 0.45,

        fadeInMs: 1200,

        fadeOutMs: 900,
    },

    escape: {
        src: "/sounds/music/escape-web.mp3",

        volume: 0.55,

        fadeInMs: 700,

        fadeOutMs: 500,
    },

    "escape-chase": {
        src: "/sounds/music/chase-web.mp3",

        volume: 0.62,

        fadeInMs: 450,

        fadeOutMs: 0,
    },
};
