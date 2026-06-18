import { ContentType } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

import { CONTENT_DETAIL_GC_TIME } from "./constants";

interface UseCatalogPlaylistTracksArgs {
  playlistId: string;
  enabled?: boolean;
}

export function useCatalogPlaylistTracks({ playlistId, enabled = true }: UseCatalogPlaylistTracksArgs) {
  return trpc.music.getContents.useQuery(
    { parentId: playlistId, parentType: ContentType.enum.playlist },
    {
      enabled: enabled && !!playlistId,
      staleTime: 10 * 60 * 1000,
      gcTime: CONTENT_DETAIL_GC_TIME,
    }
  );
}
