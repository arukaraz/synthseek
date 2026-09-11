import { trpc } from "@utils/trpc";

export function useOrphanedCompanions(enabled: boolean) {
  return trpc.maintenance.orphanedCompanions.useQuery(undefined, {
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrphanSweepStatus(enabled: boolean) {
  return trpc.maintenance.orphanSweepStatus.useQuery(undefined, {
    enabled,
    refetchInterval: (query) => (query.state.data?.running ? 1000 : false),
  });
}
