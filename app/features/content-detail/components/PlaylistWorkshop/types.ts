import type { AppRouter } from "@api/__generated__/types";
import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { inferRouterOutputs } from "@trpc/server";
import type { PlaylistOrigin } from "@utils/playlist";
import type { ReactNode } from "react";

import type { DetailTarget } from "../../types";
import type { TracklistTrack } from "../Tracklist/types";

type PlaylistDetail = inferRouterOutputs<AppRouter>["contentDetail"]["playlistDetail"];

type M3uImportReport = inferRouterOutputs<AppRouter>["playlists"]["importM3u"];

export type WorkshopTrack = TracklistTrack & { requestId: string };

export type WorkshopTab = "tracks" | "suggested" | "details";

export type WorkshopLock = PlaylistDetail["tracksLock"];

export type WorkshopLimits = PlaylistDetail["editLimits"];

export type SaveOrder = (trackIds: string[], settled: () => void) => void;

export interface PlaylistOrder {
  ordered: WorkshopTrack[];
  arrange: (trackIds: string[]) => void;
  commit: () => Promise<void>;
  place: (trackIds: string[]) => void;
  placeSoon: (trackIds: string[]) => void;
}

export interface PlaylistWorkshopProps {
  target: DetailTarget;
  onExit: () => void;
  onClose: () => void;
  onNavigate: (target: DetailTarget) => void;
}

export interface WorkshopHeaderProps {
  name: string;
  cover: string | null;
  trackCount: number;
  minutes: number;
  inLibrary: number;
  onPlay: () => Promise<void>;
  onShuffle: () => Promise<void>;
  onEnqueue: () => Promise<void>;
  onExit: () => void;
}

export interface WorkshopCoverProps {
  playlistId: string;
  name: string;
  cover: string | null;
  hasCustomCover: boolean;
  maxBytes: number;
  accept: string[];
}

export interface WorkshopFilesProps {
  playlistId: string;
  name: string;
  canImport: boolean;
  maxChars: number;
  settleOrder: () => Promise<void>;
}

export interface M3uPreview {
  content: string;
  report: M3uImportReport;
}

export interface WorkshopDetailsProps {
  playlistId: string;
  name: string;
  cover: string | null;
  hasCustomCover: boolean;
  canEditTracks: boolean;
  limits: WorkshopLimits;
  origin: PlaylistOrigin;
  visibility: "shared" | "private";
  sourceProvider: string | null;
  syncEnabled: boolean;
  canRename: boolean;
  trackCount: number;
  minutes: number;
  inLibrary: number;
  settleOrder: () => Promise<void>;
  onDeleted: () => void;
}

export interface WorkshopSyncRowProps {
  playlistId: string;
  excludeServer: string | null;
}

export interface WorkshopSurfaceProps {
  open: boolean;
  name: string;
  onExit: () => void;
  children: ReactNode;
}

export interface WorkshopTracksProps {
  playlistId: string;
  order: PlaylistOrder;
  lock: WorkshopLock;
  onArtistNavigate: (track: TracklistTrack) => void;
}

export interface WorkshopTrackRowProps {
  track: WorkshopTrack;
  position: number;
  presence: QueuePresence;
  editable: boolean;
  selected: boolean;
  onSelect: (extend: boolean) => void;
  onPlay?: () => Promise<unknown>;
  onTogglePlay?: () => void;
  onRemove: () => void;
  onNudge: (delta: number) => void;
  onDrop: () => void;
  onArtistNavigate: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}

export interface WorkshopFieldProps {
  label: string;
  children: ReactNode;
}
