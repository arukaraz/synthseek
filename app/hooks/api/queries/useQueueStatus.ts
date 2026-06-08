import { trpc } from "@utils/trpc";

export function useQueueStatus() {
  return trpc.requests.getQueueState.useQuery(undefined, {
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}
