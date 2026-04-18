import type { AlbumWithTracks, SubscriptionEvent } from "@api/__generated__/types";
import { calculateAlbumStatus } from "@utils/request-helpers";
import type { trpc } from "@utils/trpc";
import { matchesEvent, applyEventToTrack } from "./shared";

type Utils = ReturnType<typeof trpc.useUtils>;

export function updateAlbumCache(event: SubscriptionEvent, utils: Utils): void {
  utils.requests.getAllAlbums.setData(undefined, (old) => {
    if (!old) return old;

    return old.map((album): AlbumWithTracks => {
      let albumUpdated = false;

      const updatedTracks = album.tracks.map((track) => {
        if (matchesEvent(track, event)) {
          albumUpdated = true;
          return applyEventToTrack(track, event);
        }
        return track;
      });

      if (albumUpdated) {
        const { completedCount, newStatus } = calculateAlbumStatus(updatedTracks);
        return {
          ...album,
          tracks: updatedTracks,
          status: newStatus,
          completed_tracks: completedCount,
          updated_at: new Date(),
        };
      }

      return album;
    });
  });
}
