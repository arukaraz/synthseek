import { trpc } from "@utils/trpc";

export function useOrphanedCompanions(enabled: boolean) {
  return trpc.maintenance.orphanedCompanions.useQuery(undefined, {
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
