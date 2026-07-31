import {
  ACTIVE_STATUSES,
  ContentType,
  RequestStatus,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
  type RequestWithTracks,
} from "@api/__generated__/types";
import { DOWNLOAD_ACTIVE_STATUSES, STATUS_FILTER_MAP, StatusFilter, type FlatTrackRow } from "./types";

export const STATUS_ORDER: readonly RequestStatus[] = [
  RequestStatus.enum.pending_approval,
  ...[...ACTIVE_STATUSES].reverse(),
  ...RESOLVED_STATUSES,
  ...UNRESOLVED_STATUSES,
];

export function compareByStatus(a: RequestStatus, b: RequestStatus): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
}

export function flattenRequestsToTrackRows(items: RequestWithTracks[]): FlatTrackRow[] {
  return items.flatMap((item) =>
    item.tracks.map((track) => ({
      ...track,
      parent: {
        id: item.id,
        name: item.name,
        artist: item.artist,
        album_art: item.album_art,
        contentType: item.contentType,
        requestedBy: item.requestedBy,
        status: item.status,
      },
    }))
  );
}

export function hasActiveDownload(items: RequestWithTracks[] | undefined): boolean {
  return (items ?? []).some(
    (item) =>
      (item.contentType === ContentType.enum.album || item.contentType === ContentType.enum.playlist) &&
      DOWNLOAD_ACTIVE_STATUSES.includes(item.status)
  );
}

export function exportFilename(name: string): string {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "playlist";
  return `${slug}.jspf`;
}

export function filterRequestsByStatus(
  items: RequestWithTracks[] | undefined,
  statusFilter: StatusFilter
): RequestWithTracks[] {
  const all = items ?? [];
  const allowed = STATUS_FILTER_MAP[statusFilter];
  if (allowed === null) return all;
  return all.filter((item) => (allowed as readonly string[]).includes(item.status));
}
