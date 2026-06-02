import type { FlatTrackRow } from "@features/requests/types";

export interface RecentRequestCardProps {
  request: FlatTrackRow;
}

export interface RecentRequestsStripProps {
  items: FlatTrackRow[];
}
