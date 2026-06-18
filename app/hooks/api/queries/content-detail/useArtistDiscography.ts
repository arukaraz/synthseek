import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistDiscographyArgs {
  deezerArtistId: string;
  enabled?: boolean;
}

export function useArtistDiscography({ deezerArtistId, enabled = true }: UseArtistDiscographyArgs) {
  return trpc.contentDetail.artistDiscography.useQuery(
    { deezerArtistId },
    {
      enabled: enabled && !!deezerArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
