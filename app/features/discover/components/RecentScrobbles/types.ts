import type { LastfmScrobble } from "@features/discovery-integrations/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export type ScrobbleLayout = "timeline" | "rail";

export interface RecentScrobblesProps {
  size: BoardSize;
  info: string;
}

export interface RecentScrobblesEmptyProps {
  reason: EmptyReason;
  info: string;
}

export interface RecentScrobblesSkeletonProps {
  layout: ScrobbleLayout;
}

export interface RecentScrobblesRailProps {
  scrobbles: LastfmScrobble[];
}

export interface RecentScrobblesTimelineProps {
  scrobbles: LastfmScrobble[];
}

export interface RecentScrobbleNodeProps {
  scrobble: LastfmScrobble;
}

export interface ScrobbleCoverProps {
  scrobble: LastfmScrobble;
  sizes: string;
}
