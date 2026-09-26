import { Album, Disc, Heart, Layers, ListMusic } from "lucide-react";
import type { ComponentType } from "react";

import type { LibrarySourceProvider } from "@hooks/api/queries/library-source/types";
import type { ErrorCategory } from "@modules/errors";

import { JellyfinMark } from "./components/JellyfinMark";
import { NavidromeMark } from "./components/NavidromeMark";
import { PlexMark } from "./components/PlexMark";
import { SpotifyMark } from "./components/SpotifyMark";
import type { BrandMarkProps } from "./components/types";
import type { AutoWatchState, LibraryFilter, LibraryItemType, LibrarySort, WatchRowKeys } from "./types";

export const FILTER_ICONS: Record<LibraryFilter, typeof Layers> = {
  all: Layers,
  playlists: ListMusic,
  albums: Disc,
  liked: Heart,
};

export const FILTER_VALUES: ReadonlyArray<LibraryFilter> = ["all", "playlists", "albums", "liked"];

export const FILTER_ITEM_TYPE: Record<Exclude<LibraryFilter, "all">, LibraryItemType> = {
  playlists: "playlist",
  albums: "album",
  liked: "liked",
};

export const PROVIDER_MARKS: Record<LibrarySourceProvider, ComponentType<BrandMarkProps>> = {
  spotify: SpotifyMark,
  plex: PlexMark,
  navidrome: NavidromeMark,
  jellyfin: JellyfinMark,
};

export const PROVIDER_ERROR_CATEGORY: Record<LibrarySourceProvider, ErrorCategory> = {
  spotify: "spotify",
  plex: "generic",
  navidrome: "generic",
  jellyfin: "generic",
};

export const PROFILE_ROUTE = "/settings/profile";

export const WATCH_ROW_KEYS: Record<keyof AutoWatchState, WatchRowKeys> = {
  playlists: {
    label: "librarySource.autoWatch.newPlaylists",
    sub: "librarySource.autoWatch.newPlaylistsSub",
    aria: "librarySource.autoWatch.newPlaylistsAria",
  },
  savedAlbums: {
    label: "librarySource.autoWatch.savedAlbums",
    sub: "librarySource.autoWatch.savedAlbumsSub",
    aria: "librarySource.autoWatch.savedAlbumsAria",
  },
};

export const SORT_VALUES: ReadonlyArray<LibrarySort> = ["name", "type", "tracks", "imported", "lastSync", "syncStatus"];

export { Album };

export const RELATIVE_SYNC_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_IMPORT_CONFIG = {
  bitrate: { value: 320, matching: "flexible" as const },
  format: { value: "mp3" as const, matching: "flexible" as const },
};

export const TRACK_PREVIEW_LIMIT = 5;

export const TRI_TOGGLE_ARIA_CHECKED = { on: true, off: false, mixed: "mixed" } as const;
