export type MapId =
    | "faculty-hall"
    | "rooftop"
    | "skybridge"
    | "science-yard"
    | "lab-building";

export type Vector3Tuple = [
    number,
    number,
    number,
];

export type MapDefinition = {
    id: MapId;

    label: string;

    spawnPosition: Vector3Tuple;

    background: {
        url?: string;

        position: Vector3Tuple;

        size: [
            number,
            number,
        ];

        fallbackColor: string;
    };

    exit: {
        position: Vector3Tuple;

        halfExtents: Vector3Tuple;
    };
};