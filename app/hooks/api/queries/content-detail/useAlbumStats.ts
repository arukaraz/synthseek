import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseAlbumStatsArgs {
  artistName: string;
  albumName: string;
  catalogAlbumId: string;
  enabled?: boolean;
}

export function useAlbumStats({ artistName, albumName, catalogAlbumId, enabled = true }: UseAlbumStatsArgs) {
  return trpc.contentDetail.albumStats.useQuery(
    { artistName, albumName, catalogAlbumId },
    {
      enabled: enabled && !!artistName && !!albumName && !!catalogAlbumId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      placeholderData: keepPreviousData,
      trpc: { context: { skipBatch: true } },
    }
  );
}
