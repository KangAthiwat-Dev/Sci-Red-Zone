"use client";

import { useCallback, useMemo, useState } from "react";

import type { MapId } from "../maps/mapTypes";

import { OBJECTIVES } from "./objectiveConfig";
import type {
  CurrentObjective,
  ObjectiveDefinition,
  ObjectiveEventId,
} from "./objectiveTypes";

type ObjectiveMapProgress = {
  completedObjectiveIds: Record<string, true>;

  activeEventIds: Record<string, true>;
};

type ObjectiveTrackerState = Partial<
  Record<MapId, ObjectiveMapProgress>
>;

function createEmptyProgress(): ObjectiveMapProgress {
  return {
    completedObjectiveIds: {},
    activeEventIds: {},
  };
}

function getCurrentObjectiveIndex(
  objectives: ObjectiveDefinition[],
  progress: ObjectiveMapProgress,
) {
  return objectives.findIndex(
    (objective) =>
      !progress.completedObjectiveIds[
        objective.id
      ],
  );
}

function isObjectiveComplete(
  objective: ObjectiveDefinition,
  activeEventIds: Record<string, true>,
) {
  if (objective.completeWhen.length === 0) {
    return true;
  }

  if (objective.completionMode === "any") {
    return objective.completeWhen.some(
      (eventId) => activeEventIds[eventId],
    );
  }

  return objective.completeWhen.every(
    (eventId) => activeEventIds[eventId],
  );
}

function getCurrentObjective(
  mapId: MapId,
  state: ObjectiveTrackerState,
): CurrentObjective | null {
  const objectives = OBJECTIVES[mapId] ?? [];

  if (objectives.length === 0) {
    return null;
  }

  const progress =
    state[mapId] ?? createEmptyProgress();

  const currentIndex =
    getCurrentObjectiveIndex(
      objectives,
      progress,
    );

  if (currentIndex < 0) {
    return null;
  }

  return {
    objective: objectives[currentIndex],
    stepIndex: currentIndex,
    totalSteps: objectives.length,
    progressLabel: `${currentIndex + 1}/${objectives.length}`,
  };
}

export function useObjectiveTracker(
  mapId: MapId,
) {
  const [state, setState] =
    useState<ObjectiveTrackerState>({});

  const currentObjective =
    useMemo(
      () => getCurrentObjective(mapId, state),
      [mapId, state],
    );

  const completeObjectiveEvent =
    useCallback(
      (
        eventId: ObjectiveEventId,
        targetMapId: MapId = mapId,
      ) => {
        setState((currentState) => {
          const objectives =
            OBJECTIVES[targetMapId] ?? [];

          if (objectives.length === 0) {
            return currentState;
          }

          const currentProgress =
            currentState[targetMapId] ??
            createEmptyProgress();

          const currentIndex =
            getCurrentObjectiveIndex(
              objectives,
              currentProgress,
            );

          if (currentIndex < 0) {
            return currentState;
          }

          const objective =
            objectives[currentIndex];

          if (
            !objective.completeWhen.includes(
              eventId,
            )
          ) {
            return currentState;
          }

          if (
            currentProgress.activeEventIds[
              eventId
            ]
          ) {
            return currentState;
          }

          const nextActiveEventIds: Record<
            string,
            true
          > = {
            ...currentProgress.activeEventIds,
            [eventId]: true,
          };

          const completed =
            isObjectiveComplete(
              objective,
              nextActiveEventIds,
            );

          const nextProgress: ObjectiveMapProgress =
            completed
              ? {
                  completedObjectiveIds: {
                    ...currentProgress.completedObjectiveIds,
                    [objective.id]: true,
                  },
                  activeEventIds: {},
                }
              : {
                  ...currentProgress,
                  activeEventIds:
                    nextActiveEventIds,
                };

          return {
            ...currentState,
            [targetMapId]: nextProgress,
          };
        });
      },
      [mapId],
    );

  const resetMapObjectives =
    useCallback(
      (targetMapId: MapId = mapId) => {
        setState((currentState) => {
          if (!currentState[targetMapId]) {
            return currentState;
          }

          const nextState = {
            ...currentState,
          };

          delete nextState[targetMapId];

          return nextState;
        });
      },
      [mapId],
    );

  return {
    currentObjective,
    completeObjectiveEvent,
    resetMapObjectives,
  };
}
