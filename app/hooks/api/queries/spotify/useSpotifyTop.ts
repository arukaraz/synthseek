import { trpc } from "@utils/trpc";

export type TopRange = "short_term" | "medium_term" | "long_term";

export function useSpotifyTopTracks(range: TopRange, enabled = true) {
  return trpc.librarySource.spotify.getTopTracks.useQuery(
    { range, limit: 20 },
    { enabled, staleTime: 5 * 60 * 1000 }
  );
}

export function useSpotifyTopArtists(range: TopRange, enabled = true) {
  return trpc.librarySource.spotify.getTopArtists.useQuery(
    { range, limit: 20 },
    { enabled, staleTime: 5 * 60 * 1000 }
  );
}
