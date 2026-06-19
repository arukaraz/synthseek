import { ACTIVE_STATUSES, RESOLVED_STATUSES, UNRESOLVED_STATUSES, type RequestStatus } from "@api/__generated__/types";

import type { TracklistSortKey } from "./types";

export const DEFAULT_SORT_KEY: TracklistSortKey = "status";

export const SORT_KEYS: readonly TracklistSortKey[] = ["name", "status", "length"];

export const STATUS_SORT_ORDER: readonly RequestStatus[] = [
  ...UNRESOLVED_STATUSES,
  ...ACTIVE_STATUSES,
  ...RESOLVED_STATUSES,
];
