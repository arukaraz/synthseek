import type { ColumnDef } from "@components/ui/Table";

import type { LibrarySelection } from "../../hooks/useLibrarySelection";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

export interface LibraryTableProps<TItem> {
  items: TItem[];
  columns: ColumnDef<TItem>[];
  getRowId: (item: TItem) => string;
  emptyMessage: string;
  selection?: TrackSelectionConfig;
}

export interface TrackSelectionConfig {
  items: LibraryTrackItem[];
  selection: LibrarySelection;
}

export interface SelectionBulkBarProps {
  selectedCount: number;
  failedCount: number;
  onRetryFailed: () => void;
  onAddToPlaylist: () => void;
  onClear: () => void;
  isRetrying: boolean;
}

export interface SelectHeaderProps {
  checked: boolean;
  indeterminate: boolean;
  onToggle: (checked: boolean) => void;
}

export interface SelectCellProps {
  checked: boolean;
  onToggle: () => void;
}
