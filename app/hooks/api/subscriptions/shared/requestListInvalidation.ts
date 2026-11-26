import type { QueryClient } from "@tanstack/react-query";
import type { trpc } from "@utils/trpc";

import { trimRequestListToFirstPage } from "../../queries/requests/requestListCache";
import { throttledInvalidation } from "./throttledInvalidation";

const REQUEST_LIST_REFRESH_INTERVAL_MS = 5000;

export interface RequestListRefreshDeps {
  utils: ReturnType<typeof trpc.useUtils>;
  queryClient: QueryClient;
}

const requestListRows = throttledInvalidation<RequestListRefreshDeps>(({ utils, queryClient }) => {
  trimRequestListToFirstPage(queryClient);
  void utils.requests.list.invalidate();
}, REQUEST_LIST_REFRESH_INTERVAL_MS);

const requestListCompanions = throttledInvalidation<RequestListRefreshDeps>(({ utils }) => {
  void utils.requests.summary.invalidate();
  void utils.requests.getRecentTracks.invalidate();
  void utils.requests.getDetail.invalidate();
}, REQUEST_LIST_REFRESH_INTERVAL_MS);

export function invalidateRequestList(deps: RequestListRefreshDeps): void {
  requestListRows.run(deps);
  requestListCompanions.run(deps);
}

export function invalidateRequestListNow(deps: RequestListRefreshDeps): void {
  requestListRows.runNow(deps);
  requestListCompanions.runNow(deps);
}

export function holdRequestListRefresh(): () => void {
  const releaseRows = requestListRows.hold();
  const releaseCompanions = requestListCompanions.hold();
  return () => {
    releaseRows();
    releaseCompanions();
  };
}

export const holdRequestListRows = requestListRows.hold;
