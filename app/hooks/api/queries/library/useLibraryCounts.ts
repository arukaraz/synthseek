import { trpc } from "@utils/trpc";

import { LIBRARY_COUNTS_STALE_TIME, LIBRARY_GC_TIME } from "./constants";

export function useLibraryCounts() {
  return trpc.library.getCounts.useQuery(undefined, {
    staleTime: LIBRARY_COUNTS_STALE_TIME,
    gcTime: LIBRARY_GC_TIME,
  });
}
