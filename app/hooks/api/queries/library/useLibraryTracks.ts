import { trpc } from "@utils/trpc";
import { keepPreviousData } from "@tanstack/react-query";

import { LIBRARY_GC_TIME, LIBRARY_STALE_TIME } from "./constants";
import type { LibraryTracksInput } from "./types";

export function useLibraryTracks(input: LibraryTracksInput, enabled: boolean) {
  return trpc.library.getTracks.useQuery(input, {
    enabled,
    placeholderData: keepPreviousData,
    staleTime: LIBRARY_STALE_TIME,
    gcTime: LIBRARY_GC_TIME,
  });
}
