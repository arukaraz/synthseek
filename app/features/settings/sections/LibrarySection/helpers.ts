import { formatDuration } from "@utils/formatters";

import { SAMPLE_LABELS } from "./constants";

import type { GroupSelection, MoveClass, MoveFilter, OrganisePreview, OrganiseStatus, RunOutcome } from "./types";

export function sampleLabelKey(id: string): (typeof SAMPLE_LABELS)[keyof typeof SAMPLE_LABELS] | null {
  for (const [key, value] of Object.entries(SAMPLE_LABELS)) {
    if (key === id) return value;
  }
  return null;
}

export function classesFor(filter: MoveFilter): MoveClass[] {
  return filter === "all" ? ["relocate", "rename"] : [filter];
}

export function countFrom(
  byClass: readonly { moveClass: MoveClass; count: number }[] | undefined,
  moveClass: MoveClass
): number {
  return byClass?.find((entry) => entry.moveClass === moveClass)?.count ?? 0;
}

export function countFor(preview: OrganisePreview | undefined, moveClass: MoveClass): number {
  return preview?.movesByClass.find((entry) => entry.moveClass === moveClass)?.count ?? 0;
}

export function chosenClasses(selection: GroupSelection): MoveClass[] {
  const chosen: MoveClass[] = [];
  if (selection.relocate) chosen.push("relocate");
  if (selection.rename) chosen.push("rename");
  return chosen;
}

export function chosenTotal(preview: OrganisePreview | undefined, selection: GroupSelection): number {
  return chosenClasses(selection).reduce((total, moveClass) => total + countFor(preview, moveClass), 0);
}

export function percentDone(processed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((processed / total) * 100));
}

export function runOutcome(status: OrganiseStatus | undefined): RunOutcome | null {
  if (status === undefined || status.running) return null;
  if (status.startedAt === null || status.finishedAt === null) return null;

  return {
    moved: status.moved,
    companionsMoved: status.companionsMoved,
    failed: status.failed,
    companionsFailed: status.companionsFailed,
    abandoned: Math.max(0, status.total - status.processed),
    failures: status.failures,
    listedFailures: status.failures.length,
    duration: formatDuration(new Date(status.startedAt), new Date(status.finishedAt)) ?? "",
  };
}
