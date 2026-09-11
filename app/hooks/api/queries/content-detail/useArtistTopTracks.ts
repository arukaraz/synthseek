import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistTopTracksArgs {
  catalogArtistId: string;
  enabled?: boolean;
}

export function useArtistTopTracks({ catalogArtistId, enabled = true }: UseArtistTopTracksArgs) {
  return trpc.contentDetail.artistTopTracks.useQuery(
    { catalogArtistId },
    {
      enabled: enabled && !!catalogArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
