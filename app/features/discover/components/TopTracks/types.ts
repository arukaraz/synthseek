import type { LastfmTopTrack } from "@features/discovery-integrations/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

export interface TopTracksProps {
  size: BoardSize;
  info: string;
}

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export type HeroShape = "compact" | "tall";

export interface TopTracksEmptyProps {
  reason: EmptyReason;
  info: string;
}

export interface TopTracksSkeletonProps {
  shape: HeroShape;
}

export interface TopTrackHeroProps {
  track: LastfmTopTrack;
  shape: HeroShape;
}

export interface TopTracksListProps {
  tracks: LastfmTopTrack[];
  startRank: number;
}

export interface TopTrackRowProps {
  track: LastfmTopTrack;
  rank: number;
}
