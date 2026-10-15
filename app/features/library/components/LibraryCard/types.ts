import type { LibraryAlbumItem, LibraryArtistItem, LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import type { CheckboxPreview } from "@components/ui/Checkbox";
import type { ReactNode } from "react";

import type { AlbumSelection, LibraryFileActions } from "../../types";

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

export type CardPlayOrder = "inOrder" | "shuffled";

export interface CardCoverActionsProps {
  name: string;
  order: CardPlayOrder;
  onPlay: () => Promise<void>;
  onOpen?: () => void;
  menu?: ReactNode;
}

export interface CardSelection {
  selected: boolean;
  selecting: boolean;
  preview: CheckboxPreview;
  onToggle: (extend: boolean) => void;
  onHover: (hovered: boolean) => void;
}

export type CardCoverTone = "none" | "selected" | "select" | "clear";

export interface AlbumCardProps {
  item: LibraryAlbumItem;
  showLibraryPaths?: boolean;
  onOpen?: () => void;
  onPlay?: () => Promise<void>;
  menu?: ReactNode;
  selection?: CardSelection;
}

export interface AlbumSelectionBarProps {
  items: LibraryAlbumItem[];
  selection: AlbumSelection;
  fileActions: LibraryFileActions;
  onEnqueue: (albums: LibraryAlbumItem[]) => Promise<boolean>;
}

export interface AlbumCardMenuProps {
  item: LibraryAlbumItem;
  onEnqueue: () => void;
  fileActions: LibraryFileActions;
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
