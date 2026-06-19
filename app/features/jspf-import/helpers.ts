import i18n from "@locale";
import { generateUuid } from "@utils/uuid";

import { MAX_FILE_BYTES } from "./constants";
import type { CollectionCoverage, ImportFormat, ImportPreviewResult, TrackCoverage } from "./types";

export function formatFromName(name: string): ImportFormat | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jspf")) return "jspf";
  if (lower.endsWith(".xspf")) return "xspf";
  if (lower.endsWith(".csv")) return "csv";
  return null;
}

export function formatFromUrl(url: string): ImportFormat | null {
  try {
    return formatFromName(new URL(url).pathname);
  } catch {
    return null;
  }
}

export function filenameFromUrl(url: string): string {
  try {
    const base = new URL(url).pathname.split("/").pop();
    return base && base.length > 0 ? base : "playlist";
  } catch {
    return "playlist";
  }
}

export function generateJobId(): string {
  return generateUuid();
}

export async function readFileAsText(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(i18n.t("library:jspfImport.errors.fileTooLarge"));
  }
  return file.text();
}

export async function fetchTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(i18n.t("library:jspfImport.errors.fetchFailed", { status: response.status }));
  }
  return response.text();
}

export function coverageLabel(collection: CollectionCoverage): string {
  const parts = [
    i18n.t("library:jspfImport.coverage.matched", { matched: collection.matched, total: collection.total }),
  ];
  if (collection.alreadyInLibrary > 0) {
    parts.push(i18n.t("library:jspfImport.coverage.alreadyInLibrary", { count: collection.alreadyInLibrary }));
  }
  if (collection.unmatched > 0) {
    parts.push(i18n.t("library:jspfImport.coverage.unmatched", { count: collection.unmatched }));
  }
  return parts.join(" · ");
}

export function totalMatched(preview: { collections: CollectionCoverage[] }): number {
  return preview.collections.reduce((sum, collection) => sum + collection.matched, 0);
}

export function trackKey(collectionIndex: number, trackIndex: number): string {
  return `${collectionIndex}:${trackIndex}`;
}

export function matchConfidence(method: string): "exact" | "approx" | null {
  if (method === "unmatched") return null;
  if (method === "smart-search") return "approx";
  return "exact";
}

function statusRank(track: TrackCoverage): number {
  if (!track.matched) return 0;
  if (matchConfidence(track.method) === "approx") return 1;
  if (track.alreadyInLibrary) return 3;
  return 2;
}

export function orderedTrackEntries(tracks: TrackCoverage[], search: string): Array<[number, TrackCoverage]> {
  const query = search.trim().toLowerCase();
  const entries: Array<[number, TrackCoverage]> = tracks.map((track, index) => [index, track]);
  const filtered = query
    ? entries.filter(([, track]) => `${track.title} ${track.artist}`.toLowerCase().includes(query))
    : entries;
  return filtered.sort(([, a], [, b]) => statusRank(a) - statusRank(b));
}

export function buildSelectionArray(preview: ImportPreviewResult, selected: Set<string>): number[][] {
  return preview.collections.map((collection, collectionIndex) =>
    collection.tracks
      .map((_, trackIndex) => trackIndex)
      .filter((trackIndex) => selected.has(trackKey(collectionIndex, trackIndex)))
  );
}

export function newDownloadsCount(preview: ImportPreviewResult, selected: Set<string>): number {
  let count = 0;
  preview.collections.forEach((collection, collectionIndex) => {
    collection.tracks.forEach((track, trackIndex) => {
      if (track.matched && !track.alreadyInLibrary && selected.has(trackKey(collectionIndex, trackIndex))) count++;
    });
  });
  return count;
}

export function selectedCount(preview: ImportPreviewResult, selected: Set<string>): number {
  let count = 0;
  preview.collections.forEach((collection, collectionIndex) => {
    collection.tracks.forEach((_, trackIndex) => {
      if (selected.has(trackKey(collectionIndex, trackIndex))) count++;
    });
  });
  return count;
}

export function selectedDurationMs(preview: ImportPreviewResult, selected: Set<string>): number {
  let ms = 0;
  preview.collections.forEach((collection, collectionIndex) => {
    collection.tracks.forEach((track, trackIndex) => {
      if (selected.has(trackKey(collectionIndex, trackIndex))) ms += track.durationMs;
    });
  });
  return ms;
}

export function formatDurationMs(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return i18n.t("library:jspfImport.duration.minutes", { count: totalMinutes });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return i18n.t("library:jspfImport.duration.hoursMinutes", { hours, minutes });
}
