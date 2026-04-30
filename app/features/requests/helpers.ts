import type { RequestWithTracks } from "@api/__generated__/types";
import { STATUS_FILTER_MAP, StatusFilter } from "./types";

export function filterRequestsByStatus(
  items: RequestWithTracks[] | undefined,
  statusFilter: StatusFilter
): RequestWithTracks[] {
  const all = items ?? [];
  const allowed = STATUS_FILTER_MAP[statusFilter];
  if (allowed === null) return all;
  return all.filter((item) => (allowed as readonly string[]).includes(item.status));
}
