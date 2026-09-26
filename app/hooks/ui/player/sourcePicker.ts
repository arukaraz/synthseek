import type { PlayerTrack } from "@components/Player";
import { useSyncExternalStore } from "react";

import { queueFromSource, sourceCountsOf } from "./helpers";
import type { SourceCount, SourcePick, SourcePickerRequest } from "./types";

let request: SourcePickerRequest | null = null;
let settle: ((pick: SourcePick | null) => void) | null = null;
let nextId = 0;
const listeners = new Set<() => void>();

function publish(next: SourcePickerRequest | null): void {
  request = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function pickPlaybackSource(counts: readonly SourceCount[], total: number): Promise<SourcePick | null> {
  settle?.(null);
  return new Promise((resolve) => {
    settle = resolve;
    nextId += 1;
    publish({ id: nextId, counts, total });
  });
}

export function settleSourcePick(pick: SourcePick | null): void {
  const resolve = settle;
  if (resolve === null) return;
  settle = null;
  publish(null);
  resolve(pick);
}

export function useSourcePickerRequest(): SourcePickerRequest | null {
  return useSyncExternalStore(
    subscribe,
    () => request,
    () => null
  );
}

export async function tracksFromChosenSource(tracks: readonly PlayerTrack[]): Promise<PlayerTrack[] | null> {
  const counts = sourceCountsOf(tracks);
  if (counts.length < 2) return [...tracks];
  const pick = await pickPlaybackSource(counts, tracks.length);
  return pick === null ? null : queueFromSource(tracks, pick);
}
