import {
  ACTIVE_STATUSES,
  RequestStatus,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
  type RequestListItem,
} from "@api/__generated__/types";
import { DOWNLOAD_ACTIVE_STATUSES, STATUS_FILTER_MAP, StatusFilter } from "./types";

export const STATUS_ORDER: readonly RequestStatus[] = [
  RequestStatus.enum.pending_approval,
  ...[...ACTIVE_STATUSES].reverse(),
  ...RESOLVED_STATUSES,
  ...UNRESOLVED_STATUSES,
];

export function compareByStatus(a: RequestStatus, b: RequestStatus): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
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
