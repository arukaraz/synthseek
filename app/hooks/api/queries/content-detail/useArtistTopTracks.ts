import { trpc } from "@utils/trpc";

interface UseArtistTopTracksArgs {
  deezerArtistId: string;
  enabled?: boolean;
}

export function useArtistTopTracks({ deezerArtistId, enabled = true }: UseArtistTopTracksArgs) {
  return trpc.contentDetail.artistTopTracks.useQuery(
    { deezerArtistId },
    {
      enabled: enabled && !!deezerArtistId,
      staleTime: 60 * 60 * 1000,
      trpc: { context: { skipBatch: true } },
    }
  );
}
