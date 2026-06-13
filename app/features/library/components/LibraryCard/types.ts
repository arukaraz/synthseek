import type { LibraryAlbumItem, LibraryArtistItem, LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import type { ReactNode } from "react";

export interface LibraryCardGridProps {
  children: ReactNode;
  ariaLabel: string;
}

export interface LibraryInfiniteGridProps<TItem> {
  items: TItem[];
  ariaLabel: string;
  renderCard: (item: TItem) => ReactNode;
  getCardId: (item: TItem) => string;
  scrollRoot: HTMLElement | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export interface AlbumCardProps {
  item: LibraryAlbumItem;
}

export interface ArtistCardProps {
  item: LibraryArtistItem;
}

export interface PlaylistCardProps {
  item: LibraryPlaylistItem;
}
