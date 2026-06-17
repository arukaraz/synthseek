import { trpc } from "@utils/trpc";

interface UseAlbumDetailArgs {
  deezerAlbumId: string;
  enabled?: boolean;
}

export function useAlbumDetail({ deezerAlbumId, enabled = true }: UseAlbumDetailArgs) {
  return trpc.contentDetail.albumDetail.useQuery(
    { deezerAlbumId },
    {
      enabled: enabled && !!deezerAlbumId,
      staleTime: 60 * 60 * 1000,
      trpc: { context: { skipBatch: true } },
    }
  );
}
