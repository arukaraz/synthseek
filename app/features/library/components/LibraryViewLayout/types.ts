import type { AlphabetIndexEntry } from "@components/ui/AlphabetIndex";
import type { ColumnDef } from "@components/ui/Table";
import type { LibraryFacetValue } from "@hooks/api/queries/library/types";
import type { KeyboardEvent, ReactNode } from "react";

import type { LibraryUrlController } from "../../hooks/useLibraryUrlState";
import type { LibraryViewShell } from "../../types";
import type { TrackSelectionConfig } from "../LibraryTable/types";

interface TableContent<TItem> {
  layout: "table";
  columns: ColumnDef<TItem>[];
  getRowId: (item: TItem) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  selection?: TrackSelectionConfig;
  rows?: ReactNode;
}

interface GridContent<TItem> {
  layout: "grid";
  renderCard: (item: TItem) => ReactNode;
  getCardId: (item: TItem) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  bulkBar?: ReactNode;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  letterIndex?: GridLetterIndex;
}

export interface GridLetterIndex {
  entries: readonly AlphabetIndexEntry[];
  descending: boolean;
  loadThrough: (offset: number) => Promise<void>;
}

export interface LibraryLetterIndexProps {
  index: GridLetterIndex;
  scrollRoot: HTMLElement | null;
}

export type LibraryViewContent<TItem> = TableContent<TItem> | GridContent<TItem>;

export interface LibraryViewLayoutProps<TItem> {
  controller: LibraryUrlController;
  items: TItem[] | undefined;
  total: number;
  facets: Record<string, LibraryFacetValue[]>;
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
  content: LibraryViewContent<TItem>;
  shell: LibraryViewShell;
}
