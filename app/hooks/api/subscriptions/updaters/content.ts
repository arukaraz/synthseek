import type { RequestWithTracks, SubscriptionEvent } from "@api/__generated__/types";
import { calculateAlbumStatus } from "@utils/request-helpers";
import type { trpc } from "@utils/trpc";
import { matchesEvent, applyEventToTrack } from "./shared";

type Utils = ReturnType<typeof trpc.useUtils>;

export function updateContentCache(event: SubscriptionEvent, utils: Utils): void {
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;

    return old.map((item): RequestWithTracks => {
      let updated = false;

      const updatedTracks = item.tracks.map((track) => {
        if (matchesEvent(track, event)) {
          updated = true;
          return applyEventToTrack(track, event);
        }
        return track;
      });

      if (!updated) return item;

      const { completedCount, newStatus } = calculateAlbumStatus(updatedTracks);
      return {
        ...item,
        tracks: updatedTracks,
        status: newStatus,
        completed_tracks: completedCount,
        updated_at: new Date(),
      };
    });
  });
}
