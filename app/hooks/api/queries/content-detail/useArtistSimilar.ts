import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistSimilarArgs {
  artistName: string;
  enabled?: boolean;
}

export function useArtistSimilar({ artistName, enabled = true }: UseArtistSimilarArgs) {
  return trpc.contentDetail.artistSimilar.useQuery(
    { artistName },
    {
      enabled: enabled && !!artistName,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
