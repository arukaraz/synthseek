import { trpc } from "@utils/trpc";

export function useMaintenanceCounts(enabled: boolean) {
  return trpc.maintenance.counts.useQuery(undefined, { enabled });
}
