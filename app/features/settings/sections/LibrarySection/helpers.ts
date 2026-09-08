import { formatDuration } from "@utils/formatters";

import type { GroupSelection, MoveClass, OrganisePreview, OrganiseStatus, RunOutcome } from "./types";

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
