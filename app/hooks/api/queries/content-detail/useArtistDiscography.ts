import { trpc } from "@utils/trpc";

interface UseArtistDiscographyArgs {
  deezerArtistId: string;
  enabled?: boolean;
}

export function useArtistDiscography({ deezerArtistId, enabled = true }: UseArtistDiscographyArgs) {
  return trpc.contentDetail.artistDiscography.useQuery(
    { deezerArtistId },
    {
      enabled: enabled && !!deezerArtistId,
      staleTime: 60 * 60 * 1000,
      trpc: { context: { skipBatch: true } },
    }
  );
}
