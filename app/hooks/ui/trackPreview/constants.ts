export const TRACK_PREVIEW = {
  CLIP_SECONDS: 30,
  CLOCK_INTERVAL_MS: 250,
  CATALOG_KEY_PREFIX: "catalog:",
  FILE_KEY_PREFIX: "file:",
  SLOT_SEPARATOR: "#",
  CATALOG_PATH_PREFIX: "/api/v1/catalog/tracks/",
  CATALOG_PATH_SUFFIX: "/preview",
  FILE_PATH_PREFIX: "/api/v1/library-copies/",
  FILE_PATH_SUFFIX: "/audio",
  ABORT_ERROR_NAME: "AbortError",
  DISMISS_KEY: "Escape",
} as const;
