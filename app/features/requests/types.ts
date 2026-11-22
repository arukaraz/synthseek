import {
  ACTIVE_STATUSES,
  DownloadSourceKey,
  RequestStatus,
  type AppRouter,
  type TrackStatusCounts,
} from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export type StatusFilter = "all" | "pending_approval" | "review" | "active" | "done" | "failed" | "cancelled";
export type SourceFilter = "all" | DownloadSourceKey;

export enum SortField {
  RECENT = "recent",
  PLAYLIST = "playlist",
  ARTIST = "artist",
  ALBUM = "album",
}
export type SortDirection = "asc" | "desc";

export const STATUS_FILTERS: readonly StatusFilter[] = [
  "all",
  "pending_approval",
  "review",
  "active",
  "done",
  "failed",
  "cancelled",
];
export const SOURCE_FILTERS: readonly SourceFilter[] = ["all", ...DownloadSourceKey.options];
const DEFAULT_SOURCE_FILTER: SourceFilter = "all";
export const SORT_FIELD_VALUES: readonly SortField[] = Object.values(SortField);
export const SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];

export const REQUESTS_URL_PARAMS = {
  filter: { defaultValue: "all" as StatusFilter, validValues: STATUS_FILTERS },
  source: { defaultValue: DEFAULT_SOURCE_FILTER, validValues: SOURCE_FILTERS },
  sort: { defaultValue: SortField.RECENT, validValues: SORT_FIELD_VALUES },
  dir: { defaultValue: "desc" as SortDirection, validValues: SORT_DIRECTIONS },
  q: { defaultValue: "" as string },
  selected: {},
} as const;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface StatusFilterMatch {
  statuses: readonly RequestStatus[];
  trackCount: keyof TrackStatusCounts | null;
  losslessPartial: boolean;
}

export const STATUS_FILTER_MATCH: Record<Exclude<StatusFilter, "all">, StatusFilterMatch> = {
  pending_approval: { statuses: [RequestStatus.enum.pending_approval], trackCount: null, losslessPartial: false },
  review: { statuses: [RequestStatus.enum.pending_import_review], trackCount: "review", losslessPartial: false },
  active: { statuses: ACTIVE_STATUSES, trackCount: null, losslessPartial: false },
  done: {
    statuses: [RequestStatus.enum.complete, RequestStatus.enum.delegated],
    trackCount: null,
    losslessPartial: true,
  },
  failed: { statuses: [RequestStatus.enum.failed], trackCount: "failed", losslessPartial: false },
  cancelled: { statuses: [RequestStatus.enum.cancelled], trackCount: "cancelled", losslessPartial: false },
};

export const DOWNLOAD_ACTIVE_STATUSES: readonly RequestStatus[] = [
  RequestStatus.enum.searching,
  RequestStatus.enum.pending_download,
  RequestStatus.enum.downloading,
  RequestStatus.enum.pending_import,
  RequestStatus.enum.importing,
  RequestStatus.enum.in_progress,
];

export type FlatTrackRow = inferRouterOutputs<AppRouter>["requests"]["getRecentTracks"][number];
