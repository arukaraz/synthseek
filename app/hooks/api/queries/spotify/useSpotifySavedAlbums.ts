import { trpc } from "@utils/trpc";

export function useSpotifySavedAlbums(enabled = true) {
  return trpc.librarySource.spotify.listSavedAlbums.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });
}
