import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistIdentityArgs {
  catalogArtistId: string;
  artistName: string;
  enabled?: boolean;
}

export function useArtistIdentity({ catalogArtistId, artistName, enabled = true }: UseArtistIdentityArgs) {
  return trpc.contentDetail.artistIdentity.useQuery(
    { catalogArtistId, artistName },
    {
      enabled: enabled && !!catalogArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
