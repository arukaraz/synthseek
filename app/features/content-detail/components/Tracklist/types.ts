import type { FailureReason, RequestStatus } from "@api/__generated__/types";
import type { CheckboxPreview } from "@components/ui/Checkbox";

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
  onSelectTrack?: (requestId: string, extend: boolean) => void;
  onPreviewHover?: (requestId: string | null) => void;
  previewTone?: (requestId: string) => CheckboxPreview;
}

export interface TrackPlaybackActionsProps {
  title: string;
  onPlayNow: () => Promise<void>;
  onEnqueue: () => Promise<boolean>;
  onPlayNext?: () => Promise<boolean>;
  inQueue?: boolean;
}

export interface TrackRowProps {
  track: TracklistTrack;
  showArtist: boolean;
  onRequest: () => void;
  onRetry: () => void;
  isRetrying: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onSelectTrack?: (extend: boolean) => void;
  onPreviewHover?: (hovering: boolean) => void;
  previewTone?: CheckboxPreview;
  onPlayNow?: () => Promise<void>;
  onEnqueue?: () => Promise<boolean>;
  onPlayNext?: () => Promise<boolean>;
  inQueue?: boolean;
}
