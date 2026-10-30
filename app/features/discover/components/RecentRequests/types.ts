import type { FlatTrackRow } from "@features/requests/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

export interface RecentRequestsProps {
  size: BoardSize;
  info: string;
}

export interface RecentRequestCardProps {
  request: FlatTrackRow;
}
