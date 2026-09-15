import { trpc } from "@utils/trpc";

export function useOrphanCount(enabled: boolean) {
  return trpc.maintenance.orphanCount.useQuery(undefined, {
    enabled,
    refetchInterval: (query) => (query.state.data?.counting ? 1000 : false),
  });
}

export function useOrphanSweepStatus(enabled: boolean) {
  return trpc.maintenance.orphanSweepStatus.useQuery(undefined, {
    enabled,
    refetchInterval: (query) => (query.state.data?.running ? 1000 : false),
  });
}
