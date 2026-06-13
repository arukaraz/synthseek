import type { LibraryUrlController } from "../../hooks/useLibraryUrlState";
import type { LibraryKey, LibraryView } from "../../types";

export interface LibraryToolbarProps {
  controller: LibraryUrlController;
  searchValue: string;
  searchPlaceholderKey: LibraryKey;
  onSearchChange: (value: string) => void;
  onViewChange: (view: LibraryView) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}
