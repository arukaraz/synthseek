import { COPY_COMPARISON } from "./constants";
import type { ComparedCopy, TimelineBounds } from "./types";

export function startOf(copy: ComparedCopy, aligned: boolean): number {
  return aligned ? (copy.offsetSeconds ?? 0) : 0;
}

export function copyTimeAt(position: number, copy: ComparedCopy, aligned: boolean): number {
  return position - startOf(copy, aligned);
}

export function lengthOf(copy: ComparedCopy, durations: ReadonlyMap<string, number>): number {
  return durations.get(copy.id) ?? copy.durationSeconds ?? 0;
}

export function timelineBounds(
  copies: readonly ComparedCopy[],
  aligned: boolean,
  durations: ReadonlyMap<string, number>
): TimelineBounds {
  if (copies.length === 0) return { start: 0, end: 0 };
  const starts = copies.map((copy) => startOf(copy, aligned));
  const ends = copies.map((copy) => startOf(copy, aligned) + lengthOf(copy, durations));
  return { start: Math.min(0, ...starts), end: Math.max(...ends) };
}

export function clampTo(position: number, bounds: TimelineBounds): number {
  return Math.min(Math.max(position, bounds.start), bounds.end);
}

export function copyVolume(
  copy: ComparedCopy,
  copies: readonly ComparedCopy[],
  sounding: ReadonlySet<string>,
  matched: boolean
): number {
  if (!sounding.has(copy.id)) return 0;
  const share = 1 / Math.sqrt(sounding.size);
  const measured = copies.flatMap((other) =>
    sounding.has(other.id) && other.loudnessLufs !== null ? [other.loudnessLufs] : []
  );
  if (!matched || copy.loudnessLufs === null || measured.length === 0) return share;
  const quietest = Math.min(...measured);
  const correction = 10 ** ((quietest - copy.loudnessLufs) / COPY_COMPARISON.AMPLITUDE_DECIBEL_FACTOR);
  return share * correction;
}

export function loopAround(position: number, bounds: TimelineBounds): TimelineBounds {
  const start = clampTo(position - COPY_COMPARISON.LOOP_LEAD_SECONDS, bounds);
  return { start, end: Math.min(bounds.end, start + COPY_COMPARISON.LOOP_SECONDS) };
}

export function fractionOf(position: number, bounds: TimelineBounds): number {
  const span = bounds.end - bounds.start;
  return span <= 0 ? 0 : (position - bounds.start) / span;
}
