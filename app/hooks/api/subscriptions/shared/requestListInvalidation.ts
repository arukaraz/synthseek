import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";
import { throttledInvalidation } from "./throttledInvalidation";

const REQUEST_LIST_REFRESH_INTERVAL_MS = 5000;

const requestList = throttledInvalidation((utils) => {
  invalidateRequestListQueries(utils);
  void utils.requests.getRecentTracks.invalidate();
  void utils.requests.getDetail.invalidate();
}, REQUEST_LIST_REFRESH_INTERVAL_MS);

export const invalidateRequestList = requestList.run;

export const invalidateRequestListNow = requestList.runNow;

export const holdRequestListRefresh = requestList.hold;
