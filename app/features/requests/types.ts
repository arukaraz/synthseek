import { ACTIVE_STATUSES, RequestStatus, UNRESOLVED_STATUSES, type AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export type StatusFilter = "all" | "pending_approval" | "active" | "done" | "failed";

export enum SortField {
  RECENT = "recent",
  PLAYLIST = "playlist",
  ARTIST = "artist",
  ALBUM = "album",
}
export type SortDirection = "asc" | "desc";

export const STATUS_FILTERS: readonly StatusFilter[] = ["all", "pending_approval", "active", "done", "failed"];
export const SORT_FIELD_VALUES: readonly SortField[] = Object.values(SortField);
export const SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];

export const REQUESTS_URL_PARAMS = {
  filter: { defaultValue: "all" as StatusFilter, validValues: STATUS_FILTERS },
  sort: { defaultValue: SortField.RECENT, validValues: SORT_FIELD_VALUES },
  dir: { defaultValue: "desc" as SortDirection, validValues: SORT_DIRECTIONS },
  q: { defaultValue: "" as string },
  selected: {},
} as const;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const STATUS_FILTER_MAP = {
  all: null,
  pending_approval: [RequestStatus.enum.pending_approval],
  active: [...ACTIVE_STATUSES],
  done: [RequestStatus.enum.complete, RequestStatus.enum.delegated],
  failed: [...UNRESOLVED_STATUSES, RequestStatus.enum.partially_complete],
} as const;

export const DOWNLOAD_ACTIVE_STATUSES: readonly RequestStatus[] = [
  RequestStatus.enum.searching,
  RequestStatus.enum.pending_download,
  RequestStatus.enum.downloading,
  RequestStatus.enum.pending_import,
  RequestStatus.enum.importing,
  RequestStatus.enum.in_progress,
];

export type FlatTrackRow = inferRouterOutputs<AppRouter>["requests"]["getRecentTracks"][number];
