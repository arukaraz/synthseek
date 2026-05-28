import { trpc } from "@utils/trpc";

export function useSpotifyLibraryItems(enabled = true) {
  return trpc.librarySource.spotify.listLibraryItems.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });
}
