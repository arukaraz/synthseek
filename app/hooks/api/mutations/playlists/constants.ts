import type { ParseKeys } from "i18next";

export const PLAYLIST_COVER_UPLOAD_PATH = "/api/v1/playlist-covers";

export const PLAYLIST_COVER_FIELD = "cover";

export const PLAYLIST_M3U_ACCEPT = ".m3u,.m3u8,audio/x-mpegurl,application/vnd.apple.mpegurl";

export const COVER_ERROR_KEYS = {
  PLAYLIST_COVER_UNSUPPORTED: "playlists.coverError.unsupported",
  PLAYLIST_COVER_TOO_LARGE: "playlists.coverError.tooLarge",
} as const satisfies Record<string, ParseKeys<"mutations">>;

export const COVER_ERROR_FALLBACK_KEY = "playlists.coverError.failed" satisfies ParseKeys<"mutations">;
