"use client";

import FacultyHallCollision from "./faculty-hall/FacultyHallCollision";
import GameBackground from "./GameBackground";
import MapExitTrigger from "./MapExitTrigger";
import type {
    MapDefinition,
} from "./mapTypes";

type GameMapProps = {
    map: MapDefinition;

    isLastMap: boolean;

    onExit: () => void;
};

// ==============================
// Game Map
// ==============================
export default function GameMap({
    map,
    isLastMap,
    onExit,
}: GameMapProps) {
    return (
        <>
            <GameBackground
                background={
                    map.background
                }
            />

            {/* ======================
                Collision / Map
            ====================== */}
            {map.id === "faculty-hall" && (
                <FacultyHallCollision />
            )}

            {/* ======================
                Exit
            ====================== */}

            {!isLastMap && (
                <MapExitTrigger
                    position={
                        map.exit.position
                    }
                    halfExtents={
                        map.exit
                            .halfExtents
                    }
                    onEnter={
                        onExit
                    }
                />
            )}
        </>
    );
}