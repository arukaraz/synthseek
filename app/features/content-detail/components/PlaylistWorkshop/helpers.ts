import type { RemovedPlaylistTrack } from "@hooks/api/mutations/playlists/types";

import { isRemovableTrack } from "../../helpers";
import type { WorkshopTrack } from "./types";

const MS_PER_MINUTE = 60_000;

export function arrangeTracks(tracks: readonly WorkshopTrack[], order: readonly string[] | null): WorkshopTrack[] {
  if (order === null) return [...tracks];
  const byId = new Map(tracks.map((track) => [track.requestId, track]));
  const placed = new Set<string>();
  const arranged: WorkshopTrack[] = [];
  for (const id of order) {
    const track = byId.get(id);
    if (track === undefined || placed.has(id)) continue;
    placed.add(id);
    arranged.push(track);
  }
  for (const track of tracks) {
    if (!placed.has(track.requestId)) arranged.push(track);
  }
  return arranged;
}

export function sameOrder(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((id, index) => second[index] === id);
}

export function nudged(order: readonly string[], id: string, delta: number): string[] {
  const from = order.indexOf(id);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= order.length) return [...order];
  const next = [...order];
  next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

export function gathered(order: readonly string[], picked: ReadonlySet<string>, edge: "top" | "bottom"): string[] {
  const chosen = order.filter((id) => picked.has(id));
  const rest = order.filter((id) => !picked.has(id));
  return edge === "top" ? [...chosen, ...rest] : [...rest, ...chosen];
}

export function removalsOf(ordered: readonly WorkshopTrack[], picked: ReadonlySet<string>): RemovedPlaylistTrack[] {
  const removed: RemovedPlaylistTrack[] = [];
  ordered.forEach((track, position) => {
    if (picked.has(track.requestId) && isRemovableTrack(track)) {
      removed.push({ trackId: track.requestId, position, title: track.title });
    }
  });
  return removed;
}

export function totalMinutes(tracks: readonly WorkshopTrack[]): number {
  return Math.round(tracks.reduce((total, track) => total + track.durationMs, 0) / MS_PER_MINUTE);
}

export function workshopTracks<TTrack extends { requestId: string | null }>(
  tracks: readonly TTrack[]
): (TTrack & { requestId: string })[] {
  return tracks.filter((track): track is TTrack & { requestId: string } => track.requestId !== null);
}
