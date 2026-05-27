import { trpc } from "@utils/trpc";

export function useSpotifyConnectionStatus() {
  return trpc.librarySource.spotify.getConnectionStatus.useQuery(undefined, {
    staleTime: 60 * 1000,
  });
}
