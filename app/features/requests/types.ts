import {
  ACTIVE_STATUSES,
  ContentType,
  RequestStatus,
  UNRESOLVED_STATUSES,
  type TrackRequest,
} from "@api/__generated__/types";

export type ViewMode = "compact" | "list";
export type StatusFilter = "all" | "active" | "done" | "failed";

export enum SortField {
  RECENT = "recent",
  PLAYLIST = "playlist",
  ARTIST = "artist",
  ALBUM = "album",
}
export type SortDirection = "asc" | "desc";

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
  };
}

export type TableSortField = "title" | "status" | "album" | "artist" | "type" | "created_at" | "completed_at";
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
  { field: "album", label: "Album", sortable: true },
  { field: "artist", label: "Artist", sortable: true },
  { field: "type", label: "Type", sortable: true },
  { field: "created_at", label: "Added", sortable: true },
  { field: "completed_at", label: "Completed", sortable: true },
  { field: "actions", label: "", sortable: false },
];
