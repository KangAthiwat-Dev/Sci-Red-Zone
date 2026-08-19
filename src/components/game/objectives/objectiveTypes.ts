import type { MapId } from "../maps/mapTypes";

export type ObjectiveEventId = string;

export type ObjectiveCompletionMode =
  | "all"
  | "any";

export type ObjectiveDefinition = {
  id: string;

  title: string;

  hint: string;

  completeWhen: ObjectiveEventId[];

  completionMode?: ObjectiveCompletionMode;
};

export type ObjectiveConfig = Record<
  MapId,
  ObjectiveDefinition[]
>;

export type CurrentObjective = {
  objective: ObjectiveDefinition;

  stepIndex: number;

  totalSteps: number;

  progressLabel: string;
};
