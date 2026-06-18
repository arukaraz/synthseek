import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistIdentityArgs {
  deezerArtistId: string;
  artistName: string;
  enabled?: boolean;
}

export function useArtistIdentity({ deezerArtistId, artistName, enabled = true }: UseArtistIdentityArgs) {
  return trpc.contentDetail.artistIdentity.useQuery(
    { deezerArtistId, artistName },
    {
      enabled: enabled && !!deezerArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
