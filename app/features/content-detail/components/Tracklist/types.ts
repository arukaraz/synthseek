import type { FailureReason, RequestStatus } from "@api/__generated__/types";

export interface TracklistTrack {
  externalId: string;
  title: string;
  artist: string;
  durationMs: number;
  trackNumber: number;
  plays: number | null;
  inLibrary: boolean;
  requestId: string | null;
  status: RequestStatus | null;
  failureReason: FailureReason | null;
}

export interface TracklistProps {
  tracks: TracklistTrack[];
  showArtist?: boolean;
}

export interface TrackRowProps {
  track: TracklistTrack;
  rank: number;
  showArtist: boolean;
}
