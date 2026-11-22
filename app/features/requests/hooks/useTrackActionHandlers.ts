"use client";

import type { TrackRequest } from "@api/__generated__/types";
import {
  MAX_BULK_TRACK_IDS,
  useApproveTracks,
  useCancelTrack,
  useCancelTracks,
  usePrioritizeTrack,
  usePrioritizeTracks,
  useRejectTracks,
  useRetryTrack,
  useRetryTracks,
  useSetWatch,
  useUpgradeTracks,
} from "@hooks/api";
import { confirm } from "@utils/confirm";
import { notifyBulkTrackLimit } from "@utils/request-helpers";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { BulkActionId, TrackActionId } from "../components/RequestDetail/types";

interface UseTrackActionHandlers {
  runTrackAction: (id: TrackActionId, track: TrackRequest) => void;
  runBulkAction: (id: BulkActionId, tracks: TrackRequest[]) => Promise<void>;
  rejectCount: number;
  closeReject: () => void;
  confirmReject: (reason?: string) => void;
}

export function useTrackActionHandlers(onBulkSent: () => void): UseTrackActionHandlers {
  const { t } = useTranslation("requests");
  const retryTrack = useRetryTrack();
  const cancelTrack = useCancelTrack();
  const prioritizeTrack = usePrioritizeTrack();
  const setWatch = useSetWatch();
  const approveTracks = useApproveTracks();
  const rejectTracks = useRejectTracks();
  const upgradeTracks = useUpgradeTracks();
  const retryTracks = useRetryTracks();
  const cancelTracks = useCancelTracks();
  const prioritizeTracks = usePrioritizeTracks();
  const [reject, setReject] = useState<{ ids: string[]; bulk: boolean } | null>(null);

  const cancelOne = async (track: TrackRequest) => {
    const confirmed = await confirm({
      title: t("confirm.cancelTrackTitle"),
      message: t("confirm.cancelTrackMessage", { title: track.title, artist: track.credited_artist }),
      variant: "danger",
      confirmText: t("confirm.cancelConfirm"),
      cancelText: t("confirm.cancelKeep"),
    });
    if (confirmed) cancelTrack.mutate({ trackId: track.id });
  };

  const runTrackAction = (id: TrackActionId, track: TrackRequest) => {
    switch (id) {
      case "approve":
        approveTracks.mutate({ trackIds: [track.id] });
        return;
      case "reject":
        setReject({ ids: [track.id], bulk: false });
        return;
      case "reimport":
      case "retry":
      case "requeue":
        retryTrack.mutate({ trackId: track.id });
        return;
      case "prioritize":
        prioritizeTrack.mutate({ trackId: track.id });
        return;
      case "upgrade":
        upgradeTracks.mutate({ trackIds: [track.id] });
        return;
      case "stopWatch":
        setWatch.mutate({ trackId: track.id, enabled: false });
        return;
      case "resumeWatch":
        setWatch.mutate({ trackId: track.id, enabled: true });
        return;
      case "cancel":
        void cancelOne(track);
        return;
    }
  };

  const runBulkAction = async (id: BulkActionId, tracks: TrackRequest[]) => {
    if (tracks.length > MAX_BULK_TRACK_IDS) {
      notifyBulkTrackLimit(MAX_BULK_TRACK_IDS);
      return;
    }
    const trackIds = tracks.map((track) => track.id);
    switch (id) {
      case "retry":
      case "requeue":
        retryTracks.mutate({ trackIds });
        break;
      case "prioritize":
        prioritizeTracks.mutate({ trackIds });
        break;
      case "upgrade":
        upgradeTracks.mutate({ trackIds });
        break;
      case "approve":
        approveTracks.mutate({ trackIds });
        break;
      case "reject":
        setReject({ ids: trackIds, bulk: true });
        return;
      case "cancel": {
        const confirmed = await confirm({
          title: t("confirm.cancelTracksTitle", { count: trackIds.length }),
          message: t("confirm.cancelTracksMessage", { count: trackIds.length }),
          variant: "danger",
          confirmText: t("confirm.cancelTracksConfirm", { count: trackIds.length }),
          cancelText: t("confirm.cancelKeep"),
        });
        if (!confirmed) return;
        cancelTracks.mutate({ trackIds });
        break;
      }
    }
    onBulkSent();
  };

  const confirmReject = (reason?: string) => {
    if (reject === null) return;
    rejectTracks.mutate({ trackIds: reject.ids, reason });
    if (reject.bulk) onBulkSent();
  };

  return {
    runTrackAction,
    runBulkAction,
    rejectCount: reject?.ids.length ?? 0,
    closeReject: () => setReject(null),
    confirmReject,
  };
}
