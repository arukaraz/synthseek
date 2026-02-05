import { trpc } from "@utils/trpc";

export function useLibrarySummary() {
  return trpc.requests.getLibrarySummary.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
