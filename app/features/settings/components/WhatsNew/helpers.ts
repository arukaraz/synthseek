import { OPEN_DIALOG_SELECTOR } from "./constants";
import type { SegmentState, WhatsNewEntry } from "./types";

export function cardTotal(entry: WhatsNewEntry): number {
  return (entry.highlights?.length ?? 0) + 1;
}

export function clampCard(index: number, total: number): number {
  return Math.max(0, Math.min(total - 1, index));
}

export function segmentState(index: number, current: number): SegmentState {
  if (index === current) return "current";
  return index < current ? "done" : "todo";
}

export function anotherDialogOpen(): boolean {
  return document.querySelector(OPEN_DIALOG_SELECTOR) !== null;
}
