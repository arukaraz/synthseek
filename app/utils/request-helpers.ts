import { ContentType, RequestStatus, type TrackRequest, type AlbumStatusResult } from "@api/__generated__/types";
import { isProcessingStatus } from "@utils/status-helpers";

export function isSingleTrackRequest(tracks: TrackRequest[]): boolean {
  if (tracks.length !== 1) return false;

  const track = tracks[0];
  return track.request_type === ContentType.enum.track;
}

export function calculateAlbumStatus(tracks: TrackRequest[]): AlbumStatusResult {
  const completedCount = tracks.filter((t) => t.status === RequestStatus.enum.complete).length;
  const failedCount = tracks.filter((t) => t.status === RequestStatus.enum.failed).length;
  const processingCount = tracks.filter((t) => isProcessingStatus(t.status)).length;
  const totalTracks = tracks.length;
  const isSingleTrack = isSingleTrackRequest(tracks);

  let newStatus: RequestStatus = RequestStatus.enum.queued;
  let completedAt: Date | null = null;

  if (completedCount === totalTracks && totalTracks > 0) {
    newStatus = RequestStatus.enum.complete;
    completedAt = new Date();
  } else if (failedCount === totalTracks && totalTracks > 0) {
    newStatus = RequestStatus.enum.failed;
    completedAt = new Date();
  } else if (completedCount > 0 && completedCount + failedCount === totalTracks && !isSingleTrack) {
    newStatus = RequestStatus.enum.partially_complete;
    completedAt = new Date();
  } else if (processingCount > 0 || completedCount > 0) {
    newStatus = RequestStatus.enum.in_progress;
    completedAt = null;
  } else {
    newStatus = RequestStatus.enum.queued;
    completedAt = null;
  }

  return {
    completedCount,
    failedCount,
    totalTracks,
    newStatus,
    completedAt,
  };
}
