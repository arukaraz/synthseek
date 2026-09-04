import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

export interface TrackPrimaryCellProps {
  item: LibraryTrackItem;
  onPlay: (trackId: string) => void;
}

export interface TrackMetaCellProps {
  artist: string;
  albumName: string;
}

export interface LibraryDurationCellProps {
  durationMs: number;
}

export interface LibraryRequestedAtCellProps {
  createdAt: Date;
}
