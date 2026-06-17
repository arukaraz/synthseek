import { trpc } from "@utils/trpc";

interface UseArtistIdentityArgs {
  deezerArtistId: string;
  artistName: string;
  enabled?: boolean;
}

export function useArtistIdentity({ deezerArtistId, artistName, enabled = true }: UseArtistIdentityArgs) {
  return trpc.contentDetail.artistIdentity.useQuery(
    { deezerArtistId, artistName },
    {
      enabled: enabled && !!deezerArtistId,
      staleTime: 60 * 60 * 1000,
      trpc: { context: { skipBatch: true } },
    }
  );
}
