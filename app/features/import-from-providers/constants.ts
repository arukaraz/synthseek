import type { ProviderKey, SpotifyTab, TopRange } from "./types";

export const PROVIDERS: ReadonlyArray<{ key: ProviderKey; label: string; comingSoon?: boolean }> = [
  { key: "spotify", label: "Spotify" },
];

export const SPOTIFY_TABS: ReadonlyArray<{ key: SpotifyTab; label: string }> = [
  { key: "playlists", label: "Playlists" },
  { key: "liked", label: "Liked Songs" },
  { key: "albums", label: "Saved Albums" },
  { key: "top", label: "Top (read-only)" },
];

export const TOP_RANGES: ReadonlyArray<{ key: TopRange; label: string }> = [
  { key: "short_term", label: "Last 4 weeks" },
  { key: "medium_term", label: "Last 6 months" },
  { key: "long_term", label: "All-time" },
];

export const DEFAULT_IMPORT_CONFIG = {
  bitrate: { value: 320, matching: "flexible" as const },
  format: { value: "mp3" as const, matching: "flexible" as const },
};
