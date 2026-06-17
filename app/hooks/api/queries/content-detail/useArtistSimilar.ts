import { trpc } from "@utils/trpc";

interface UseArtistSimilarArgs {
  artistName: string;
  enabled?: boolean;
}

export function useArtistSimilar({ artistName, enabled = true }: UseArtistSimilarArgs) {
  return trpc.contentDetail.artistSimilar.useQuery(
    { artistName },
    {
      enabled: enabled && !!artistName,
      staleTime: 60 * 60 * 1000,
      trpc: { context: { skipBatch: true } },
    }
  );
}
