import { trpc } from "@utils/trpc";

export function useMostPlayedCandidates(enabled: boolean) {
  return trpc.artistFollow.mostPlayed.useQuery(undefined, { enabled, staleTime: 0, gcTime: 0 });
}
