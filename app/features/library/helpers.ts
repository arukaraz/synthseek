import { RequestFormat, RequestStatus } from "@api/__generated__/types";
import type {
  LibraryAlbumItem,
  LibraryAlbumsQuery,
  LibraryArtistsQuery,
  LibraryCountsResult,
  LibraryFacetValue,
  LibraryFilesStatus,
  LibraryPlaylistsQuery,
  LibraryTrackItem,
  LibraryTracksInput,
  LibraryTracksQuery,
} from "@hooks/api/queries/library/types";
import type { CheckboxPreview } from "@components/ui/Checkbox";
import type { SelectionRange } from "@hooks/ui/useSelection";
import { isTextEntryTarget } from "@utils/text-entry";
import type { KeyboardEvent } from "react";

import {
  EVERYONE_FILTER_KEY,
  FILTER_ON,
  GRID_ITEMS_SELECTOR,
  SHELF_COLLAPSE_AFTER_PX,
  SHELF_COLLAPSE_MIN_OVERFLOW_PX,
  VIEW_CONFIG,
} from "./constants";
import type {
  AlbumSort,
  ArtistSort,
  PlaylistSort,
  TrackSort,
  FacetSearchState,
  FilterParamMap,
  LibraryFileJob,
  LibraryFileRequest,
  LibraryDensity,
  LibraryFileTarget,
  LibraryView,
  LibraryViewShell,
  SelectionShortcutTarget,
  SortDirection,
  SortOptionDef,
  ViewConfig,
  CardChrome,
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
  q: string | undefined;
  sort: string;
  direction: SortDirection | undefined;
  filters: FilterParamMap;
  facetSearch: FacetSearchState;
}

export function buildTracksInput(args: InputBaseArgs): LibraryTracksQuery {
  const { filters } = args;
  return {
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

export function buildAlbumsInput(args: InputBaseArgs): LibraryAlbumsQuery {
  const { filters } = args;
  return {
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

export function buildArtistsInput(args: InputBaseArgs): LibraryArtistsQuery {
  const { filters } = args;
  return {
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

export function buildPlaylistsInput(args: InputBaseArgs): LibraryPlaylistsQuery {
  const { filters } = args;
  return {
    q: args.q,
    sort: resolvePlaylistSort(args.sort),
    direction: args.direction,
    facetSearch: buildFacetSearch(args.facetSearch),
    filters: {
      origin: emptyToUndefined(filters.origin ?? []),
      owner: emptyToUndefined(filters.owner ?? []),
      status: emptyToUndefined(toStatusValues(filters.status ?? [])),
    },
    everyone: everyoneScopeActive(filters) ? true : undefined,
  };
}

export function everyoneScopeActive(filters: FilterParamMap): boolean {
  return (filters[EVERYONE_FILTER_KEY] ?? []).includes(FILTER_ON);
}

function pickSort<TSort extends string>(
  sort: string,
  config: { sortOptions: readonly SortOptionDef<TSort>[]; defaultSort: TSort }
): TSort {
  return config.sortOptions.find((option) => option.value === sort)?.value ?? config.defaultSort;
}

function resolveTrackSort(sort: string): TrackSort {
  return pickSort(sort, VIEW_CONFIG.tracks);
}

function resolveAlbumSort(sort: string): AlbumSort {
  return pickSort(sort, VIEW_CONFIG.albums);
}

function resolveArtistSort(sort: string): ArtistSort {
  return pickSort(sort, VIEW_CONFIG.artists);
}

function resolvePlaylistSort(sort: string): PlaylistSort {
  return pickSort(sort, VIEW_CONFIG.playlists);
}

export function topFacetValues(values: LibraryFacetValue[], topN: number, hasSearch: boolean): LibraryFacetValue[] {
  if (hasSearch) return values;
  return values.slice(0, topN);
}

export function isLibraryView(value: string | undefined): value is LibraryView {
  return value === "tracks" || value === "albums" || value === "artists" || value === "playlists";
}

export function scrollChildToTop(root: HTMLElement, index: number): boolean {
  const child = root.querySelector(GRID_ITEMS_SELECTOR)?.children.item(index);
  if (!child) return false;
  root.scrollTop += child.getBoundingClientRect().top - root.getBoundingClientRect().top;
  return true;
}

export function shellCardChrome(shell: LibraryViewShell): CardChrome {
  if (!shell.phone) return "overlay";
  return shell.density === "compact" ? "bare" : "corner";
}

export function shellListsRows(shell: LibraryViewShell): boolean {
  return shell.phone && shell.density === "list";
}

export function isLibraryDensity(value: string): value is LibraryDensity {
  return value === "comfortable" || value === "compact" || value === "list";
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

export function nextShelfCollapsed(collapsed: boolean, scrollTop: number, overflow: number): boolean {
  if (scrollTop <= 0) return false;
  if (collapsed) return true;
  return scrollTop > SHELF_COLLAPSE_AFTER_PX && overflow > SHELF_COLLAPSE_MIN_OVERFLOW_PX;
}
