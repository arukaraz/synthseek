import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type LibraryItem = RouterOutputs["librarySource"]["spotify"]["listLibraryItems"][number];
export type LibraryItemDetail = RouterOutputs["librarySource"]["spotify"]["getLibraryItemDetail"];
export type LibraryItemType = LibraryItem["type"];

export type LibraryFilter = "all" | "playlists" | "albums" | "liked";
export type LibrarySort = "name" | "type" | "tracks" | "imported" | "lastSync" | "syncStatus";

export interface SpotifyLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface AutoWatchState {
  playlists: boolean;
  liked: boolean;
  savedAlbums: boolean;
}
