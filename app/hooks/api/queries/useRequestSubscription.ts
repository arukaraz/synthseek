import {
  type TrackRequest,
  type AlbumWithTracks,
  type TrackRequestWithAlbum,
  type SubscriptionEvent,
  RequestStatus,
} from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { useRef } from "react";
import { calculateAlbumStatus } from "@utils/request-helpers";

const LIBRARY_AFFECTING_STATUSES = [
  RequestStatus.enum.complete,
  RequestStatus.enum.failed,
  RequestStatus.enum.cancelled,
];

export function useRequestSubscription() {
  const utils = trpc.useUtils();
  const reconnectAttemptsRef = useRef(0);
  const lastEventRef = useRef<Map<string, number>>(new Map());

  trpc.requests.onUpdate.useSubscription(undefined, {
    onStarted: () => {
      reconnectAttemptsRef.current = 0;
    },
    onData: (event: SubscriptionEvent) => {
      const eventKey = `${event.requestId}-${event.status}-${event.progress}`;
      const lastTimestamp = lastEventRef.current.get(eventKey);

      if (lastTimestamp && Date.now() - lastTimestamp < 1000) {
        return;
      }

      lastEventRef.current.set(eventKey, Date.now());

      if (lastEventRef.current.size > 100) {
        const oldestKey = Array.from(lastEventRef.current.keys())[0];
        lastEventRef.current.delete(oldestKey);
      }

      utils.requests.getAll.setData(undefined, (old) => {
        if (!old) return old;

        return old.map((track): TrackRequestWithAlbum => {
          const isMatch = track.id === event.requestId || track.slskd_request_id === event.requestId;

          if (isMatch) {
            return {
              ...track,
              status: event.status,
              progress: event.progress ?? track.progress,
              error: event.status === RequestStatus.enum.failed ? (event.error ?? null) : null,
              updated_at: new Date(),
            };
          }
          return track;
        });
      });

      utils.requests.getAllAlbums.setData(undefined, (old) => {
        if (!old) return old;

        return old.map((album): AlbumWithTracks => {
          let albumUpdated = false;

          const updatedTracks = album.tracks.map((track): TrackRequest => {
            const isMatch = track.id === event.requestId || track.slskd_request_id === event.requestId;

            if (isMatch) {
              albumUpdated = true;
              return {
                ...track,
                status: event.status,
                progress: event.progress ?? track.progress,
                error: event.status === RequestStatus.enum.failed ? (event.error ?? null) : null,
                updated_at: new Date(),
              };
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

      if (LIBRARY_AFFECTING_STATUSES.includes(event.status as never)) {
        utils.requests.getLibrarySummary.invalidate();
      }

      reconnectAttemptsRef.current = 0;
    },
    onError: () => {
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current > 3) {
        utils.requests.getAll.invalidate();
        utils.requests.getAllAlbums.invalidate();
        reconnectAttemptsRef.current = 0;
      }
    },
  });

  return null;
}
