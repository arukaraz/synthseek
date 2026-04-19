import { RequestStatus, type TrackRequest, type TrackUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type Utils = ReturnType<typeof trpc.useUtils>;

function matchesTrack(track: { id: string; slskd_request_id: string }, event: TrackUpdatePayload): boolean {
  return track.id === event.requestId || track.slskd_request_id === event.requestId;
}

function applyEventToTrack<T extends TrackRequest>(track: T, event: TrackUpdatePayload): T {
  return {
    ...track,
    status: event.status,
    progress: event.progress ?? track.progress,
    error: event.status === RequestStatus.enum.failed ? (event.error ?? null) : null,
    updated_at: new Date(),
  };
}

export function handleTrackUpdate(event: TrackUpdatePayload, utils: Utils): void {
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;

    return old.map((item) => {
      let updated = false;

      const updatedTracks = item.tracks.map((track) => {
        if (matchesTrack(track, event)) {
          updated = true;
          return applyEventToTrack(track, event);
        }
        return track;
      });

      if (!updated) return item;

      return {
        ...item,
        tracks: updatedTracks,
        updated_at: new Date(),
      };
    });
  });
}
