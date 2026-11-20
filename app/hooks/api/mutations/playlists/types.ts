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
