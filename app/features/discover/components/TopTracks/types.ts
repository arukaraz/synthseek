import type { LastfmTopTrack } from "@features/discovery-integrations/types";

export interface TopTracksProps {
  info: string;
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
}

export interface TopTrackRowProps {
  track: LastfmTopTrack;
  rank: number;
}
