import { ContentType, ReclaimOutcome, type TrackRequest } from "@api/__generated__/types";
import { toast } from "sonner";

export function isSingleTrackRequest(tracks: TrackRequest[]): boolean {
  if (tracks.length !== 1) return false;

  const track = tracks[0];
  return track.request_type === ContentType.enum.track;
}

export function notifyReclaimOutcome(args: { outcome: ReclaimOutcome; label: string; itemName: string }) {
  const { outcome, label, itemName } = args;
  switch (outcome) {
    case ReclaimOutcome.enum.created:
      toast.success(`${label} started`, { description: `${itemName} is being downloaded.` });
      return;
    case ReclaimOutcome.enum.already_complete:
      toast.info(`${label} already in your library`, { description: itemName });
      return;
    case ReclaimOutcome.enum.already_in_progress:
      toast.info(`${label} already being downloaded`, { description: itemName });
      return;
    case ReclaimOutcome.enum.requeued:
      toast.success(`${label} re-queued`, { description: `${itemName} is being retried.` });
      return;
  }
}
