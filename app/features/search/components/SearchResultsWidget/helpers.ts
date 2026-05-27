import { ContentType, type FilterType, type MusicItem, type SearchResults } from "@api/__generated__/types";
import { VALID_FILTERS } from "../../constants";

export function getFlatResults(response: SearchResults | undefined): MusicItem[] {
  if (!response) return [];
  return [
    ...(response.tracks?.items ?? []),
    ...(response.albums?.items ?? []),
    ...(response.artists?.items ?? []),
    ...(response.playlists?.items ?? []),
  ];
}

export function getAvailableTypes(response: SearchResults | undefined): Set<string> {
  const types = new Set<string>();
  if (!response) return types;
  if (response.tracks?.items.length) types.add(ContentType.enum.track);
  if (response.albums?.items.length) types.add(ContentType.enum.album);
  if (response.artists?.items.length) types.add(ContentType.enum.artist);
  if (response.playlists?.items.length) types.add(ContentType.enum.playlist);
  return types;
}

export function getFilteredResults(
  response: SearchResults | undefined,
  activeFilter: FilterType,
  flatResults: MusicItem[]
): MusicItem[] {
  switch (activeFilter) {
    case ContentType.enum.track:
      return response?.tracks?.items ?? [];
    case ContentType.enum.album:
      return response?.albums?.items ?? [];
    case ContentType.enum.artist:
      return response?.artists?.items ?? [];
    case ContentType.enum.playlist:
      return response?.playlists?.items ?? [];
    default:
      return flatResults;
  }
}

export function getActiveFilter(filterParam: string | null, initialFilter: string): FilterType {
  const candidate = filterParam ?? initialFilter;
  return VALID_FILTERS.includes(candidate as (typeof VALID_FILTERS)[number]) ? (candidate as FilterType) : "all";
}
