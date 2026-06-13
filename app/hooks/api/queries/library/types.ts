import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { FetchNextPageOptions, InfiniteQueryObserverResult } from "@tanstack/react-query";

type LibraryInputs = inferRouterInputs<AppRouter>["library"];
type LibraryOutputs = inferRouterOutputs<AppRouter>["library"];

export type LibraryTracksInput = LibraryInputs["getTracks"];
export type LibraryAlbumsInput = LibraryInputs["getAlbums"];
export type LibraryArtistsInput = LibraryInputs["getArtists"];
export type LibraryPlaylistsInput = LibraryInputs["getPlaylists"];

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
