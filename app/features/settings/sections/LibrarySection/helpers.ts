import { formatDuration } from "@utils/formatters";

import { EXTENSION_SUFFIX, EXTENSION_TOKEN, MIN_SAMPLE_FOR_ESTIMATE, MOVE_CLASSES, SAMPLE_LABELS } from "./constants";

import type { MoveClass, MoveFilter, OrganiseStatus, RunOutcome } from "./types";

export function sampleLabelKey(id: string): (typeof SAMPLE_LABELS)[keyof typeof SAMPLE_LABELS] | null {
  for (const [key, value] of Object.entries(SAMPLE_LABELS)) {
    if (key === id) return value;
  }
  return null;
}

export function classesFor(filter: MoveFilter): MoveClass[] {
  return filter === "all" ? [...MOVE_CLASSES] : [filter];
}

export function countFrom(
  byClass: readonly { moveClass: MoveClass; count: number }[] | undefined,
  moveClass: MoveClass
): number {
  return byClass?.find((entry) => entry.moveClass === moveClass)?.count ?? 0;
}

export function percentDone(processed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((processed / total) * 100));
}

export function withoutExtension(template: string): string {
  return template.endsWith(EXTENSION_SUFFIX) ? template.slice(0, -EXTENSION_SUFFIX.length) : template;
}

function withoutTrailingFiller(value: string): string {
  let end = value.length;
  while (end > 0 && (value[end - 1] === "." || value[end - 1] === " ")) end -= 1;
  return value.slice(0, end);
}

export function withExtension(edited: string): string {
  return `${withoutTrailingFiller(withoutExtension(edited.trimEnd()))}${EXTENSION_SUFFIX}`;
}

export function refuseExtensionTyping(typed: string): string {
  return typed.split(EXTENSION_TOKEN).join("");
}

export function insertAtCursor(value: string, token: string, start: number, end: number): string {
  return value.slice(0, start) + token + value.slice(end);
}

export function secondsRemaining(status: OrganiseStatus | undefined, now: number): number | null {
  if (status === undefined || !status.running || status.startedAt === null) return null;
  if (status.processed < MIN_SAMPLE_FOR_ESTIMATE || status.processed >= status.total) return null;
  const elapsed = (now - new Date(status.startedAt).getTime()) / 1000;
  if (elapsed <= 0) return null;
  return Math.round((elapsed / status.processed) * (status.total - status.processed));
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
