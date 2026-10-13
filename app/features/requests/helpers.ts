import {
  ACTIVE_STATUSES,
  ContentType,
  DownloadSourceKey,
  RequestStatus,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
  type RequestListItem,
} from "@api/__generated__/types";
import {
  DOWNLOAD_ACTIVE_STATUSES,
  SOURCE_FILTERS,
  STATUS_FILTER_MAP,
  STATUS_FILTERS,
  type SourceFilter,
  StatusFilter,
} from "./types";

export function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_FILTERS.some((filter) => filter === value);
}

export function isSourceFilter(value: string): value is SourceFilter {
  return SOURCE_FILTERS.some((filter) => filter === value);
}

export function sourceFilterKeys(
  enabled: Partial<Record<DownloadSourceKey, { enabled: boolean }>> | undefined,
  selected: SourceFilter
): DownloadSourceKey[] {
  return DownloadSourceKey.options.filter((key) => enabled?.[key]?.enabled === true || key === selected);
}

export const STATUS_ORDER: readonly RequestStatus[] = [
  RequestStatus.enum.pending_approval,
  ...[...ACTIVE_STATUSES].reverse(),
  ...RESOLVED_STATUSES,
  ...UNRESOLVED_STATUSES,
];

export function compareByStatus(a: RequestStatus, b: RequestStatus): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
}

export function compareTypeFirst(a: RequestListItem, b: RequestListItem, first: ContentType): number {
  return Number(a.contentType !== first) - Number(b.contentType !== first);
}

export function hasActiveDownload(items: RequestListItem[] | undefined): boolean {
  return (items ?? []).some((item) => DOWNLOAD_ACTIVE_STATUSES.includes(item.status));
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
  items: RequestListItem[] | undefined,
  statusFilter: StatusFilter
): RequestListItem[] {
  const all = items ?? [];
  const allowed = STATUS_FILTER_MAP[statusFilter];
  if (allowed === null) return all;
  return all.filter((item) => (allowed as readonly string[]).includes(item.status));
}
