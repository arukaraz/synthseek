import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistTopTracksArgs {
  deezerArtistId: string;
  enabled?: boolean;
}

export function useArtistTopTracks({ deezerArtistId, enabled = true }: UseArtistTopTracksArgs) {
  return trpc.contentDetail.artistTopTracks.useQuery(
    { deezerArtistId },
    {
      enabled: enabled && !!deezerArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
