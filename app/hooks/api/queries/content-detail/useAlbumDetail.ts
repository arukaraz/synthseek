import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseAlbumDetailArgs {
  deezerAlbumId: string;
  enabled?: boolean;
}

export function useAlbumDetail({ deezerAlbumId, enabled = true }: UseAlbumDetailArgs) {
  return trpc.contentDetail.albumDetail.useQuery(
    { deezerAlbumId },
    {
      enabled: enabled && !!deezerAlbumId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
