import type { RequestListItem } from "@api/__generated__/types";
import { useMemo } from "react";
import { filterRequestsByStatus } from "../helpers";
import { SortConfig, SortField, StatusFilter } from "../types";

export function useFilteredRequests(
  items: RequestListItem[] | undefined,
  statusFilter: StatusFilter,
  sort: SortConfig,
  searchQuery: string,
  trackTitleMatchIds: string[] | undefined
): RequestListItem[] {
  return useMemo(() => {
    let filtered = filterRequestsByStatus(items, statusFilter);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchedByTrack = new Set(trackTitleMatchIds ?? []);
      filtered = filtered.filter((item) => {
        if (item.name.toLowerCase().includes(query)) return true;
        if (item.artist.toLowerCase().includes(query)) return true;
        return matchedByTrack.has(item.id);
      });
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.field) {
        case SortField.RECENT:
          return direction * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        case SortField.ARTIST:
          return direction * a.artist.localeCompare(b.artist);
        case SortField.ALBUM:
        case SortField.PLAYLIST:
          return direction * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [items, statusFilter, sort, searchQuery, trackTitleMatchIds]);
}
