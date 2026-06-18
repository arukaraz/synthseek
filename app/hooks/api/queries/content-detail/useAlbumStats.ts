import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseAlbumStatsArgs {
  artistName: string;
  albumName: string;
  mbid: string | null;
  enabled?: boolean;
}

export function useAlbumStats({ artistName, albumName, mbid, enabled = true }: UseAlbumStatsArgs) {
  return trpc.contentDetail.albumStats.useQuery(
    { artistName, albumName, mbid: mbid ?? undefined },
    {
      enabled: enabled && !!artistName && !!albumName,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      placeholderData: keepPreviousData,
      trpc: { context: { skipBatch: true } },
    }
  );
}
