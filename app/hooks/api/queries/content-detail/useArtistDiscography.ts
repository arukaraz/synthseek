import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseArtistDiscographyArgs {
  catalogArtistId: string;
  enabled?: boolean;
}

export function useArtistDiscography({ catalogArtistId, enabled = true }: UseArtistDiscographyArgs) {
  return trpc.contentDetail.artistDiscography.useQuery(
    { catalogArtistId },
    {
      enabled: enabled && !!catalogArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
