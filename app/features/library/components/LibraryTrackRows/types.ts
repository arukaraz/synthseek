import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

import type { LibrarySelection } from "../../hooks/useLibrarySelection";
import type { LibraryFileActions } from "../../types";

interface TrackRowActions {
  onPlay: (trackId: string) => void;
  onEnqueue: (trackIds: string[]) => Promise<boolean>;
  onSearchBetterQuality: (trackIds: string[]) => void;
  fileActions: LibraryFileActions;
}

export interface LibraryTrackRowsProps extends TrackRowActions {
  items: LibraryTrackItem[];
  selection: LibrarySelection;
  selecting: boolean;
  onHold?: (trackId: string) => void;
}

export interface LibraryTrackRowProps extends TrackRowActions {
  item: LibraryTrackItem;
  selecting: boolean;
  selected: boolean;
  onToggle: () => void;
  onHold?: () => void;
}
