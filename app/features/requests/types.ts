import { DownloadSourceKey, RequestListFilter, type AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export type StatusFilter = RequestListFilter;
export type SourceFilter = "all" | DownloadSourceKey;

export enum SortField {
  RECENT = "recent",
  PLAYLIST = "playlist",
  ARTIST = "artist",
  ALBUM = "album",
}
export type SortDirection = "asc" | "desc";

export const STATUS_FILTERS: readonly StatusFilter[] = RequestListFilter.options;
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

export type FlatTrackRow = inferRouterOutputs<AppRouter>["requests"]["getRecentTracks"][number];
