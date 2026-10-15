import { RequestFormat, RequestStatus } from "@api/__generated__/types";
import type {
  LibraryAlbumItem,
  LibraryAlbumsInput,
  LibraryArtistsInput,
  LibraryCountsResult,
  LibraryFacetValue,
  LibraryFilesStatus,
  LibraryPlaylistsInput,
  LibraryTrackItem,
  LibraryTracksInput,
} from "@hooks/api/queries/library/types";
import type { CheckboxPreview } from "@components/ui/Checkbox";
import type { SelectionRange } from "@hooks/ui/useSelection";
import { isTextEntryTarget } from "@utils/text-entry";
import type { KeyboardEvent } from "react";

import { LIBRARY_PAGE_SIZE_OPTIONS, VIEW_CONFIG } from "./constants";
import type {
  FacetSearchState,
  FilterParamMap,
  LibraryFileJob,
  LibraryFileRequest,
  LibraryFileTarget,
  LibraryView,
  SelectionShortcutTarget,
  SortDirection,
  ViewConfig,
} from "./types";

const FILTER_VALUE_SEPARATOR = ",";

export function parseFilterValues(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(FILTER_VALUE_SEPARATOR)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function serializeFilterValues(values: string[]): string | null {
  if (values.length === 0) return null;
  return values.join(FILTER_VALUE_SEPARATOR);
}

export function toggleFilterValue(current: string[], value: string): string[] {
  if (current.includes(value)) {
    return current.filter((entry) => entry !== value);
  }
  return [...current, value];
}

function toStatusValues(values: string[]): RequestStatus[] {
  const parsed: RequestStatus[] = [];
  for (const value of values) {
    const result = RequestStatus.safeParse(value);
    if (result.success) parsed.push(result.data);
  }
  return parsed;
}

function toFormatValues(values: string[]): RequestFormat[] {
  const parsed: RequestFormat[] = [];
  for (const value of values) {
    const result = RequestFormat.safeParse(value);
    if (result.success) parsed.push(result.data);
  }
  return parsed;
}

function emptyToUndefined<T>(values: T[]): T[] | undefined {
  return values.length > 0 ? values : undefined;
}

function buildFacetSearch(facetSearch: FacetSearchState): LibraryTracksInput["facetSearch"] {
  const next: NonNullable<LibraryTracksInput["facetSearch"]> = {};
  if (facetSearch.artist) next.artist = facetSearch.artist;
  if (facetSearch.genre) next.genre = facetSearch.genre;
  if (facetSearch.playlist) next.playlist = facetSearch.playlist;
  if (facetSearch.owner) next.owner = facetSearch.owner;
  return Object.keys(next).length > 0 ? next : undefined;
}

interface InputBaseArgs {
  limit: number;
  offset: number;
  q: string | undefined;
  sort: string;
  direction: SortDirection | undefined;
  filters: FilterParamMap;
  facetSearch: FacetSearchState;
}

export function buildTracksInput(args: InputBaseArgs): LibraryTracksInput {
  const { filters } = args;
  return {
    limit: args.limit,
    offset: args.offset,
    q: args.q,
    sort: resolveTrackSort(args.sort),
    direction: args.direction,
    facetSearch: buildFacetSearch(args.facetSearch),
    filters: {
      status: emptyToUndefined(toStatusValues(filters.status ?? [])),
      format: emptyToUndefined(toFormatValues(filters.format ?? [])),
      origin: emptyToUndefined(filters.origin ?? []),
      source: emptyToUndefined(filters.source ?? []),
      artist: emptyToUndefined(filters.artist ?? []),
      requestedBy: emptyToUndefined(filters.requestedBy ?? []),
      genre: emptyToUndefined(filters.genre ?? []),
      playlist: emptyToUndefined(filters.playlist ?? []),
      albumId: emptyToUndefined(filters.albumId ?? []),
      libraryPath: emptyToUndefined(filters.libraryPath ?? []),
      orphan: filters.orphan?.includes("true") ? true : undefined,
    },
  };
}

export function buildAlbumsInput(args: InputBaseArgs): LibraryAlbumsInput {
  const { filters } = args;
  return {
    limit: args.limit,
    offset: args.offset,
    q: args.q,
    sort: resolveAlbumSort(args.sort),
    direction: args.direction,
    facetSearch: buildFacetSearch(args.facetSearch),
    filters: {
      status: emptyToUndefined(toStatusValues(filters.status ?? [])),
      artist: emptyToUndefined(filters.artist ?? []),
      genre: emptyToUndefined(filters.genre ?? []),
      year: emptyToUndefined(filters.year ?? []),
      origin: emptyToUndefined(filters.origin ?? []),
      libraryPath: emptyToUndefined(filters.libraryPath ?? []),
    },
  };
}

export function buildArtistsInput(args: InputBaseArgs): LibraryArtistsInput {
  const { filters } = args;
  return {
    limit: args.limit,
    offset: args.offset,
    q: args.q,
    sort: resolveArtistSort(args.sort),
    direction: args.direction,
    facetSearch: buildFacetSearch(args.facetSearch),
    filters: {
      genre: emptyToUndefined(filters.genre ?? []),
      origin: emptyToUndefined(filters.origin ?? []),
      status: emptyToUndefined(toStatusValues(filters.status ?? [])),
    },
  };
}

export function buildPlaylistsInput(args: InputBaseArgs): LibraryPlaylistsInput {
  const { filters } = args;
  return {
    limit: args.limit,
    offset: args.offset,
    q: args.q,
    sort: resolvePlaylistSort(args.sort),
    direction: args.direction,
    facetSearch: buildFacetSearch(args.facetSearch),
    filters: {
      origin: emptyToUndefined(filters.origin ?? []),
      owner: emptyToUndefined(filters.owner ?? []),
      status: emptyToUndefined(toStatusValues(filters.status ?? [])),
    },
  };
}

function resolveTrackSort(sort: string): NonNullable<LibraryTracksInput["sort"]> {
  const options = VIEW_CONFIG.tracks.sortOptions.map((option) => option.value);
  const match = options.find((value) => value === sort);
  if (match === "oldest" || match === "artist" || match === "album" || match === "title") return match;
  if (match === "duration" || match === "status" || match === "recent") return match;
  return "recent";
}

function resolveAlbumSort(sort: string): NonNullable<LibraryAlbumsInput["sort"]> {
  if (sort === "name" || sort === "artist" || sort === "year" || sort === "tracks") return sort;
  return "recent";
}

function resolveArtistSort(sort: string): NonNullable<LibraryArtistsInput["sort"]> {
  if (sort === "tracks" || sort === "albums") return sort;
  return "name";
}

function resolvePlaylistSort(sort: string): NonNullable<LibraryPlaylistsInput["sort"]> {
  if (sort === "name" || sort === "tracks") return sort;
  return "recent";
}

export function clampPage(rawPage: string): number {
  const parsed = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function resolvePageSize(rawRows: string): number {
  const parsed = Number.parseInt(rawRows, 10);
  const match = LIBRARY_PAGE_SIZE_OPTIONS.find((size) => size === parsed);
  return match ?? LIBRARY_PAGE_SIZE_OPTIONS[0];
}

export function computePageCount(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function topFacetValues(values: LibraryFacetValue[], topN: number, hasSearch: boolean): LibraryFacetValue[] {
  if (hasSearch) return values;
  return values.slice(0, topN);
}

export function isLibraryView(value: string | undefined): value is LibraryView {
  return value === "tracks" || value === "albums" || value === "artists" || value === "playlists";
}

export function viewCountFor(view: LibraryView, counts: LibraryCountsResult | undefined): number | undefined {
  if (!counts) return undefined;
  return counts[view];
}

export function resolveEffectiveDirection(
  config: ViewConfig,
  sort: string,
  direction: SortDirection | undefined
): SortDirection {
  if (direction !== undefined) return direction;
  const option = config.sortOptions.find((entry) => entry.value === sort);
  return option?.defaultDirection ?? "desc";
}

export function countActiveFilters(filters: FilterParamMap): number {
  let count = 0;
  for (const values of Object.values(filters)) {
    if (values) count += values.length;
  }
  return count;
}

export function fileJobReport(
  job: LibraryFileJob | null,
  status: LibraryFilesStatus | undefined,
  fetchedAt: number
): LibraryFilesStatus | null {
  if (job === null || status === undefined || fetchedAt < job.since) return null;
  if (status.startedAt === null || status.startedAt === job.baseline) return null;
  return status;
}

export function spendsSelection(request: LibraryFileRequest): boolean {
  return request.kind === "delete" || request.target.scope === "tracks" || request.target.scope === "albums";
}

export function applySelectionShortcut(
  event: KeyboardEvent<HTMLElement>,
  selection: SelectionShortcutTarget,
  orderedIds: string[]
): boolean {
  if (isTextEntryTarget(event.target)) return false;
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.code === "KeyA") {
    event.preventDefault();
    selection.setMany(orderedIds, true);
    return true;
  }
  if (event.key === "Escape" && selection.selectedCount > 0) {
    selection.clear();
    return true;
  }
  return false;
}

export function rangePreviewTone(range: SelectionRange | null): CheckboxPreview {
  if (range === null) return "none";
  return range.selected ? "select" : "clear";
}

export function trackFileTarget(item: LibraryTrackItem): LibraryFileTarget {
  return {
    scope: "track",
    trackId: item.id,
    title: item.title,
    pathIds: item.libraryPath === null ? [] : [item.libraryPath.id],
  };
}

export function albumFileTarget(item: LibraryAlbumItem): LibraryFileTarget {
  return { scope: "album", albumId: item.id, name: item.name, pathIds: item.libraryPaths.map((path) => path.id) };
}

export function selectedTracksFileTarget(
  items: readonly LibraryTrackItem[],
  ids: readonly string[]
): LibraryFileTarget {
  const wanted = new Set(ids);
  const chosen = items.filter((item) => wanted.has(item.id));
  const pathIds = new Set(chosen.flatMap((item) => (item.libraryPath === null ? [] : [item.libraryPath.id])));
  return { scope: "tracks", trackIds: chosen.map((item) => item.id), pathIds: [...pathIds] };
}

export function selectedAlbumsFileTarget(
  items: readonly LibraryAlbumItem[],
  ids: readonly string[]
): LibraryFileTarget {
  const wanted = new Set(ids);
  const chosen = items.filter((item) => wanted.has(item.id));
  const pathIds = new Set(chosen.flatMap((item) => item.libraryPaths.map((path) => path.id)));
  return { scope: "albums", albumIds: chosen.map((item) => item.id), pathIds: [...pathIds] };
}
