import type { LastfmCandidate } from "@features/discovery-integrations/types";

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export interface RecentScrobblesEmptyProps {
  reason: EmptyReason;
}

export interface RecentScrobblesRailProps {
  candidates: LastfmCandidate[];
}

export interface RecentScrobbleNodeProps {
  candidate: LastfmCandidate;
}
