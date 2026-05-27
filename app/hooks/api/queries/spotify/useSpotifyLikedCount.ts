import { trpc } from "@utils/trpc";

export function useSpotifyLikedCount(enabled = true) {
  return trpc.librarySource.spotify.getLikedCount.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });
}
