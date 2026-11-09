import type { LibraryAlbumItem, LibraryArtistItem, LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import type { CheckboxPreview } from "@components/ui/Checkbox";
import type { ReactNode } from "react";

import type { AlbumSelection, CardChrome, LibraryDensity, LibraryFileActions } from "../../types";

export interface LibraryCardGridProps {
  children: ReactNode;
  ariaLabel: string;
  density?: LibraryDensity;
}

export interface LibraryInfiniteGridProps<TItem> {
  items: TItem[];
  ariaLabel: string;
  density?: LibraryDensity;
  renderCard: (item: TItem) => ReactNode;
  getCardId: (item: TItem) => string;
  scrollRoot: HTMLElement | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export type CardPlayOrder = "inOrder" | "shuffled";

export type CardMenuAppearance = "cover" | "inline";

export interface CardPlayButtonProps {
  name: string;
  order: CardPlayOrder;
  onPlay: () => Promise<unknown>;
  placement: "corner" | "inline";
}

export interface LibraryListRowProps {
  title: string;
  subtitle: string;
  openLabel: string;
  artwork: ReactNode;
  round?: boolean;
  onOpen?: () => void;
  trailing?: ReactNode;
  selection?: CardSelection;
  selectLabel?: string;
  onHold?: () => void;
}

export interface CardArtworkProps {
  src: string | null | undefined;
  name: string;
  sizes: string;
}

export interface CardCoverActionsProps {
  name: string;
  order: CardPlayOrder;
  onPlay: () => Promise<unknown>;
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
  onPlay?: () => Promise<unknown>;
  menu?: ReactNode;
  selection?: CardSelection;
  chrome?: CardChrome;
  onHold?: () => void;
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
  appearance?: CardMenuAppearance;
}

export interface ArtistCardProps {
  item: LibraryArtistItem;
  image?: string | null;
  isResolving?: boolean;
  onOpen?: () => void;
  onPlay?: () => Promise<unknown>;
  chrome?: CardChrome;
}

export interface LibraryArtistCardProps {
  item: LibraryArtistItem;
  resolveEnabled: boolean;
  onOpen?: () => void;
  onPlay?: () => Promise<unknown>;
  chrome?: CardChrome;
  variant?: "card" | "row";
}

export interface PlaylistCardProps {
  item: LibraryPlaylistItem;
  onOpen?: () => void;
  onPlay?: () => Promise<unknown>;
  chrome?: CardChrome;
}

export interface PlaylistCardMenuProps {
  item: LibraryPlaylistItem;
  appearance?: CardMenuAppearance;
}
