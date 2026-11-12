import { trpc } from "@utils/trpc";

import { LISTENING_NOW_REFETCH_MS } from "./constants";

export function useListeningNow() {
  return trpc.playback.listeningNow.useQuery(undefined, {
    staleTime: LISTENING_NOW_REFETCH_MS,
    refetchInterval: LISTENING_NOW_REFETCH_MS,
  });
}
