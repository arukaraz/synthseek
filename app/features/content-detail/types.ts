import type { MusicAlbum, MusicArtist } from "@api/__generated__/types";
import type { ReactNode } from "react";

export type DetailMode = "artist" | "album";

export interface DetailTarget {
  mode: DetailMode;
  id: string;
  name: string;
  artistName: string;
  cover: string | null;
}

export interface ContentDetailModalProps {
  open: boolean;
  onClose: () => void;
  target: DetailTarget | null;
}

export interface DetailSectionProps {
  title: string;
  isLoading: boolean;
  isEmpty?: boolean;
  skeletonHeight?: string;
  count?: ReactNode;
  inlineSlot?: ReactNode;
  trailingSlot?: ReactNode;
  children?: ReactNode;
}

export interface DetailEmptyProps {
  message: string;
}

export interface ArtistIdentityWidgetProps {
  deezerArtistId: string;
  artistName: string;
  albumsInLibrary: number | null;
}

export type StatsWidgetSlot = "stats" | "about";

export interface ArtistStatsWidgetProps {
  artistName: string;
  mbid: string | null;
  inLibraryCount: number | null;
  slot: StatsWidgetSlot;
}

export interface ArtistTopTracksWidgetProps {
  deezerArtistId: string;
}

export interface ArtistSimilarWidgetProps {
  artistName: string;
  onSelectArtist: (target: DetailTarget) => void;
}

export interface ArtistDiscographyWidgetProps {
  deezerArtistId: string;
  artistName: string;
  onSelectAlbum: (target: DetailTarget) => void;
}

export interface AlbumDetailWidgetProps {
  deezerAlbumId: string;
}

export interface AlbumStatsWidgetProps {
  artistName: string;
  albumName: string;
  trackCount: number | null;
  slot: StatsWidgetSlot;
}

export interface AlbumCreditsWidgetProps {
  deezerAlbumId: string;
  releaseDate: string | null;
  label: string | null;
  recordType: string | null;
  length: string | null;
}

export interface MoreFromArtistWidgetProps {
  artistExternalId: string | null;
  artistName: string;
  excludeAlbumId: string;
  onSelectAlbum: (target: DetailTarget) => void;
}

export type StatValue = number | null;

export interface StatItem {
  label: string;
  value: StatValue;
}

export interface FactItem {
  label: string;
  value: string | null;
  items?: string[];
}

export interface ContentCardItem {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  inLibrary: boolean;
  libraryTrackCount: number;
  totalTracks: number;
}

export interface ContentCardProps {
  item: ContentCardItem;
  onSelect: (item: ContentCardItem) => void;
}

export type MusicCollectionItem = MusicArtist | MusicAlbum;
