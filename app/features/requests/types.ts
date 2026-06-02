import {
  ACTIVE_STATUSES,
  ContentType,
  RequestStatus,
  UNRESOLVED_STATUSES,
  type PublicUser,
  type TrackRequest,
} from "@api/__generated__/types";

export type ViewMode = "groups" | "list";
export type StatusFilter = "all" | "active" | "done" | "failed";

export enum SortField {
  RECENT = "recent",
  PLAYLIST = "playlist",
  ARTIST = "artist",
  ALBUM = "album",
}
export type SortDirection = "asc" | "desc";

export const VIEW_MODES: readonly ViewMode[] = ["groups", "list"];
export const STATUS_FILTERS: readonly StatusFilter[] = ["all", "active", "done", "failed"];
export const SORT_FIELD_VALUES: readonly SortField[] = Object.values(SortField);
export const SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];

export const SOURCE_SEARCH_THRESHOLD = 6;

export const PER_PAGE_OPTIONS = [25, 50, 100] as const;
export const DEFAULT_PER_PAGE = 50;

export const REQUESTS_URL_PARAMS = {
  view: { defaultValue: "groups" as ViewMode, validValues: VIEW_MODES },
  filter: { defaultValue: "all" as StatusFilter, validValues: STATUS_FILTERS },
  sort: { defaultValue: SortField.RECENT, validValues: SORT_FIELD_VALUES },
  dir: { defaultValue: "desc" as SortDirection, validValues: SORT_DIRECTIONS },
  q: { defaultValue: "" as string },
  source: { defaultValue: "" as string },
  page: { defaultValue: "1" as string },
  perPage: { defaultValue: "50" as string },
  selected: {},
} as const;

export interface SourceOption {
  id: string;
  name: string;
  contentType: ContentType;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface RequestsViewState {
  viewMode: ViewMode;
  statusFilter: StatusFilter;
  sort: SortConfig;
}

export const STATUS_FILTER_MAP = {
  all: null,
  active: ACTIVE_STATUSES,
  done: [RequestStatus.enum.complete],
  failed: [...UNRESOLVED_STATUSES, RequestStatus.enum.partially_complete],
} as const;

export interface FlatTrackRow extends TrackRequest {
  parent: {
    id: string;
    name: string;
    artist: string;
    album_art: string | null;
    contentType: ContentType;
    requestedBy: PublicUser;
  };
}

export type TableSortField =
  | "title"
  | "status"
  | "album"
  | "artist"
  | "type"
  | "created_at"
  | "completed_at"
  | "requestedBy";
export type TableSortDirection = "asc" | "desc";

export interface TableSortConfig {
  field: TableSortField;
  direction: TableSortDirection;
}

export interface TableProps {
  items: FlatTrackRow[];
  sort: TableSortConfig;
  onSortChange: (sort: TableSortConfig) => void;
}

export interface ColumnDef {
  field: TableSortField | "actions";
  label: string;
  sortable: boolean;
}

export const COLUMNS: ColumnDef[] = [
  { field: "title", label: "Title", sortable: true },
  { field: "status", label: "Status", sortable: true },
  { field: "album", label: "Album/Playlist", sortable: true },
  { field: "artist", label: "Artist", sortable: true },
  { field: "type", label: "Type", sortable: true },
  { field: "requestedBy", label: "Requested by", sortable: true },
  { field: "created_at", label: "Added", sortable: true },
  { field: "completed_at", label: "Completed", sortable: true },
  { field: "actions", label: "", sortable: false },
];
