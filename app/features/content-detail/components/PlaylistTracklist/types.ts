import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { ReactNode } from "react";

import type { TracklistTrack } from "../Tracklist/types";

export interface PlaylistTracklistProps {
  playlistId: string;
  tracks: TracklistTrack[];
  onArtistNavigate?: (track: TracklistTrack) => void;
}

export interface PlaylistTrackRowProps {
  track: TracklistTrack;
  position: number;
  presence: QueuePresence;
  onPlay?: () => Promise<unknown>;
  onTogglePlay?: () => void;
  onPlayNext?: () => Promise<unknown>;
  onEnqueue?: () => Promise<unknown>;
  onArtistNavigate?: () => void;
  onRetry: () => void;
  isRetrying: boolean;
}

export interface PlaylistRowIdentityProps {
  track: TracklistTrack;
  position: number;
  presence: QueuePresence;
  onPlay?: () => Promise<unknown>;
  onTogglePlay?: () => void;
  onArtistNavigate?: () => void;
  previewSlot?: ReactNode;
}

export interface PlaylistRowFiguresProps {
  track: TracklistTrack;
}
