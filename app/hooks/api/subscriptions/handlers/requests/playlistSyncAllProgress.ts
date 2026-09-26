import type { PlaylistSyncAllProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { isForeignJobEvent } from "../../shared/eventOwnership";
import { emitPlaylistSyncAll } from "../../shared/playlistSyncAll";
import {
  hasDockJob,
  isDockJobDismissed,
  isDockJobRunning,
  markDockItem,
  PLAYLIST_SYNC_DOCK_ID,
  seedPlaylistSyncDockJob,
  setDockJobStatus,
  terminalStatusFromCounts,
} from "../../shared/progressDock";
import { invalidateRequestListNow } from "../../shared/requestListInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

function driveDock(event: PlaylistSyncAllProgressPayload, utils: Utils, viewerId: string | null): void {
  const isForeignRun = isForeignJobEvent(event.userId, viewerId);

  if (event.phase === "start") {
    if (!isForeignRun) seedPlaylistSyncDockJob(event.server, event.items ?? []);
    return;
  }

  if (event.phase === "progress") {
    if (!isForeignRun && !hasDockJob(PLAYLIST_SYNC_DOCK_ID) && !isDockJobDismissed(PLAYLIST_SYNC_DOCK_ID)) {
      void utils.requests.getPlaylistSyncAllItems.invalidate();
    }
    if (event.current && isDockJobRunning(PLAYLIST_SYNC_DOCK_ID)) {
      markDockItem(PLAYLIST_SYNC_DOCK_ID, event.current.id, event.current.ok ? "done" : "failed");
    }
    return;
  }

  if (!isDockJobRunning(PLAYLIST_SYNC_DOCK_ID)) return;

  setDockJobStatus(PLAYLIST_SYNC_DOCK_ID, terminalStatusFromCounts(event.synced, event.failed ?? 0));
}

export function handlePlaylistSyncAllProgress(
  event: PlaylistSyncAllProgressPayload,
  utils: Utils,
  viewerId: string | null
): void {
  emitPlaylistSyncAll({
    server: event.server,
    phase: event.phase,
    synced: event.synced,
    total: event.total,
    failed: event.failed,
  });

  utils.requests.getPlaylistSyncAllState.setData(undefined, {
    running: event.phase !== "complete",
    server: event.server,
    synced: event.synced,
    total: event.total,
  });

  driveDock(event, utils, viewerId);

  if (event.phase === "complete") {
    invalidateRequestListNow(utils);
  }
}
