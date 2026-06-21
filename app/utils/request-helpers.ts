import { ContentType, ReclaimOutcome, type TrackRequest } from "@api/__generated__/types";
import { toast } from "sonner";

import i18n from "@locale";

type ReclaimKind = "download" | "album" | "playlist";

const RECLAIM_KIND_KEYS: Record<
  ReclaimKind,
  "requests.reclaim.download" | "requests.reclaim.album" | "requests.reclaim.playlist"
> = {
  download: "requests.reclaim.download",
  album: "requests.reclaim.album",
  playlist: "requests.reclaim.playlist",
};

export function isSingleTrackRequest(tracks: TrackRequest[]): boolean {
  if (tracks.length !== 1) return false;

  const track = tracks[0];
  return track.request_type === ContentType.enum.track;
}

export function notifyReclaimOutcome(args: { outcome: ReclaimOutcome; kind: ReclaimKind; itemName: string }) {
  const { outcome, kind, itemName } = args;
  const noun = i18n.t(`mutations:${RECLAIM_KIND_KEYS[kind]}`);
  switch (outcome) {
    case ReclaimOutcome.enum.created:
      toast.success(i18n.t("mutations:requests.reclaim.startedTitle", { kind: noun }), {
        description: i18n.t("mutations:requests.reclaim.startedDescription", { itemName }),
      });
      return;
    case ReclaimOutcome.enum.already_complete:
      toast.info(i18n.t("mutations:requests.reclaim.alreadyCompleteTitle", { kind: noun }), { description: itemName });
      return;
    case ReclaimOutcome.enum.already_in_progress:
      toast.info(i18n.t("mutations:requests.reclaim.alreadyInProgressTitle", { kind: noun }), {
        description: itemName,
      });
      return;
    case ReclaimOutcome.enum.requeued:
      toast.success(i18n.t("mutations:requests.reclaim.requeuedTitle", { kind: noun }), {
        description: i18n.t("mutations:requests.reclaim.requeuedDescription", { itemName }),
      });
      return;
  }
}
