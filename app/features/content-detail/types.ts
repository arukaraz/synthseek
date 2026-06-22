import type { MusicAlbum, MusicArtist, MusicTrack } from "@api/__generated__/types";
import type { ReactNode } from "react";

import type { TracklistTrack } from "./components/Tracklist/types";

export type DetailMode = "artist" | "album" | "playlist";

export type PlaylistSource = "library" | "catalog" | "preloaded";

export interface DetailTarget {
  mode: DetailMode;
  id: string;
  name: string;
  artistName: string;
  cover: string | null;
  playlistSource?: PlaylistSource;
  preloadedTracks?: TracklistTrack[];
  requestDisabled?: boolean;
  requestDisabledTooltip?: string | null;
}

export interface ContentDetailModalProps {
  open: boolean;
  onClose: () => void;
  target: DetailTarget | null;
  actions: ContentDetailActions;
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
}

export type StatsWidgetSlot = "stats" | "about";

export interface ArtistStatsWidgetProps {
  deezerArtistId: string;
  artistName: string;
  mbid: string | null;
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

export interface AlbumRequestInput {
  id: string;
  name: string;
  artistName: string;
  cover: string | null;
  genres?: string[];
}

export interface ArtistRequestInput {
  id: string;
  name: string;
  cover: string | null;
}

export interface PlaylistRequestInput {
  id: string;
  name: string;
  cover: string | null;
  totalTracks: number;
  tracks: TracklistTrack[];
}

export interface PlaylistPreloadedTargetInput {
  id: string;
  name: string;
  cover: string | null;
  tracks: MusicTrack[];
  requestDisabled?: boolean;
  requestDisabledTooltip?: string | null;
}

export interface TrackRequestInput {
  id: string;
  title: string;
  artistName: string;
  durationMs: number;
  trackNumber: number;
  isrc: string | null;
  album?: { id: string; name: string; cover: string | null };
}

export interface ContentDetailActions {
  requestAlbum: (input: AlbumRequestInput) => void;
  requestArtist: (input: ArtistRequestInput) => void;
  requestTrack: (input: TrackRequestInput) => void;
  requestPlaylist: (input: PlaylistRequestInput) => void;
}

export interface ContentDetailActionsProviderProps {
  actions: ContentDetailActions;
  children: ReactNode;
}
