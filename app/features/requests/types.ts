import {
  RequestStatus,
  ACTIVE_STATUSES,
  UNRESOLVED_STATUSES,
  type TrackRequestWithAlbum,
} from "@api/__generated__/types";

export type ViewMode = "compact" | "list";
export type StatusFilter = "all" | "active" | "done" | "failed";

export type SortField = "recents" | "artist" | "album";
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

export type TableSortField = "title" | "status" | "album" | "artist" | "created_at" | "completed_at";
export type TableSortDirection = "asc" | "desc";

export interface TableSortConfig {
  field: TableSortField;
  direction: TableSortDirection;
}

export interface TableProps {
  items: TrackRequestWithAlbum[];
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
  { field: "created_at", label: "Added", sortable: true },
  { field: "completed_at", label: "Completed", sortable: true },
  { field: "actions", label: "", sortable: false },
];
