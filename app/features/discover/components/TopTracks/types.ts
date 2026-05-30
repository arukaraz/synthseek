import type { LastfmTopTrack } from "@features/discovery-integrations/types";

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export interface TopTracksEmptyProps {
  reason: EmptyReason;
}

export interface TopTrackHeroProps {
  track: LastfmTopTrack;
}

export interface TopTracksListProps {
  tracks: LastfmTopTrack[];
  startRank: number;
}

export interface TopTrackRowProps {
  track: LastfmTopTrack;
  rank: number;
}
