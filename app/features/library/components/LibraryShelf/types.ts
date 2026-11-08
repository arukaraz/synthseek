import type { LibraryFacetValue } from "@hooks/api/queries/library/types";

import type { LibraryUrlController } from "../../hooks/useLibraryUrlState";
import type { LucideIcon } from "lucide-react";

import type { LibraryDensity, LibraryView, LibraryViewShell } from "../../types";

export interface LibraryShelfHeaderProps {
  controller: LibraryUrlController;
  total: number;
  facets: Readonly<Record<string, LibraryFacetValue[]>>;
  shell: LibraryViewShell;
}

export interface ShelfTitleBarProps {
  controller: LibraryUrlController;
  total: number;
}

export interface ShelfViewPillsProps {
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
}

export interface ShelfLayoutOption {
  value: LibraryDensity;
  Icon: LucideIcon;
}

export interface ShelfControlsProps {
  controller: LibraryUrlController;
  onOpenFilters: () => void;
  shell: LibraryViewShell;
}

export interface ShelfSortSheetProps {
  controller: LibraryUrlController;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ShelfActiveChipsProps {
  controller: LibraryUrlController;
  facets: Readonly<Record<string, LibraryFacetValue[]>>;
}

export interface ShelfActiveChip {
  key: string;
  value: string;
  label: string;
}
