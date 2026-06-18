import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseAlbumCreditsArgs {
  deezerAlbumId: string;
  barcode: string | null;
  enabled?: boolean;
}

export function useAlbumCredits({ deezerAlbumId, barcode, enabled = true }: UseAlbumCreditsArgs) {
  return trpc.contentDetail.albumCredits.useQuery(
    { deezerAlbumId, barcode: barcode ?? undefined },
    {
      enabled: enabled && !!deezerAlbumId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      placeholderData: keepPreviousData,
      trpc: { context: { skipBatch: true } },
    }
  );
}
