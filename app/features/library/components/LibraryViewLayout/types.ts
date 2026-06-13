import type { ColumnDef } from "@components/ui/Table";
import type { LibraryFacetValue } from "@hooks/api/queries/library/types";
import type { ReactNode } from "react";

import type { LibraryUrlController } from "../../hooks/useLibraryUrlState";
import type { TrackSelectionConfig } from "../LibraryTable/types";

interface TableContent<TItem> {
  layout: "table";
  columns: ColumnDef<TItem>[];
  getRowId: (item: TItem) => string;
  selection?: TrackSelectionConfig;
}

interface GridContent<TItem> {
  layout: "grid";
  renderCard: (item: TItem) => ReactNode;
  getCardId: (item: TItem) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export type LibraryViewContent<TItem> = TableContent<TItem> | GridContent<TItem>;

export interface LibraryViewLayoutProps<TItem> {
  controller: LibraryUrlController;
  items: TItem[] | undefined;
  total: number;
  facets: Record<string, LibraryFacetValue[]>;
  isLoading: boolean;
  isError: boolean;
  content: LibraryViewContent<TItem>;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
}
