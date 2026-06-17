import { trpc } from "@utils/trpc";

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
      trpc: { context: { skipBatch: true } },
    }
  );
}
