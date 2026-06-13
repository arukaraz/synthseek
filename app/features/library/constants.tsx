import { ContentType, RequestStatus } from "@api/__generated__/types";
import { Disc3, ListMusic, Music, User } from "lucide-react";

import { AlbumCard, ArtistCard, PlaylistCard } from "./components/LibraryCard";
import { buildTrackColumns } from "./components/LibraryTable/columns";
import type {
  AlbumsViewConfig,
  ArtistsViewConfig,
  LibraryView,
  PlaylistsViewConfig,
  SortDirection,
  TracksViewConfig,
  ViewConfigMap,
} from "./types";

export const LIBRARY_VIEWS: readonly LibraryView[] = ["tracks", "albums", "artists", "playlists"];

export const LIBRARY_PAGE_SIZE_OPTIONS = [50, 100, 200] as const;
export const LIBRARY_DEFAULT_PAGE_SIZE = "50";
export const LIBRARY_DEFAULT_PAGE = "1";

export const LIBRARY_FACET_TOP_N = 8;

export const LIBRARY_STATUS_FACET_VALUES = RequestStatus.options;

const STATUS_FACET_DEF = {
  key: "status",
  labelKey: "page.facets.status",
  searchable: false,
  staticValues: LIBRARY_STATUS_FACET_VALUES,
  labelNs: "status",
} as const;

export const INFINITE_SCROLL_ROOT_MARGIN = "200px";

export const LIBRARY_FACET_SEARCH_KEYS = ["artist", "genre", "playlist", "owner"] as const;

export const LIBRARY_SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];

export const LIBRARY_BASE_PARAMS = {
  tab: { defaultValue: "tracks" as LibraryView, validValues: LIBRARY_VIEWS },
  q: { defaultValue: "" as string },
  sort: { defaultValue: "" as string },
  dir: { validValues: LIBRARY_SORT_DIRECTIONS },
  page: { defaultValue: LIBRARY_DEFAULT_PAGE as string },
  rows: { defaultValue: LIBRARY_DEFAULT_PAGE_SIZE as string },
} as const;

export const LIBRARY_ALL_FILTER_KEYS = [
  "status",
  "source",
  "format",
  "artist",
  "requestedBy",
  "genre",
  "playlist",
  "albumId",
  "year",
  "owner",
  "orphan",
] as const;

const TRACKS_CONFIG: TracksViewConfig = {
  view: "tracks",
  labelKey: "page.tabs.tracks",
  icon: Music,
  contentType: ContentType.enum.track,
  layout: "table",
  interactive: true,
  columns: buildTrackColumns(),
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
  ],
  filterParamKeys: ["status", "source", "format", "artist", "requestedBy", "genre", "playlist", "albumId", "orphan"],
  facets: [
    STATUS_FACET_DEF,
    { key: "source", labelKey: "page.facets.source", searchable: false },
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
  renderCard: (item) => <AlbumCard item={item} />,
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
  ],
  filterParamKeys: ["status", "artist", "genre", "year", "source"],
  facets: [
    STATUS_FACET_DEF,
    { key: "source", labelKey: "page.facets.source", searchable: false },
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
  renderCard: (item) => <ArtistCard item={item} />,
  getCardId: (item) => item.artist,
  searchPlaceholderKey: "page.toolbar.searchArtists",
  emptyTitleKey: "page.empty.artistsTitle",
  emptyDescriptionKey: "page.empty.artistsDescription",
  defaultSort: "name",
  sortOptions: [
    { value: "name", labelKey: "page.sort.name", defaultDirection: "asc" },
    { value: "tracks", labelKey: "page.sort.tracks", defaultDirection: "desc" },
    { value: "albums", labelKey: "page.sort.albums", defaultDirection: "desc" },
  ],
  filterParamKeys: ["genre", "source", "status"],
  facets: [
    { key: "genre", labelKey: "page.facets.genre", searchable: true, facetSearchKey: "genre" },
    { key: "source", labelKey: "page.facets.source", searchable: false },
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
  renderCard: (item) => <PlaylistCard item={item} />,
  getCardId: (item) => item.id,
  searchPlaceholderKey: "page.toolbar.searchPlaylists",
  emptyTitleKey: "page.empty.playlistsTitle",
  emptyDescriptionKey: "page.empty.playlistsDescription",
  defaultSort: "recent",
  sortOptions: [
    { value: "recent", labelKey: "page.sort.newest", defaultDirection: "desc" },
    { value: "name", labelKey: "page.sort.name", defaultDirection: "asc" },
    { value: "tracks", labelKey: "page.sort.tracks", defaultDirection: "desc" },
  ],
  filterParamKeys: ["source", "owner", "status"],
  facets: [
    { key: "source", labelKey: "page.facets.source", searchable: false },
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
