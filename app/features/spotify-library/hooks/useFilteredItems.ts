"use client";

import { useMemo } from "react";

import { compareItems, matchesFilter, matchesSearch } from "../helpers";
import type { LibraryFilter, LibraryItem, LibrarySort } from "../types";

interface Options {
  items: ReadonlyArray<LibraryItem>;
  filter: LibraryFilter;
  sort: LibrarySort;
  direction: "asc" | "desc";
  search: string;
}

export function useFilteredItems({ items, filter, sort, direction, search }: Options): LibraryItem[] {
  return useMemo(() => {
    const filtered = items.filter((i) => matchesFilter(i, filter) && matchesSearch(i, search));
    return [...filtered].sort((a, b) => compareItems(a, b, sort, direction));
  }, [items, filter, sort, direction, search]);
}
