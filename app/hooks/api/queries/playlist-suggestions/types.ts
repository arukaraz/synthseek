export interface PlaylistSuggestionsKey {
  playlistId: string;
  seed: number;
}

export interface UsePlaylistSuggestionsArgs extends PlaylistSuggestionsKey {
  enabled?: boolean;
}

export type SuggestionGoneKey = readonly [string, string, number];

export interface SuggestionPage<Track> {
  tracks: readonly Track[];
  nextCursor: number | null;
  widerCursor: number | null;
}

export interface SuggestionReading<Track> {
  rows: Track[];
  nextCursor: number | null;
}
