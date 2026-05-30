import type { LastfmScrobble } from "@features/discovery-integrations/types";

export type EmptyReason = "error" | "disabled" | "no-username" | "no-data";

export interface RecentScrobblesEmptyProps {
  reason: EmptyReason;
}

export interface RecentScrobblesRailProps {
  scrobbles: LastfmScrobble[];
}

export interface RecentScrobbleNodeProps {
  scrobble: LastfmScrobble;
}
