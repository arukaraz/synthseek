import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { FetchNextPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";

type LibraryInputs = inferRouterInputs<AppRouter>["library"];
type LibraryOutputs = inferRouterOutputs<AppRouter>["library"];

export type LibraryTracksInput = LibraryInputs["getTracks"];
export type PlayableTracksTarget = LibraryInputs["getPlayableTracks"];
export type LibraryAlbumsInput = LibraryInputs["getAlbums"];
export type LibraryArtistsInput = LibraryInputs["getArtists"];
export type LibraryPlaylistsInput = LibraryInputs["getPlaylists"];

type WithoutPaging<TInput> = Omit<TInput, "offset" | "limit">;

export type LibraryTracksQuery = WithoutPaging<LibraryTracksInput>;
export type LibraryAlbumsQuery = WithoutPaging<LibraryAlbumsInput>;
export type LibraryArtistsQuery = WithoutPaging<LibraryArtistsInput>;
export type LibraryPlaylistsQuery = WithoutPaging<LibraryPlaylistsInput>;

export type LibraryTracksResult = LibraryOutputs["getTracks"];
export type LibraryAlbumsResult = LibraryOutputs["getAlbums"];
export type LibraryArtistsResult = LibraryOutputs["getArtists"];
export type LibraryPlaylistsResult = LibraryOutputs["getPlaylists"];
export type LibraryCountsResult = LibraryOutputs["getCounts"];

export type LibraryTrackItem = LibraryTracksResult["items"][number];
export type LibraryAlbumItem = LibraryAlbumsResult["items"][number];
export type LibraryArtistItem = LibraryArtistsResult["items"][number];
export type LibraryPlaylistItem = LibraryPlaylistsResult["items"][number];

export type LibraryFacetValue = LibraryTracksResult["facets"][string][number];
export type LibraryLetterIndexEntry = LibraryArtistsResult["letterIndex"][number];

export type LibraryFileSelection = LibraryInputs["files"]["previewMove"]["selection"];
export type LibraryMovePreview = LibraryOutputs["files"]["previewMove"];
export type LibraryFilesStatus = LibraryOutputs["files"]["status"];
export type LibraryFileFailure = LibraryFilesStatus["failures"][number];
export type LibraryPathRecord = LibraryOutputs["paths"]["list"][number];

export interface LibraryInfiniteResult<TItem> {
  items: TItem[] | undefined;
  total: number;
  facets: Record<string, LibraryFacetValue[]>;
  hasNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult>;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
}

export interface LibraryTracksInfiniteResult extends LibraryInfiniteResult<LibraryTrackItem> {
  appliedSources: string[];
  isRefreshing: boolean;
}

export interface LibraryArtistsInfiniteResult extends LibraryInfiniteResult<LibraryArtistItem> {
  letterIndex: LibraryLetterIndexEntry[];
  loadThrough: (offset: number) => Promise<void>;
}
