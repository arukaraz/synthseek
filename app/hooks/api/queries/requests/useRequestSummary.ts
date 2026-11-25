import { trpc } from "@utils/trpc";

import { REQUEST_LIST_STALE_TIME } from "./constants";

export function useRequestSummary() {
  return trpc.requests.summary.useQuery(undefined, { staleTime: REQUEST_LIST_STALE_TIME, refetchOnMount: "always" });
}
