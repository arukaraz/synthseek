import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UsePlaylistDetailArgs {
  playlistId: string;
  enabled?: boolean;
}

export function usePlaylistDetail({ playlistId, enabled = true }: UsePlaylistDetailArgs) {
  return trpc.contentDetail.playlistDetail.useQuery(
    { playlistId },
    {
      enabled: enabled && !!playlistId,
      staleTime: 60 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
      trpc: { context: { skipBatch: true } },
    }
  );
}
