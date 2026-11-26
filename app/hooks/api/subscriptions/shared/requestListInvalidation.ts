import type { QueryClient } from "@tanstack/react-query";
import type { trpc } from "@utils/trpc";

import { invalidateRequestListQueries, trimRequestListToFirstPage } from "../../queries/requests/requestListCache";
import { throttledInvalidation } from "./throttledInvalidation";

const REQUEST_LIST_REFRESH_INTERVAL_MS = 5000;

export interface RequestListRefreshDeps {
  utils: ReturnType<typeof trpc.useUtils>;
  queryClient: QueryClient;
}

const requestList = throttledInvalidation<RequestListRefreshDeps>(({ utils, queryClient }) => {
  trimRequestListToFirstPage(queryClient);
  invalidateRequestListQueries(utils);
  void utils.requests.getRecentTracks.invalidate();
  void utils.requests.getDetail.invalidate();
}, REQUEST_LIST_REFRESH_INTERVAL_MS);

export const invalidateRequestList = requestList.run;

export const invalidateRequestListNow = requestList.runNow;

export const holdRequestListRefresh = requestList.hold;
