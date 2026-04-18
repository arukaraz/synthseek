import { RequestStatus, type TrackRequest, type SubscriptionEvent } from "@api/__generated__/types";

export function matchesEvent(track: { id: string; slskd_request_id: string }, event: SubscriptionEvent): boolean {
  return track.id === event.requestId || track.slskd_request_id === event.requestId;
}

export function applyEventToTrack<T extends TrackRequest>(track: T, event: SubscriptionEvent): T {
  return {
    ...track,
    status: event.status,
    progress: event.progress ?? track.progress,
    error: event.status === RequestStatus.enum.failed ? (event.error ?? null) : null,
    updated_at: new Date(),
  };
}
