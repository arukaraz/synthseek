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
