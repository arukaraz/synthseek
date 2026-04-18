import { RequestStatus, type SubscriptionEvent } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";
import { matchesEvent, applyEventToTrack } from "./shared";

type Utils = ReturnType<typeof trpc.useUtils>;

export function updatePlaylistCache(event: SubscriptionEvent, utils: Utils): void {
  utils.requests.getAllPlaylists.setData(undefined, (old) => {
    if (!old) return old;

    return old.map((playlist) => {
      let updated = false;

      const updatedTracks = playlist.tracks.map((pt) => {
        if (matchesEvent(pt.TrackRequest, event)) {
          updated = true;
          return { ...pt, TrackRequest: applyEventToTrack(pt.TrackRequest, event) };
        }
        return pt;
      });

      if (updated) {
        const completedCount = updatedTracks.filter(
          (pt) => pt.TrackRequest.status === RequestStatus.enum.complete
        ).length;

        return {
          ...playlist,
          tracks: updatedTracks,
          completed_tracks: completedCount,
          updated_at: new Date(),
        };
      }

      return playlist;
    });
  });
}
