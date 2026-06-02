import {
  ACTIVE_STATUSES,
  RESOLVED_STATUSES,
  UNRESOLVED_STATUSES,
  type RequestStatus,
  type RequestWithTracks,
} from "@api/__generated__/types";
import { STATUS_FILTER_MAP, StatusFilter } from "./types";

export const STATUS_ORDER: readonly RequestStatus[] = [
  ...[...ACTIVE_STATUSES].reverse(),
  ...RESOLVED_STATUSES,
  ...UNRESOLVED_STATUSES,
];

export function compareByStatus(a: RequestStatus, b: RequestStatus): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
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
