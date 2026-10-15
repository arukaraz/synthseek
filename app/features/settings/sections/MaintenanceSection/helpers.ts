import { matchesTerms, searchTerms } from "@utils/search";

import { CONTAINER_DEFAULT_OWNER_ID } from "./constants";
import type { DownloadedAlbum, DownloadedAlbumFilter, SystemProblem, SystemProblemCopyParams } from "./types";

export function downloadedAlbumsIn(
  entries: readonly DownloadedAlbum[],
  filter: DownloadedAlbumFilter
): DownloadedAlbum[] {
  return filter === "all" ? [...entries] : entries.filter((entry) => entry.source === filter);
}

export function totalBytesOf(entries: readonly DownloadedAlbum[]): number {
  return entries.reduce((total, entry) => total + entry.sizeBytes, 0);
}

export function requestLinkFor(albumExternalId: string): string {
  return `/requests?selected=${encodeURIComponent(albumExternalId)}`;
}

export function matchingRecycled<T extends { relativePath: string }>(
  entries: readonly T[] | undefined,
  search: string
): readonly T[] | undefined {
  const terms = searchTerms(search);
  if (entries === undefined || terms.length === 0) return entries;
  return entries.filter((entry) => matchesTerms(terms, [entry.relativePath]));
}

export function truncateMiddle(value: string, max: number): string {
  if (value.length <= max) return value;
  const tail = Math.floor((max - 1) / 2);
  const head = max - 1 - tail;
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}

export function problemKey(problem: SystemProblem): string {
  return JSON.stringify(problem);
}

function ownerIdOrDefault(value: string): string {
  return value.length > 0 ? value : CONTAINER_DEFAULT_OWNER_ID;
}

export function problemCopyParams(problem: SystemProblem): SystemProblemCopyParams {
  switch (problem.kind) {
    case "downloads_unwritable":
      return { path: problem.path, puid: ownerIdOrDefault(problem.puid), pgid: ownerIdOrDefault(problem.pgid) };
    case "library_inaccessible":
    case "library_read_only":
      return {
        label: problem.label,
        path: problem.path,
        puid: ownerIdOrDefault(problem.puid),
        pgid: ownerIdOrDefault(problem.pgid),
      };
    case "catalog_unreachable":
      return {};
    case "config_value_ignored":
      return { name: problem.name };
  }
}
