import type { ColumnDef } from "@components/ui/Table";
import type { ContentType } from "@api/__generated__/types";
import type {
  LibraryAlbumItem,
  LibraryArtistItem,
  LibraryPlaylistItem,
  LibraryTrackItem,
} from "@hooks/api/queries/library/types";
import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { LibrarySelection } from "./hooks/useLibrarySelection";
import type { LibraryUrlController } from "./hooks/useLibraryUrlState";

export type LibraryKey = ParseKeys<"library">;

export type LibraryView = "tracks" | "albums" | "artists" | "playlists";

export type LibraryLayout = "table" | "grid";

export type SortDirection = "asc" | "desc";

export type FacetKey =
  | "status"
  | "source"
  | "format"
  | "artist"
  | "requestedBy"
  | "albumId"
  | "genre"
  | "playlist"
  | "year"
  | "owner";

export interface FacetDef {
  key: FacetKey;
  labelKey: LibraryKey;
  searchable: boolean;
  facetSearchKey?: "artist" | "genre" | "playlist" | "owner";
  staticValues?: readonly string[];
  labelNs?: "status";
}

export interface SortOptionDef {
  value: string;
  labelKey: LibraryKey;
  defaultDirection: SortDirection;
}

interface BaseViewConfig {
  view: LibraryView;
  labelKey: LibraryKey;
  icon: LucideIcon;
  contentType: ContentType;
  layout: LibraryLayout;
  facets: FacetDef[];
  sortOptions: SortOptionDef[];
  defaultSort: string;
  interactive: boolean;
  filterParamKeys: string[];
  searchPlaceholderKey: LibraryKey;
  emptyTitleKey: LibraryKey;
  emptyDescriptionKey: LibraryKey;
}

export interface TracksViewConfig extends BaseViewConfig {
  view: "tracks";
  layout: "table";
  columns: ColumnDef<LibraryTrackItem>[];
}

export interface AlbumsViewConfig extends BaseViewConfig {
  view: "albums";
  layout: "grid";
  renderCard: (item: LibraryAlbumItem) => ReactNode;
  getCardId: (item: LibraryAlbumItem) => string;
}

export interface ArtistsViewConfig extends BaseViewConfig {
  view: "artists";
  layout: "grid";
  renderCard: (item: LibraryArtistItem) => ReactNode;
  getCardId: (item: LibraryArtistItem) => string;
}

export interface PlaylistsViewConfig extends BaseViewConfig {
  view: "playlists";
  layout: "grid";
  renderCard: (item: LibraryPlaylistItem) => ReactNode;
  getCardId: (item: LibraryPlaylistItem) => string;
}

export type ViewConfig = TracksViewConfig | AlbumsViewConfig | ArtistsViewConfig | PlaylistsViewConfig;

export interface ViewConfigMap {
  tracks: TracksViewConfig;
  albums: AlbumsViewConfig;
  artists: ArtistsViewConfig;
  playlists: PlaylistsViewConfig;
}

export type FilterParamMap = Partial<Record<string, string[]>>;

export interface FacetSearchState {
  artist?: string;
  genre?: string;
  playlist?: string;
  owner?: string;
}

export interface UseInfiniteScrollArgs {
  root: HTMLElement | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export interface LibraryViewModeProps {
  controller: LibraryUrlController;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
}

export interface TracksViewModeProps extends LibraryViewModeProps {
  selection: LibrarySelection;
}
