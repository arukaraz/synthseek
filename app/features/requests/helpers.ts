import {
  ACTIVE_STATUSES,
  ContentType,
  DownloadSourceKey,
  RequestStatus,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
  type RequestListItem,
} from "@api/__generated__/types";
import { collectionFilename } from "@utils/filename";
import {
  DOWNLOAD_ACTIVE_STATUSES,
  SOURCE_FILTERS,
  STATUS_FILTER_MATCH,
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
  RequestStatus.enum.pending_import_review,
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
  return collectionFilename(name, "jspf");
}

export function filterRequestsByStatus(
  items: RequestListItem[] | undefined,
  statusFilter: StatusFilter
): RequestListItem[] {
  const all = items ?? [];
  if (statusFilter === "all") return all;
  const { statuses, trackCount, losslessPartial } = STATUS_FILTER_MATCH[statusFilter];
  return all.filter(
    (item) =>
      statuses.includes(item.status) ||
      (trackCount !== null && item.trackCounts[trackCount] > 0) ||
      (losslessPartial && isLosslessPartial(item))
  );
}

function isLosslessPartial(item: RequestListItem): boolean {
  return (
    item.status === RequestStatus.enum.partially_complete &&
    item.trackCounts.failed === 0 &&
    item.trackCounts.cancelled === 0
  );
}
