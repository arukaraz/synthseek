import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistSimilarArgs {
  artistName: string;
  catalogArtistId: string;
  enabled?: boolean;
}

export function useArtistSimilar({ artistName, catalogArtistId, enabled = true }: UseArtistSimilarArgs) {
  return trpc.contentDetail.artistSimilar.useQuery(
    { artistName, catalogArtistId: catalogArtistId || undefined },
    {
      enabled: enabled && !!artistName,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
