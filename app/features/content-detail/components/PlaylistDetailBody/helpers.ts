import type { RequestStatus } from "@api/__generated__/types";

import type { TracklistTrack } from "../Tracklist/types";
import { SORT_KEYS, STATUS_SORT_ORDER } from "./constants";
import type { SortDirection, TracklistSortKey } from "./types";

export function isTracklistSortKey(value: string): value is TracklistSortKey {
  return (SORT_KEYS as readonly string[]).includes(value);
}

function statusRank(status: RequestStatus | null): number {
  if (status === null) return STATUS_SORT_ORDER.length;
  const index = STATUS_SORT_ORDER.indexOf(status);
  return index === -1 ? STATUS_SORT_ORDER.length : index;
}

function compareByKey(a: TracklistTrack, b: TracklistTrack, sortKey: TracklistSortKey): number {
  if (sortKey === "name") return a.title.localeCompare(b.title);
  if (sortKey === "length") return a.durationMs - b.durationMs;
  return statusRank(a.status) - statusRank(b.status);
}

export function sortTracklist(
  tracks: TracklistTrack[],
  sortKey: TracklistSortKey,
  direction: SortDirection
): TracklistTrack[] {
  const factor = direction === "asc" ? 1 : -1;
  return [...tracks].sort((a, b) => compareByKey(a, b, sortKey) * factor);
}

export function tracklistOrderSignature(
  tracks: readonly TracklistTrack[],
  sortKey: TracklistSortKey,
  direction: SortDirection
): string {
  const members = tracks.map((track) => track.externalId).sort();
  return JSON.stringify([sortKey, direction, members]);
}

export function sortedTrackIds(
  tracks: TracklistTrack[],
  sortKey: TracklistSortKey,
  direction: SortDirection
): string[] {
  return sortTracklist(tracks, sortKey, direction).map((track) => track.externalId);
}

export function arrangeByOrder(tracks: readonly TracklistTrack[], ids: readonly string[]): TracklistTrack[] {
  const byId = new Map(tracks.map((track) => [track.externalId, track]));
  return ids.flatMap((id) => {
    const track = byId.get(id);
    return track ? [track] : [];
  });
}
