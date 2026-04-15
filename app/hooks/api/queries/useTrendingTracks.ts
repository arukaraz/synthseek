import { trpc } from "@utils/trpc";

export function useTrendingTracks() {
  return trpc.music.getTrendingTracks.useQuery(undefined, {
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    trpc: {
      context: {
        skipBatch: true,
      },
    },
  });
}
