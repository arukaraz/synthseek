import { trpc } from "@utils/trpc";

export function useActivePlayback() {
  return trpc.playback.activeState.useQuery(undefined, { staleTime: 0, gcTime: 0, refetchOnWindowFocus: false });
}
