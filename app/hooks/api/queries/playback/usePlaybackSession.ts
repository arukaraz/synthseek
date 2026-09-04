import { trpc } from "@utils/trpc";

export function usePlaybackSession(enabled: boolean) {
  return trpc.playback.getSession.useQuery(undefined, {
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
