import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { LibrarySourceDescription, LibrarySourceProvider } from "@hooks/api/queries/library-source/types";

import type { LibraryDraft } from "../hooks/useLibraryDraftState";
import type {
  AutoWatchState,
  LibraryFilter,
  LibraryItem,
  LibraryItemType,
  LibrarySort,
  ToggleAggregateState,
  WatchCapabilities,
} from "../types";

export interface BrandMarkProps {
  size?: number;
}

export interface ProviderMarkProps extends BrandMarkProps {
  provider: LibrarySourceProvider;
}

export interface ModalTopbarProps {
  provider: LibrarySourceProvider;
  name: string;
}

export interface ConnectPromptProps {
  source: LibrarySourceDescription | undefined;
  expired?: boolean;
}

export interface ModalToolbarProps {
  providerName: string;
  itemTypes: ReadonlyArray<LibraryItemType>;
  watch: WatchCapabilities;
  filter: LibraryFilter;
  onFilterChange: (v: LibraryFilter) => void;
  sort: LibrarySort;
  onSortChange: (v: LibrarySort) => void;
  direction: "asc" | "desc";
  onDirectionChange: (v: "asc" | "desc") => void;
  search: string;
  onSearchChange: (v: string) => void;
  autoWatch: AutoWatchState;
  onWatchChange: (next: Partial<AutoWatchState>) => void;
}

export interface MasterTableProps {
  items: LibraryItem[];
  isLoading: boolean;
  draft: LibraryDraft;
  hiddenOnMobile?: boolean;
  selectionBar: ReactNode;
}

export interface TriStateToggleProps {
  state: ToggleAggregateState;
  onActivate: () => void;
  label: string;
  glyph: LucideIcon;
  ariaLabel: string;
  disabled?: boolean;
  description?: string;
  descriptionId?: string;
}

export interface SelectionBulkBarProps {
  selectedCount: number;
  syncState: ToggleAggregateState;
  importState: ToggleAggregateState;
  hasPlaylists: boolean;
  isMixedType: boolean;
  onActivateSync: () => void;
  onActivateImport: () => void;
  onClear: () => void;
  disabled: boolean;
}

export interface MasterTableRowProps {
  item: LibraryItem;
  selected: boolean;
  focused: boolean;
  imported: boolean;
  syncEnabled: boolean;
  syncAvailable: boolean;
  onClick: () => void;
  onToggleSelect: () => void;
  onToggleSync: () => void;
}

export interface DetailPanelProps {
  provider: LibrarySourceProvider;
  providerName: string;
  focusedItem: LibraryItem | null;
  draft: LibraryDraft;
  onBack?: () => void;
}

export interface DetailHeroProps {
  providerName: string;
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
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export interface AutoWatchTogglesProps {
  providerName: string;
  watch: WatchCapabilities;
  value: AutoWatchState;
  onChange: (next: Partial<AutoWatchState>) => void;
}
