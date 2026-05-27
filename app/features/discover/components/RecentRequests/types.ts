import type { FlatTrackRow } from "@features/requests/types";

export interface RecentRequestCardProps {
  request: FlatTrackRow;
}

export interface RecentRequestsHeaderProps {
  onOpen: () => void;
  limit: number;
}

export interface RecentRequestsStripProps {
  items: FlatTrackRow[];
}
