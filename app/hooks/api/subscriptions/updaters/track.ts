import type { SubscriptionEvent, TrackRequestWithAlbum } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";
import { matchesEvent, applyEventToTrack } from "./shared";

type Utils = ReturnType<typeof trpc.useUtils>;

export function updateTrackCache(event: SubscriptionEvent, utils: Utils): void {
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;

    return old.map((track): TrackRequestWithAlbum => {
      if (matchesEvent(track, event)) {
        return applyEventToTrack(track, event);
      }
      return track;
    });
  });
}
