import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";
import { discographyRefetchInterval } from "./helpers";

interface UseArtistDiscographyArgs {
  catalogArtistId: string;
  artistName: string;
  enabled?: boolean;
}

export function useArtistDiscography({ catalogArtistId, artistName, enabled = true }: UseArtistDiscographyArgs) {
  return trpc.contentDetail.artistDiscography.useQuery(
    { catalogArtistId, artistName },
    {
      enabled: enabled && !!catalogArtistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      refetchInterval: (query) =>
        discographyRefetchInterval(query.state.data?.releaseTypesPending, query.state.dataUpdateCount),
      trpc: { context: { skipBatch: true } },
    }
  );
}
