export const LOAD_TIMEOUT_MS = 15000;

export const STALL_TIMEOUT_MS = 15000;

export const MAX_CONSECUTIVE_FAILURES = 3;

export const SKIP_DELAY_MS = 1200;

export const NOTICE_MS = 4200;

export const VOLUME_STORAGE_KEY = "synthseek.player.volume";

export const ARTWORK_SIZES = ["96x96", "192x192", "512x512"] as const;

export const CONVERTED_FORMAT = "mp3";

export const CONVERTED_BITRATE_KBPS = 320;

export const PLAYBACK_MIME_BY_FORMAT: Readonly<Record<string, string>> = {
  mp3: "audio/mpeg",
  flac: "audio/flac",
  m4a: "audio/mp4",
  alac: "audio/mp4",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/opus",
  aac: "audio/aac",
  wav: "audio/wav",
};
