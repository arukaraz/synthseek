import type { LastfmTopTrack } from "@features/discovery-integrations/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

import type { WidgetListColumns } from "../WidgetRow/types";

export interface TopTracksProps {
  size: BoardSize;
  info: string;
}

export interface TopTracksSplit {
  hero: LastfmTopTrack | null;
  rest: LastfmTopTrack[];
  startRank: number;
}

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export interface TopTracksEmptyProps {
  reason: EmptyReason;
  info: string;
}

export interface TopTrackHeroProps {
  track: LastfmTopTrack;
}

export interface TopTracksListProps {
  tracks: LastfmTopTrack[];
  startRank: number;
  columns: WidgetListColumns;
}

export interface TopTrackRowProps {
  track: LastfmTopTrack;
  rank: number;
}
