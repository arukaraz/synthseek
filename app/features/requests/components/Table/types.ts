import type { RequestStatus } from "@api/__generated__/types";
import type { FlatTrackRow } from "../../types";

export interface BuildColumnsArgs {
  currentUserId: string | undefined;
  canActFor: (item: FlatTrackRow) => boolean;
  onRetry: (item: FlatTrackRow) => void;
  onCancel: (item: FlatTrackRow) => void;
  onPrioritize: (item: FlatTrackRow) => void;
  onSelectSource: (parentId: string) => void;
}

export interface SourceCellProps {
  item: FlatTrackRow;
  onSelect: (parentId: string) => void;
}

export interface TrackActionsCellProps {
  item: FlatTrackRow;
  canAct: boolean;
  onRetry: () => void;
  onCancel: () => void;
  onPrioritize: () => void;
}

export interface PriorityCellProps {
  item: FlatTrackRow;
}

export interface TrackTitleCellProps {
  item: FlatTrackRow;
}

export interface TrackStatusCellProps {
  status: RequestStatus;
}
