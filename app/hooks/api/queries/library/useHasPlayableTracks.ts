import { trpc } from "@utils/trpc";

import { LIBRARY_GC_TIME, LIBRARY_STALE_TIME } from "./constants";
import type { PlayableTracksTarget } from "./types";

export function useHasPlayableTracks(target: PlayableTracksTarget) {
  return trpc.library.hasPlayableTracks.useQuery(target, {
    staleTime: LIBRARY_STALE_TIME,
    gcTime: LIBRARY_GC_TIME,
  });
}
