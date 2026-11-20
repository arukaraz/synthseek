import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs } from "@trpc/server";

export type ReorderPlaylistTracksInput = inferRouterInputs<AppRouter>["playlists"]["reorderTracks"];

export type RenamePlaylistInput = inferRouterInputs<AppRouter>["playlists"]["rename"];

export interface RemovedPlaylistTrack {
  trackId: string;
  position: number;
  title: string;
}

export interface SuggestedTrackToAdd {
  externalId: string;
  title: string;
  artist: string;
  durationMs: number;
  trackNumber: number;
  isrc: string | null;
  album: { externalId: string } | null;
  requestId: string | null;
}

export interface RemovePlaylistTracksInput {
  playlistId: string;
  removed: readonly RemovedPlaylistTrack[];
  skipped: boolean;
}
