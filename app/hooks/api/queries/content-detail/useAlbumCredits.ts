import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseAlbumCreditsArgs {
  catalogAlbumId: string;
  barcode: string | null;
  enabled?: boolean;
}

export function useAlbumCredits({ catalogAlbumId, barcode, enabled = true }: UseAlbumCreditsArgs) {
  return trpc.contentDetail.albumCredits.useQuery(
    { catalogAlbumId, barcode: barcode ?? undefined },
    {
      enabled: enabled && !!catalogAlbumId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      placeholderData: keepPreviousData,
      trpc: { context: { skipBatch: true } },
    }
  );
}
