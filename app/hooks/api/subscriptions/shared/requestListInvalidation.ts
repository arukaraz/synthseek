import { throttledInvalidation } from "./throttledInvalidation";

const requestList = throttledInvalidation((utils) => {
  void utils.requests.getAll.invalidate();
  void utils.requests.getRecentTracks.invalidate();
  void utils.requests.getDetail.invalidate();
});

export const invalidateRequestList = requestList.run;

export const invalidateRequestListNow = requestList.runNow;
