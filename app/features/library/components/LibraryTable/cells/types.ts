import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

import type { LibraryFileActions } from "../../../types";

export interface TrackPrimaryCellProps {
  item: LibraryTrackItem;
  onPlay: (trackId: string) => void;
}

export interface TrackActionsCellProps {
  item: LibraryTrackItem;
  onEnqueue: (trackIds: string[]) => Promise<boolean>;
  onSearchBetterQuality: (trackIds: string[]) => void;
  fileActions: LibraryFileActions;
}

export interface TrackLibraryPathCellProps {
  libraryPath: LibraryTrackItem["libraryPath"];
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
