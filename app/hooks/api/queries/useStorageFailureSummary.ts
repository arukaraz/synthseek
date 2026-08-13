import { trpc } from "@utils/trpc";

const REFETCH_INTERVAL_MS = 60 * 1000;

export function useStorageFailureSummary() {
  return trpc.requests.getStorageFailureSummary.useQuery(undefined, {
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
