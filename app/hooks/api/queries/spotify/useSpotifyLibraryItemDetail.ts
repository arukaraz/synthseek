import { trpc } from "@utils/trpc";

import type { LibraryItemType } from "@features/spotify-library/types";

export function useSpotifyLibraryItemDetail(id: string | null, type: LibraryItemType | null, enabled = true) {
  return trpc.librarySource.spotify.getLibraryItemDetail.useQuery(
    id && type ? { id, type } : ({ id: "", type: "playlist" } as { id: string; type: LibraryItemType }),
    { enabled: enabled && Boolean(id && type), staleTime: 30 * 1000 }
  );
}
