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
  const cancelledCount = tracks.filter((t) => t.status === RequestStatus.enum.cancelled).length;
  const processingCount = tracks.filter((t) => isProcessingStatus(t.status)).length;
  const totalTracks = tracks.length;
  const isSingleTrack = isSingleTrackRequest(tracks);
  const terminalCount = completedCount + failedCount + cancelledCount;

  let newStatus: RequestStatus = RequestStatus.enum.queued;
  let completedAt: Date | null = null;

  if (completedCount === totalTracks && totalTracks > 0) {
    newStatus = RequestStatus.enum.complete;
    completedAt = new Date();
  } else if (terminalCount === totalTracks && totalTracks > 0) {
    if (cancelledCount === totalTracks) {
      newStatus = RequestStatus.enum.cancelled;
    } else if (failedCount + cancelledCount === totalTracks) {
      newStatus = RequestStatus.enum.failed;
    } else if (isSingleTrack) {
      newStatus = failedCount > 0 ? RequestStatus.enum.failed : RequestStatus.enum.cancelled;
    } else {
      newStatus = RequestStatus.enum.partially_complete;
    }
    completedAt = new Date();
  } else if (processingCount > 0 || completedCount > 0) {
    newStatus = RequestStatus.enum.in_progress;
  } else {
    newStatus = RequestStatus.enum.queued;
  }

  return { completedCount, failedCount, totalTracks, newStatus, completedAt };
}
