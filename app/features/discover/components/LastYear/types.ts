import type { LastYearTrack } from "@hooks/api/queries/analytics/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

export interface LastYearProps {
  size: BoardSize;
  info: string;
}

export interface LastYearRowProps {
  track: LastYearTrack;
  rank: number;
}
