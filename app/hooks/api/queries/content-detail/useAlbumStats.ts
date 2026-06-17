import { trpc } from "@utils/trpc";

interface UseAlbumStatsArgs {
  artistName: string;
  albumName: string;
  mbid: string | null;
  enabled?: boolean;
}

export function useAlbumStats({ artistName, albumName, mbid, enabled = true }: UseAlbumStatsArgs) {
  return trpc.contentDetail.albumStats.useQuery(
    { artistName, albumName, mbid: mbid ?? undefined },
    {
      enabled: enabled && !!artistName && !!albumName,
      staleTime: 60 * 60 * 1000,
      trpc: { context: { skipBatch: true } },
    }
  );
}
