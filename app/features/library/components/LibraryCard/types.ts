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

export interface CardCoverActionsProps {
  name: string;
  onPlay: () => Promise<void>;
  onOpen: () => void;
}

export interface AlbumCardProps {
  item: LibraryAlbumItem;
  onOpen?: () => void;
  onPlay?: () => Promise<void>;
}

export interface ArtistCardProps {
  item: LibraryArtistItem;
  image?: string | null;
  isResolving?: boolean;
  onOpen?: () => void;
  onPlay?: () => Promise<void>;
}

export interface LibraryArtistCardProps {
  item: LibraryArtistItem;
  resolveEnabled: boolean;
  onOpen?: () => void;
  onPlay?: () => Promise<void>;
}

export interface PlaylistCardProps {
  item: LibraryPlaylistItem;
  onOpen?: () => void;
  onPlay?: () => Promise<void>;
}

export interface PlaylistCardMenuProps {
  item: LibraryPlaylistItem;
}
