import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ProviderKey = "spotify";

export type SpotifyPlaylistSummary = RouterOutputs["librarySource"]["spotify"]["listPlaylists"][number];
export type SpotifySavedAlbumSummary = RouterOutputs["librarySource"]["spotify"]["listSavedAlbums"][number];
export type SpotifyTopTrack = RouterOutputs["librarySource"]["spotify"]["getTopTracks"][number];
export type SpotifyTopArtist = RouterOutputs["librarySource"]["spotify"]["getTopArtists"][number];

export type SpotifyTab = "playlists" | "liked" | "albums" | "top";

export type TopRange = "short_term" | "medium_term" | "long_term";

export interface ImportFromProvidersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
