import { ContentType, type RequestListItem } from "@api/__generated__/types";
import { matchesTerms, searchTerms } from "@utils/search";
import { useMemo } from "react";
import { compareTypeFirst, filterRequestsByStatus } from "../helpers";
import { SortConfig, SortField, StatusFilter } from "../types";

export function useFilteredRequests(
  items: RequestListItem[] | undefined,
  statusFilter: StatusFilter,
  sort: SortConfig,
  searchQuery: string,
  trackTitleMatchIds: string[] | undefined,
  sourceMatchIds: string[] | null = null
): RequestListItem[] {
  return useMemo(() => {
    let filtered = filterRequestsByStatus(items, statusFilter);

    if (sourceMatchIds !== null) {
      const fromSource = new Set(sourceMatchIds);
      filtered = filtered.filter((item) => fromSource.has(item.id));
    }

    const terms = searchTerms(searchQuery);
    if (terms.length > 0) {
      const matchedByTrack = new Set(trackTitleMatchIds ?? []);
      filtered = filtered.filter(
        (item) => matchesTerms(terms, [item.name, item.credited_artist]) || matchedByTrack.has(item.id)
      );
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.field) {
        case SortField.RECENT:
          return direction * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        case SortField.ARTIST:
          return direction * a.credited_artist.localeCompare(b.credited_artist);
        case SortField.ALBUM:
          return compareTypeFirst(a, b, ContentType.enum.album) || direction * a.name.localeCompare(b.name);
        case SortField.PLAYLIST:
          return compareTypeFirst(a, b, ContentType.enum.playlist) || direction * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [items, statusFilter, sort, searchQuery, trackTitleMatchIds, sourceMatchIds]);
}
