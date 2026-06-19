import type { DetailTarget } from "../../types";

export interface PlaylistDetailBodyProps {
  target: DetailTarget;
  onClose: () => void;
  showInLibraryPill?: boolean;
}

export type TracklistSortKey = "name" | "status" | "length";

export type SortDirection = "asc" | "desc";

export interface TracklistSortProps {
  sortKey: TracklistSortKey;
  direction: SortDirection;
  onSortKeyChange: (key: TracklistSortKey) => void;
  onDirectionChange: (direction: SortDirection) => void;
}
