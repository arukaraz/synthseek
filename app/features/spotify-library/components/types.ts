import type { LibraryDraft } from "../hooks/useLibraryDraftState";
import type { AutoWatchState, LibraryFilter, LibraryItem, LibraryItemType, LibrarySort } from "../types";

export interface SpotifyMarkProps {
  size?: number;
}

export interface ModalToolbarProps {
  filter: LibraryFilter;
  onFilterChange: (v: LibraryFilter) => void;
  sort: LibrarySort;
  onSortChange: (v: LibrarySort) => void;
  direction: "asc" | "desc";
  onDirectionChange: (v: "asc" | "desc") => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export interface MasterTableProps {
  items: LibraryItem[];
  isLoading: boolean;
  draft: LibraryDraft;
  hiddenOnMobile?: boolean;
}

export interface MasterTableRowProps {
  item: LibraryItem;
  selected: boolean;
  focused: boolean;
  imported: boolean;
  syncEnabled: boolean;
  onClick: () => void;
  onToggleSelect: () => void;
  onToggleSync: () => void;
}

export interface DetailPanelProps {
  focusedItem: LibraryItem | null;
  draft: LibraryDraft;
  onBack?: () => void;
}

export interface DetailHeroProps {
  itemType: LibraryItemType;
  imported: boolean;
  importedTarget: boolean;
  onToggleImport: () => void;
  externalUrl: string;
  name: string;
  crumb: string;
  byline: string;
  image: string | null;
  onBack?: () => void;
}

export interface DetailSyncConfigProps {
  itemType: LibraryItemType;
  syncEnabled: boolean;
  onToggle: () => void;
}

export interface DetailMetadataProps {
  sourceId: string;
  released: string | null;
  label: string | null;
  lastSyncedAt: Date | string | null;
}

export interface DetailTracklistProps {
  totalTracks: number;
  preview: ReadonlyArray<{ position: number; title: string; artist: string; duration: string }>;
  externalUrl: string;
  hasMore: boolean;
}

export interface ModalBottombarProps {
  totalRows: number;
  totalTracks: number;
  selectedCount: number;
  draft: LibraryDraft;
  onBulkSync: (enabled: boolean) => void;
  onBulkImport: (enabled: boolean) => void;
  onClearSelection: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  autoWatch: AutoWatchState;
  onWatchChange: (next: Partial<AutoWatchState>) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export interface AutoWatchTogglesProps {
  value: AutoWatchState;
  onChange: (next: Partial<AutoWatchState>) => void;
}

export interface SelectionBulkActionsProps {
  selectedCount: number;
  onEnableSync: () => void;
  onDisableSync: () => void;
  onEnableImport: () => void;
  onDisableImport: () => void;
  onClear: () => void;
}
