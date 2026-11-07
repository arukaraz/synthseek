import type { DownloadedAlbumFilter } from "./types";

export const QUARANTINE_FILENAME_MAX = 64;

export const DOWNLOADED_ALBUM_FILTERS: readonly DownloadedAlbumFilter[] = ["all", "torrent", "usenet"];

export const CONTAINER_DEFAULT_OWNER_ID = "1000";

export const MS_PER_SECOND = 1000;

export const RULER_TICKS = 5;

export const SEEK_STEP_SECONDS = 5;

export const WAVEFORM = {
  HEIGHT: 100,
  PEAK_SCALE: 255,
  MIN_BAR: 0.5,
} as const;
