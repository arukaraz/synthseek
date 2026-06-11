import {
  ACTIVE_STATUSES,
  ContentType,
  RequestStatus,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
  type RequestWithTracks,
} from "@api/__generated__/types";
import {
  DEFAULT_PER_PAGE,
  DOWNLOAD_ACTIVE_STATUSES,
  PER_PAGE_OPTIONS,
  STATUS_FILTER_MAP,
  StatusFilter,
  type SourceOption,
} from "./types";

export const STATUS_ORDER: readonly RequestStatus[] = [
  ...[...ACTIVE_STATUSES].reverse(),
  ...RESOLVED_STATUSES,
  ...UNRESOLVED_STATUSES,
];

export function compareByStatus(a: RequestStatus, b: RequestStatus): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
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

export function deriveSourceOptions(items: RequestWithTracks[] | undefined): SourceOption[] {
  const byId = new Map<string, SourceOption>();
  for (const item of items ?? []) {
    if (item.contentType !== ContentType.enum.album && item.contentType !== ContentType.enum.playlist) continue;
    if (!byId.has(item.id)) {
      byId.set(item.id, { id: item.id, name: item.name, contentType: item.contentType });
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function parseSourceIds(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

export function serializeSourceIds(ids: string[]): string | null {
  return ids.length > 0 ? ids.join(",") : null;
}

export function toggleSourceId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id];
}

export function parsePage(raw: string | undefined): number {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

export function parsePerPage(raw: string | undefined): number {
  const value = Number(raw);
  return PER_PAGE_OPTIONS.some((option) => option === value) ? value : DEFAULT_PER_PAGE;
}
