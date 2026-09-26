import type { ParseKeys } from "i18next";

import i18n from "@locale";
import { formatDate, formatRelativeTime, formatShortDate, formatTimestamp } from "@utils/formatters";
import { matchesTerms, searchTerms } from "@utils/search";

import { FILTER_ITEM_TYPE, FILTER_VALUES, RELATIVE_SYNC_WINDOW_MS } from "./constants";
import type {
  AutoWatchState,
  LibraryFilter,
  LibraryItem,
  LibraryItemType,
  LibrarySort,
  ToggleAggregateState,
  WatchCapabilities,
} from "./types";

export function matchesFilter(item: LibraryItem, filter: LibraryFilter): boolean {
  if (filter === "all") return true;
  return item.type === FILTER_ITEM_TYPE[filter];
}

export function filterValuesFor(itemTypes: ReadonlyArray<LibraryItemType>): LibraryFilter[] {
  return FILTER_VALUES.filter((value) => value === "all" || itemTypes.includes(FILTER_ITEM_TYPE[value]));
}

export function watchedKeys(watch: WatchCapabilities): Array<keyof AutoWatchState> {
  const keys: Array<keyof AutoWatchState> = [];
  if (watch.playlists) keys.push("playlists");
  if (watch.savedAlbums) keys.push("savedAlbums");
  return keys;
}

export function matchesSearch(item: LibraryItem, q: string): boolean {
  return matchesTerms(searchTerms(q), [item.name, item.subtitle]);
}

const TYPE_RANK: Record<LibraryItem["type"], number> = { liked: 0, playlist: 1, album: 2 };

export function compareItems(a: LibraryItem, b: LibraryItem, sort: LibrarySort, dir: "asc" | "desc"): number {
  const direction = dir === "asc" ? 1 : -1;
  switch (sort) {
    case "name":
      return a.name.localeCompare(b.name) * direction;
    case "type":
      return (TYPE_RANK[a.type] - TYPE_RANK[b.type]) * direction;
    case "tracks":
      return (a.totalTracks - b.totalTracks) * direction;
    case "imported":
      return (Number(a.imported) - Number(b.imported)) * direction;
    case "lastSync": {
      const aT = a.lastSyncedAt ? new Date(a.lastSyncedAt).getTime() : 0;
      const bT = b.lastSyncedAt ? new Date(b.lastSyncedAt).getTime() : 0;
      return (aT - bT) * direction;
    }
    case "syncStatus":
      return (Number(a.syncEnabled) - Number(b.syncEnabled)) * direction;
  }
}

export function formatLastSync(value: Date | string | null): string {
  if (!value) return i18n.t("library:librarySource.detail.lastSyncNever");
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (elapsed >= 0 && elapsed < RELATIVE_SYNC_WINDOW_MS) return formatRelativeTime(date);
  return formatShortDate(date);
}

export function formatLastSyncFull(value: Date | string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return `${formatDate(date)} ${formatTimestamp(date)}`;
}

export function aggregateToggleState(values: ReadonlyArray<boolean>): ToggleAggregateState {
  if (values.length === 0) return "off";
  const allOn = values.every(Boolean);
  if (allOn) return "on";
  const allOff = values.every((value) => !value);
  if (allOff) return "off";
  return "mixed";
}

export function resolveToggleTarget(state: ToggleAggregateState): boolean {
  return state !== "on";
}

export function libraryTypeTone(type: LibraryItem["type"]): "playlist" | "album" | "liked" {
  return type;
}

export function libraryTypeLowerLabelKey(type: LibraryItem["type"]): ParseKeys<"library"> {
  if (type === "playlist") return "librarySource.type.playlistLower";
  if (type === "album") return "librarySource.type.albumLower";
  return "librarySource.type.likedLower";
}
