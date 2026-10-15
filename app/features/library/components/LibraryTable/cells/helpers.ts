import { RequestStatus } from "@api/__generated__/types";
import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";

export function trackQueueAction(playable: boolean, presence: QueuePresence): "add" | "remove" | null {
  if (!playable) return null;
  switch (presence) {
    case "absent":
      return "add";
    case "upcoming":
      return "remove";
    case "playing":
    case "paused":
      return null;
  }
}

export function canSearchBetterQuality(item: LibraryTrackItem): boolean {
  return item.status === RequestStatus.enum.complete;
}
