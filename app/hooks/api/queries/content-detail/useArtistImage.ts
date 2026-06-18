import { trpc } from "@utils/trpc";

import { ARTIST_IMAGE_STALE_TIME, CONTENT_DETAIL_GC_TIME } from "./constants";

export function useArtistImage(name: string, enabled = true) {
  const query = trpc.contentDetail.resolveArtist.useQuery(
    { name },
    {
      enabled: enabled && !!name,
      staleTime: ARTIST_IMAGE_STALE_TIME,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );

  return { image: query.data?.image ?? null, isLoading: query.isLoading };
}
