import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistStatsArgs {
  artistName: string;
  mbid: string | null;
  enabled?: boolean;
}

export function useArtistStats({ artistName, mbid, enabled = true }: UseArtistStatsArgs) {
  return trpc.contentDetail.artistStats.useQuery(
    { artistName, mbid: mbid ?? undefined },
    {
      enabled: enabled && !!artistName,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      placeholderData: keepPreviousData,
      trpc: { context: { skipBatch: true } },
    }
  );
}
