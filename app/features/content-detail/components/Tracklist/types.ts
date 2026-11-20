import type { FailureReason, RequestStatus } from "@api/__generated__/types";
import type { QueuePresence } from "@components/ui/QueueAddButton";

interface TrackAlbumContext {
  externalId: string;
  name: string;
  cover: string | null;
}

export interface TracklistTrack {
  externalId: string;
  title: string;
  artist: string;
  artistExternalId: string | null;
  durationMs: number;
  trackNumber: number;
  plays: number | null;
  hasPreview: boolean;
  album: TrackAlbumContext | null;
  inLibrary: boolean;
  requestId: string | null;
  slskd_request_id: string | null;
  status: RequestStatus | null;
  failureReason: FailureReason | null;
}

export interface TracklistProps {
  tracks: TracklistTrack[];
  showArtist?: boolean;
  onArtistNavigate?: (track: TracklistTrack) => void;
}

export interface TrackPlaybackActionsProps {
  title: string;
  presence: QueuePresence;
  onPlayNow: () => Promise<unknown>;
  onTogglePlay?: () => void;
  onEnqueue: () => Promise<boolean>;
  onRemove: () => void;
}

export interface TrackStatusMarkProps {
  title: string;
  status: RequestStatus;
  failureReason: FailureReason | null;
  canRetry: boolean;
  onRetry: () => void;
  isRetrying: boolean;
}

export interface TrackRowProps {
  track: TracklistTrack;
  showArtist: boolean;
  onRequest: () => void;
  onCustomizeRequest: () => void;
  onRetry: () => void;
  isRetrying: boolean;
  onPlayNow?: () => Promise<unknown>;
  onTogglePlay?: () => void;
  onEnqueue?: () => Promise<boolean>;
  onRemoveFromQueue?: () => void;
  queuePresence?: QueuePresence;
  previewSlot?: number;
  onArtistNavigate?: () => void;
}
