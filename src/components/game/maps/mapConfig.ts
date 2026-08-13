import type {
    MapDefinition,
} from "./mapTypes";

export const GAME_MAPS: MapDefinition[] = [
    // ==============================
    // MAP 0
    // โถงคณะ / Tutorial
    // ==============================
    {
        id: "faculty-hall",
        label: "Faculty Hall",
        spawnPosition: [
            -10,
            3,
            0,
        ],
        background: {
            // ยังไม่ต้องใส่รูปตอนนี้
            url: "/backgrounds/hall_background.jpg",
            position: [
                35,
                8,
                -80,
            ],
            size: [
                120,
                30,
            ],
            fallbackColor:
                "#20242a",
        },
        exit: {
            /*
             * ตำแหน่งชั่วคราว
             * เดี๋ยวปรับให้ตรงประตูจริง
             */
            position: [
                82,
                2,
                0,
            ],
            halfExtents: [
                0.5,
                3,
                2,
            ],
        },
    },

    // ==============================
    // MAP 1
    // คาดฟ้า
    // ==============================

    {
        id: "rooftop",

        label: "Rooftop",

        spawnPosition: [
            -8,
            2,
            0,
        ],

        background: {
            // url: "/backgrounds/map01-rooftop.webp",

            position: [
                5,
                7,
                -5,
            ],

            size: [
                34,
                18,
            ],

            fallbackColor:
                "#1a2633",
        },

        exit: {
            position: [
                18,
                2,
                0,
            ],

            halfExtents: [
                0.5,
                3,
                2,
            ],
        },
    },

    // ==============================
    // MAP 2
    // ทางเชื่อม
    // ==============================

    {
        id: "skybridge",

        label: "Skybridge",

        spawnPosition: [
            -8,
            2,
            0,
        ],

        background: {
            // url: "/backgrounds/map02-skybridge.webp",

            position: [
                5,
                7,
                -5,
            ],

            size: [
                34,
                18,
            ],

            fallbackColor:
                "#263039",
        },

        exit: {
            position: [
                18,
                2,
                0,
            ],

            halfExtents: [
                0.5,
                3,
                2,
            ],
        },
    },

    // ==============================
    // MAP 3
    // ลานคณะวิทยาศาสตร์
    // ==============================

    {
        id: "science-yard",

        label: "Science Faculty Yard",

        spawnPosition: [
            -8,
            2,
            0,
        ],

        background: {
            // url: "/backgrounds/map03-yard.webp",

            position: [
                5,
                7,
                -5,
            ],

            size: [
                34,
                18,
            ],

            fallbackColor:
                "#263229",
        },

        exit: {
            position: [
                18,
                2,
                0,
            ],

            halfExtents: [
                0.5,
                3,
                2,
            ],
        },
    },

    // ==============================
    // MAP 4
    // อาคาร LAB
    // ==============================

    {
        id: "lab-building",

        label: "Laboratory Building",

        spawnPosition: [
            -8,
            2,
            0,
        ],

        background: {
            // url: "/backgrounds/map04-lab.webp",

            position: [
                5,
                7,
                -5,
            ],

            size: [
                34,
                18,
            ],

            fallbackColor:
                "#171b1d",
        },

        /*
         * MAP สุดท้าย
         * ยังเก็บ Exit ไว้
         * เผื่อภายหลังทำ End Trigger
         */
        exit: {
            position: [
                18,
                2,
                0,
            ],

            halfExtents: [
                0.5,
                3,
                2,
            ],
        },
    },
];