import { trpc } from "@utils/trpc";

const ACTIVE_REFETCH_MS = 8000;
const IDLE_REFETCH_MS = 60000;

export function useLibraryScanStatus() {
  return trpc.library.scan.status.useQuery(undefined, {
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.activeRun || query.state.data?.reclaimRunning ? ACTIVE_REFETCH_MS : IDLE_REFETCH_MS,
  });
}

export function useDuplicateGroups(enabled: boolean) {
  return trpc.library.scan.duplicateGroups.useQuery(undefined, { enabled, staleTime: 30 * 1000 });
}
