import type { LastfmCandidate } from "@features/discovery-integrations/types";

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export interface TopTracksEmptyProps {
  reason: EmptyReason;
}

export interface TopTrackHeroProps {
  candidate: LastfmCandidate;
}

export interface TopTracksListProps {
  candidates: LastfmCandidate[];
  startRank: number;
}

export interface TopTrackRowProps {
  candidate: LastfmCandidate;
  rank: number;
}
