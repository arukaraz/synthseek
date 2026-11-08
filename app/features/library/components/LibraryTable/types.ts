import type { ColumnDef } from "@components/ui/Table";
import type { ReactNode } from "react";

import type { LibrarySelection } from "../../hooks/useLibrarySelection";
import type { LibraryFileActions } from "../../types";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

export interface TrackColumnOptions {
  onPlay: (trackId: string) => void;
  onEnqueue: (trackIds: string[]) => Promise<boolean>;
  onSearchBetterQuality: (trackIds: string[]) => void;
  fileActions: LibraryFileActions;
  showLibraryPath: boolean;
}

export interface LibraryTableProps<TItem> {
  items: TItem[];
  columns: ColumnDef<TItem>[];
  getRowId: (item: TItem) => string;
  emptyMessage: string;
  selection?: TrackSelectionConfig;
  rows?: ReactNode;
}

export interface TrackSelectionConfig {
  items: LibraryTrackItem[];
  selection: LibrarySelection;
  onEnqueue: (trackIds: string[]) => Promise<boolean>;
  fileActions: LibraryFileActions;
  collapsed?: boolean;
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
