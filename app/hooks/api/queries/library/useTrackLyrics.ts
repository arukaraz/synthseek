import { trpc } from "@utils/trpc";

import { LIBRARY_GC_TIME, LIBRARY_STALE_TIME } from "./constants";

export function useTrackLyrics(trackId: string | null) {
  return trpc.library.getLyrics.useQuery(
    { trackId: trackId ?? "" },
    { enabled: trackId !== null, staleTime: LIBRARY_STALE_TIME, gcTime: LIBRARY_GC_TIME }
  );
}
