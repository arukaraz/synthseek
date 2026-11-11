import type { TFunction } from "i18next";

import type { ComparedCopy, TimelineBounds } from "@hooks/ui/copyComparison";
import { libraryCopyAudioSrc } from "@hooks/ui/trackPreview";
import { formatTrackDuration } from "@utils/formatters";
import { matchesTerms, searchTerms } from "@utils/search";

import type { SystemProblem } from "../../types";
import { CONTAINER_DEFAULT_OWNER_ID, MS_PER_SECOND, RULER_TICKS, WAVEFORM } from "./constants";
import type { DownloadedAlbum, DownloadedAlbumFilter, DuplicateGroup, SystemProblemCopyParams } from "./types";

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

export function describeCopies(group: DuplicateGroup, t: TFunction<"settings">): string {
  const formats = [...new Set(group.copies.map((copy) => copy.fileFormat.toUpperCase()))].join(", ");
  return [t("libraryScan.duplicates.copies", { count: group.copies.length }), formats].join(" · ");
}

export function spansLibraryPaths(group: DuplicateGroup): boolean {
  return new Set(group.copies.map((copy) => copy.libraryPath)).size > 1;
}

export function comparedCopiesOf(group: DuplicateGroup): ComparedCopy[] {
  return group.copies.map((copy) => ({
    id: copy.id,
    src: libraryCopyAudioSrc(copy.id),
    offsetSeconds: copy.offsetSeconds,
    loudnessLufs: copy.loudnessLufs,
    durationSeconds: copy.durationSeconds,
  }));
}

export function waveformPath(peaks: readonly number[]): string {
  return peaks
    .map((peak, index) => {
      const half = Math.max(WAVEFORM.MIN_BAR, (peak / WAVEFORM.PEAK_SCALE) * (WAVEFORM.HEIGHT / 2));
      return `M${index + 0.5} ${WAVEFORM.HEIGHT / 2 - half}V${WAVEFORM.HEIGHT / 2 + half}`;
    })
    .join("");
}

export function clockLabel(seconds: number): string {
  const sign = seconds < 0 ? "-" : "";
  return `${sign}${formatTrackDuration(Math.abs(seconds) * MS_PER_SECOND)}`;
}

export function rulerTicks(bounds: TimelineBounds): number[] {
  const span = bounds.end - bounds.start;
  return Array.from({ length: RULER_TICKS + 1 }, (_, index) => bounds.start + (span * index) / RULER_TICKS);
}

export function percent(fraction: number): string {
  return `${Math.min(Math.max(fraction, 0), 1) * 100}%`;
}

export function positionAtPointer(clientX: number, box: DOMRect, bounds: TimelineBounds): number {
  const fraction = box.width <= 0 ? 0 : (clientX - box.left) / box.width;
  return bounds.start + Math.min(Math.max(fraction, 0), 1) * (bounds.end - bounds.start);
}
