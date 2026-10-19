import type { FlatTrackRow } from "@features/requests/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

export type RequestCardLayout = "tile" | "row";

export interface RecentRequestsProps {
  size: BoardSize;
  info: string;
}

export interface RecentRequestCardProps {
  request: FlatTrackRow;
  layout: RequestCardLayout;
}

export interface RecentRequestsSkeletonProps {
  layout: RequestCardLayout;
}
