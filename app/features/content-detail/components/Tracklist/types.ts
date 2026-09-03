import type { FailureReason, RequestStatus } from "@api/__generated__/types";

interface TrackAlbumContext {
  externalId: string;
  name: string;
  cover: string | null;
}

export interface TracklistTrack {
  externalId: string;
  title: string;
  artist: string;
  durationMs: number;
  trackNumber: number;
  plays: number | null;
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
  selectable?: boolean;
  isSelected?: (requestId: string) => boolean;
  onToggleSelect?: (requestId: string) => void;
}

export interface TrackRowProps {
  track: TracklistTrack;
  showArtist: boolean;
  onRequest: () => void;
  onRetry: () => void;
  isRetrying: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}
