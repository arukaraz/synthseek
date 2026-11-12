import { ContentType, RequestStatus } from "@api/__generated__/types";
import { Disc3, ListMusic, Music, User } from "lucide-react";

import type {
  AlbumsViewConfig,
  ArtistsViewConfig,
  LibraryView,
  PlaySort,
  PlaylistsViewConfig,
  SortDirection,
  SortOptionDef,
  TracksViewConfig,
  ViewConfigMap,
} from "./types";

export const LIBRARY_VIEWS: readonly LibraryView[] = ["tracks", "albums", "artists", "playlists"];

export const LIBRARY_DENSITY_STORAGE_KEY = "synthseek.library.density";

export const GRID_ITEMS_SELECTOR = "[data-library-grid]";

export const GRID_JUMP_MAX_FRAMES = 60;

export const LIBRARY_FACET_TOP_N = 8;

export const LIBRARY_STATUS_FACET_VALUES = RequestStatus.options;

const STATUS_FACET_DEF = {
  key: "status",
  labelKey: "page.facets.status",
  searchable: false,
  staticValues: LIBRARY_STATUS_FACET_VALUES,
  labelNs: "status",
} as const;

const ORIGIN_FACET_DEF = {
  key: "origin",
  labelKey: "page.facets.origin",
  searchable: false,
  labelNs: "origin",
} as const;

const LIBRARY_PATH_FACET_DEF = {
  key: "libraryPath",
  labelKey: "page.facets.libraryPath",
  searchable: false,
  hideWithoutChoice: true,
} as const;

const PLAYBACK_SOURCE_FACET_DEF = {
  key: "source",
  labelKey: "page.facets.source",
  searchable: false,
  labelNs: "playbackSource",
  hideWithoutChoice: true,
} as const;

export const LIBRARY_FACET_SEARCH_KEYS = ["artist", "genre", "playlist", "owner"] as const;

export const LIBRARY_SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];

const PLAY_SORT_OPTIONS: readonly SortOptionDef<PlaySort>[] = [
  { value: "lastPlayed", labelKey: "page.sort.lastPlayed", defaultDirection: "desc" },
  { value: "myPlays", labelKey: "page.sort.myPlays", defaultDirection: "desc" },
  { value: "allPlays", labelKey: "page.sort.allPlays", defaultDirection: "desc" },
];

export const LIBRARY_BASE_PARAMS = {
  tab: { defaultValue: "tracks" as LibraryView, validValues: LIBRARY_VIEWS },
  q: { defaultValue: "" as string },
  sort: { defaultValue: "" as string },
  dir: { validValues: LIBRARY_SORT_DIRECTIONS },
} as const;

export const EVERYONE_FILTER_KEY = "everyone";

export const LIBRARY_ALL_FILTER_KEYS = [
  "status",
  "origin",
  "source",
  "format",
  "artist",
  "requestedBy",
  "genre",
  "playlist",
  "albumId",
  "year",
  "owner",
  "libraryPath",
  "orphan",
  EVERYONE_FILTER_KEY,
] as const;

export const FILTER_ON = "true";

const TRACKS_CONFIG: TracksViewConfig = {
  view: "tracks",
  labelKey: "page.tabs.tracks",
  icon: Music,
  contentType: ContentType.enum.track,
  layout: "table",
  interactive: true,
  searchPlaceholderKey: "page.toolbar.searchTracks",
  emptyTitleKey: "page.empty.tracksTitle",
  emptyDescriptionKey: "page.empty.tracksDescription",
  defaultSort: "recent",
  sortOptions: [
    { value: "recent", labelKey: "page.sort.newest", defaultDirection: "desc" },
    { value: "oldest", labelKey: "page.sort.oldest", defaultDirection: "asc" },
    { value: "artist", labelKey: "page.sort.artist", defaultDirection: "asc" },
    { value: "album", labelKey: "page.sort.album", defaultDirection: "asc" },
    { value: "title", labelKey: "page.sort.title", defaultDirection: "asc" },
    { value: "duration", labelKey: "page.sort.duration", defaultDirection: "desc" },
    { value: "status", labelKey: "page.sort.status", defaultDirection: "asc" },
    ...PLAY_SORT_OPTIONS,
  ],
  filterParamKeys: [
    "status",
    "origin",
    "source",
    "format",
    "artist",
    "requestedBy",
    "genre",
    "playlist",
    "albumId",
    "libraryPath",
    "orphan",
  ],
  facets: [
    LIBRARY_PATH_FACET_DEF,
    STATUS_FACET_DEF,
    PLAYBACK_SOURCE_FACET_DEF,
    ORIGIN_FACET_DEF,
    { key: "format", labelKey: "page.facets.format", searchable: false },
    { key: "genre", labelKey: "page.facets.genre", searchable: true, facetSearchKey: "genre" },
    { key: "artist", labelKey: "page.facets.artist", searchable: true, facetSearchKey: "artist" },
    { key: "requestedBy", labelKey: "page.facets.requestedBy", searchable: false },
    { key: "playlist", labelKey: "page.facets.playlist", searchable: true, facetSearchKey: "playlist" },
  ],
};

const ALBUMS_CONFIG: AlbumsViewConfig = {
  view: "albums",
  labelKey: "page.tabs.albums",
  icon: Disc3,
  contentType: ContentType.enum.album,
  layout: "grid",
  interactive: false,
  getCardId: (item) => item.id,
  searchPlaceholderKey: "page.toolbar.searchAlbums",
  emptyTitleKey: "page.empty.albumsTitle",
  emptyDescriptionKey: "page.empty.albumsDescription",
  defaultSort: "recent",
  sortOptions: [
    { value: "recent", labelKey: "page.sort.newest", defaultDirection: "desc" },
    { value: "name", labelKey: "page.sort.name", defaultDirection: "asc" },
    { value: "artist", labelKey: "page.sort.artist", defaultDirection: "asc" },
    { value: "year", labelKey: "page.sort.year", defaultDirection: "desc" },
    { value: "tracks", labelKey: "page.sort.tracks", defaultDirection: "desc" },
    ...PLAY_SORT_OPTIONS,
  ],
  filterParamKeys: ["status", "artist", "genre", "year", "origin", "libraryPath"],
  facets: [
    LIBRARY_PATH_FACET_DEF,
    STATUS_FACET_DEF,
    ORIGIN_FACET_DEF,
    { key: "genre", labelKey: "page.facets.genre", searchable: true, facetSearchKey: "genre" },
    { key: "artist", labelKey: "page.facets.artist", searchable: true, facetSearchKey: "artist" },
    { key: "year", labelKey: "page.facets.year", searchable: false },
  ],
};

const ARTISTS_CONFIG: ArtistsViewConfig = {
  view: "artists",
  labelKey: "page.tabs.artists",
  icon: User,
  contentType: ContentType.enum.artist,
  layout: "grid",
  interactive: false,
  getCardId: (item) => item.artist,
  searchPlaceholderKey: "page.toolbar.searchArtists",
  emptyTitleKey: "page.empty.artistsTitle",
  emptyDescriptionKey: "page.empty.artistsDescription",
  defaultSort: "name",
  sortOptions: [
    { value: "name", labelKey: "page.sort.name", defaultDirection: "asc" },
    { value: "tracks", labelKey: "page.sort.tracks", defaultDirection: "desc" },
    { value: "albums", labelKey: "page.sort.albums", defaultDirection: "desc" },
    ...PLAY_SORT_OPTIONS,
  ],
  filterParamKeys: ["genre", "origin", "status"],
  facets: [
    { key: "genre", labelKey: "page.facets.genre", searchable: true, facetSearchKey: "genre" },
    ORIGIN_FACET_DEF,
    STATUS_FACET_DEF,
  ],
};

const PLAYLISTS_CONFIG: PlaylistsViewConfig = {
  view: "playlists",
  labelKey: "page.tabs.playlists",
  icon: ListMusic,
  contentType: ContentType.enum.playlist,
  layout: "grid",
  interactive: false,
  getCardId: (item) => item.id,
  searchPlaceholderKey: "page.toolbar.searchPlaylists",
  emptyTitleKey: "page.empty.playlistsTitle",
  emptyDescriptionKey: "page.empty.playlistsDescription",
  defaultSort: "recent",
  sortOptions: [
    { value: "recent", labelKey: "page.sort.newest", defaultDirection: "desc" },
    { value: "name", labelKey: "page.sort.name", defaultDirection: "asc" },
    { value: "tracks", labelKey: "page.sort.tracks", defaultDirection: "desc" },
    ...PLAY_SORT_OPTIONS,
  ],
  filterParamKeys: ["origin", "owner", "status", EVERYONE_FILTER_KEY],
  facets: [
    ORIGIN_FACET_DEF,
    { key: "owner", labelKey: "page.facets.owner", searchable: true, facetSearchKey: "owner" },
    STATUS_FACET_DEF,
  ],
};

export const VIEW_CONFIG: ViewConfigMap = {
  tracks: TRACKS_CONFIG,
  albums: ALBUMS_CONFIG,
  artists: ARTISTS_CONFIG,
  playlists: PLAYLISTS_CONFIG,
};

export const SHELF_COLLAPSE_AFTER_PX = 24;

export const SHELF_COLLAPSE_MIN_OVERFLOW_PX = 320;
