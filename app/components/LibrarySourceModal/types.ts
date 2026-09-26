import type { ParseKeys } from "i18next";

import type {
  LibrarySourceDescription,
  LibrarySourceItem,
  LibrarySourceItemDetail,
  LibrarySourceProvider,
} from "@hooks/api/queries/library-source/types";

export type LibraryItem = LibrarySourceItem;
export type LibraryItemDetail = LibrarySourceItemDetail;
export type LibraryItemType = LibraryItem["type"];

export type LibraryFilter = "all" | "playlists" | "albums" | "liked";
export type LibrarySort = "name" | "type" | "tracks" | "imported" | "lastSync" | "syncStatus";

export type ToggleAggregateState = "on" | "off" | "mixed";

export type WatchCapabilities = LibrarySourceDescription["capabilities"]["watch"];

export interface LibrarySourceModalProps {
  provider: LibrarySourceProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface AutoWatchState {
  playlists: boolean;
  savedAlbums: boolean;
}

export interface WatchRowKeys {
  label: ParseKeys<"library">;
  sub: ParseKeys<"library">;
  aria: ParseKeys<"library">;
}
