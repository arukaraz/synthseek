import { Album, Disc, Heart, Layers, ListMusic } from "lucide-react";

import type { LibraryFilter, LibrarySort } from "./types";

export const FILTER_ICONS: Record<LibraryFilter, typeof Layers> = {
  all: Layers,
  playlists: ListMusic,
  albums: Disc,
  liked: Heart,
};

export const FILTER_VALUES: ReadonlyArray<LibraryFilter> = ["all", "playlists", "albums", "liked"];

export const SORT_VALUES: ReadonlyArray<LibrarySort> = ["name", "type", "tracks", "imported", "lastSync", "syncStatus"];

export { Album };

export const DEFAULT_IMPORT_CONFIG = {
  bitrate: { value: 320, matching: "flexible" as const },
  format: { value: "mp3" as const, matching: "flexible" as const },
};

export const TRACK_PREVIEW_LIMIT = 5;
