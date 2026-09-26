import type { ActivityDividerState } from "@components/ui/ActivityDivider";
import { useGetPlaylistSyncAllState, usePlaylistSyncAllProgress, useQueueStatus, useTrackRequests } from "@hooks/api";
import i18n from "@locale";
import { playbackServerName } from "@utils/playback-servers";
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
  const { data: syncState } = useGetPlaylistSyncAllState();
  const { data: queueState } = useQueueStatus();
  const progress = usePlaylistSyncAllProgress();

  const isSyncing = progress ? progress.phase !== "complete" : (syncState?.running ?? false);
  const synced = progress?.synced ?? syncState?.synced ?? 0;
  const total = progress?.total ?? syncState?.total ?? 0;
  const downloading = hasActiveDownload(items);

  const completedRef = useRef(false);
  useEffect(() => {
    if (progress?.phase === "complete" && !completedRef.current) {
      completedRef.current = true;
      const failed = progress.failed ?? 0;
      const server = playbackServerName(progress.server);
      if (progress.synced > 0) {
        toast.success(i18n.t("mutations:requests.playlistsSyncedTo", { count: progress.synced, failed, server }));
      } else {
        toast.info(i18n.t("mutations:requests.noPlaylistsToSyncTo", { server }));
      }
    }
    if (progress?.phase === "start") {
      completedRef.current = false;
    }
  }, [progress]);

  const isPaused = queueState?.isPaused ?? false;
  const state: ActivityDividerState = isSyncing
    ? "playlist-sync"
    : isPaused
      ? "paused"
      : downloading
        ? "in-progress"
        : "idle";

  return { state, synced, total };
}
