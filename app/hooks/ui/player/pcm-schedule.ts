import type { BufferClip } from "./types";

export function clipBuffer(
  rawStartSeconds: number,
  rawDurationSeconds: number,
  trimStartSeconds: number,
  durationSeconds: number
): BufferClip | null {
  const start = rawStartSeconds - trimStartSeconds;
  const end = start + rawDurationSeconds;
  if (!(rawDurationSeconds > 0) || end <= 0 || start >= durationSeconds) return null;
  const from = Math.max(start, 0);
  const to = Math.min(end, durationSeconds);
  if (to <= from) return null;
  return { startSeconds: from, offsetSeconds: from - start, playSeconds: to - from };
}

export function roundToSample(seconds: number, sampleRate: number): number {
  return Math.round(seconds * sampleRate) / sampleRate;
}

export function leadFilled(scheduledUntilSeconds: number, positionSeconds: number, leadSeconds: number): boolean {
  return scheduledUntilSeconds - positionSeconds >= leadSeconds;
}

export function positionOf(baseTime: number, contextTime: number, durationSeconds: number): number {
  return Math.min(Math.max(0, contextTime - baseTime), durationSeconds);
}
