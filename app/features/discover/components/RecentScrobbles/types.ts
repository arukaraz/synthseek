import type { ListenedTrack, ListeningProvider } from "@hooks/api/queries/analytics/types";

export type EmptyReason = "error" | "inactive" | "unlinked" | "no-data";

export type ScrobbleLayout = "timeline" | "rail";

export interface RecentScrobblesEmptyProps {
  reason: EmptyReason;
  info: string;
  provider: ListeningProvider;
}

export interface RecentScrobblesSkeletonProps {
  layout: ScrobbleLayout;
}

export interface RecentScrobblesRailProps {
  scrobbles: ListenedTrack[];
}

export interface RecentScrobblesTimelineProps {
  scrobbles: ListenedTrack[];
}

export interface RecentScrobbleNodeProps {
  scrobble: ListenedTrack;
}
