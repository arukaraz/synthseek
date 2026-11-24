import type { ListenedTrack, ListeningProvider } from "@hooks/api/queries/analytics/types";

import type { WidgetListColumns } from "../WidgetRow/types";

export type TopTrackLook = "hero" | "leader";

export interface TopTracksSplit {
  hero: ListenedTrack | null;
  rest: ListenedTrack[];
  startRank: number;
}

export type EmptyReason = "error" | "inactive" | "unlinked" | "no-data";

export interface TopTracksEmptyProps {
  reason: EmptyReason;
  info: string;
  provider: ListeningProvider;
}

export interface TopTrackHeroProps {
  track: ListenedTrack;
}

export interface TopTracksListProps {
  tracks: ListenedTrack[];
  startRank: number;
  columns: WidgetListColumns;
}

export interface TopTrackRowProps {
  track: ListenedTrack;
  rank: number;
}
