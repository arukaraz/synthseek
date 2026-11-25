import {
  ACTIVE_STATUSES,
  DownloadSourceKey,
  RequestStatus,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
} from "@api/__generated__/types";
import { collectionFilename } from "@utils/filename";
import { SOURCE_FILTERS, STATUS_FILTERS, type SourceFilter, type StatusFilter } from "./types";

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

export function exportFilename(name: string): string {
  return collectionFilename(name, "jspf");
}
