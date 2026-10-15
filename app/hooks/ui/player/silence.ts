import type { TrackSilence } from "./types";

const known = new Map<string, TrackSilence>();
const asked = new Set<string>();

export function silenceOf(trackId: string): TrackSilence | null {
  return known.get(trackId) ?? null;
}

export function claimUnaskedSilence(trackIds: readonly string[]): string[] {
  const unasked = trackIds.filter((trackId) => !asked.has(trackId));
  for (const trackId of unasked) asked.add(trackId);
  return unasked;
}

export function rememberSilence(entries: readonly TrackSilence[]): void {
  for (const entry of entries) known.set(entry.trackId, entry);
}
