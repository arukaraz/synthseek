import { formatTimestamp } from "@utils/formatters";

import type { LibraryFilter, LibraryItem, LibrarySort } from "./types";

export function matchesFilter(item: LibraryItem, filter: LibraryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "playlists") return item.type === "playlist";
  if (filter === "albums") return item.type === "album";
  return item.type === "liked";
}

export function matchesSearch(item: LibraryItem, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (item.name.toLowerCase().includes(needle)) return true;
  if (item.subtitle && item.subtitle.toLowerCase().includes(needle)) return true;
  return false;
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
  if (!value) return "—";
  return formatTimestamp(new Date(value));
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : (plural ?? `${singular}s`)}`;
}

export function libraryTypeTone(type: LibraryItem["type"]): "playlist" | "album" | "liked" {
  return type;
}

export function libraryTypeLabel(type: LibraryItem["type"]): string {
  if (type === "playlist") return "Playlist";
  if (type === "album") return "Album";
  return "Liked";
}

export function libraryTypeLowerLabel(type: LibraryItem["type"]): string {
  if (type === "playlist") return "playlist";
  if (type === "album") return "album";
  return "liked songs";
}
