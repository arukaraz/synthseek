import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseAlbumDetailArgs {
  catalogAlbumId: string;
  enabled?: boolean;
}

export function useAlbumDetail({ catalogAlbumId, enabled = true }: UseAlbumDetailArgs) {
  return trpc.contentDetail.albumDetail.useQuery(
    { catalogAlbumId },
    {
      enabled: enabled && !!catalogAlbumId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
