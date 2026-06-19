import type { ActivityDividerState } from "@components/ui/ActivityDivider";
import { useGetPlexSyncAllState, usePlexSyncAllProgress, useQueueStatus, useTrackRequests } from "@hooks/api";
import i18n from "@locale";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { hasActiveDownload } from "../helpers";

interface ActivityStateResult {
  state: ActivityDividerState;
  synced: number;
  total: number;
}

export function useActivityState(): ActivityStateResult {
  const { data: items } = useTrackRequests();
  const { data: syncState } = useGetPlexSyncAllState();
  const { data: queueState } = useQueueStatus();
  const progress = usePlexSyncAllProgress();

  const isSyncing = progress ? progress.phase !== "complete" : (syncState?.running ?? false);
  const synced = progress?.synced ?? syncState?.synced ?? 0;
  const total = progress?.total ?? syncState?.total ?? 0;
  const downloading = hasActiveDownload(items);

  const completedRef = useRef(false);
  useEffect(() => {
    if (progress?.phase === "complete" && !completedRef.current) {
      completedRef.current = true;
      const failed = progress.failed ?? 0;
      if (progress.synced > 0) {
        toast.success(i18n.t("mutations:requests.playlistsSyncedPlex", { count: progress.synced, failed }));
      } else {
        toast.info(i18n.t("mutations:requests.noPlaylistsToSyncPlex"));
      }
    }
    if (progress?.phase === "start") {
      completedRef.current = false;
    }
  }, [progress]);

  const isPaused = queueState?.isPaused ?? false;
  const state: ActivityDividerState = isSyncing
    ? "plex-sync"
    : isPaused
      ? "paused"
      : downloading
        ? "in-progress"
        : "idle";

  return { state, synced, total };
}
