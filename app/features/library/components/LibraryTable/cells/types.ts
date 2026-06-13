import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

export interface TrackPrimaryCellProps {
  item: LibraryTrackItem;
}

export interface TrackMetaCellProps {
  artist: string;
  albumName: string;
}

export interface LibraryDurationCellProps {
  durationMs: number;
}
