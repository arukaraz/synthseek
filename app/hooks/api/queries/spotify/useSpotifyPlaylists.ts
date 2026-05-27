import { trpc } from "@utils/trpc";

export function useSpotifyPlaylists(enabled = true) {
  return trpc.librarySource.spotify.listPlaylists.useQuery(undefined, {
    enabled,
    staleTime: 30 * 1000,
  });
}
