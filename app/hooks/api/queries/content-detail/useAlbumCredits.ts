import { trpc } from "@utils/trpc";

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
      trpc: { context: { skipBatch: true } },
    }
  );
}
