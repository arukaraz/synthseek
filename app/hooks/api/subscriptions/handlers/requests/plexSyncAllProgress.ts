import type { PlexSyncAllProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { isForeignJobEvent } from "../../shared/eventOwnership";
import { emitPlexSyncAll } from "../../shared/plexSyncAll";
import {
  hasDockJob,
  isDockJobDismissed,
  isDockJobRunning,
  markDockItem,
  PLEX_SYNC_DOCK_ID,
  seedPlexSyncDockJob,
  setDockJobStatus,
  terminalStatusFromCounts,
} from "../../shared/progressDock";
import { invalidateRequestListNow } from "../../shared/requestListInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

function driveDock(event: PlexSyncAllProgressPayload, utils: Utils, viewerId: string | null): void {
  const isForeignRun = isForeignJobEvent(event.userId, viewerId);

  if (event.phase === "start") {
    if (!isForeignRun) seedPlexSyncDockJob(event.items ?? []);
    return;
  }

  if (event.phase === "progress") {
    if (!isForeignRun && !hasDockJob(PLEX_SYNC_DOCK_ID) && !isDockJobDismissed(PLEX_SYNC_DOCK_ID)) {
      void utils.requests.getPlexSyncAllItems.invalidate();
    }
    if (event.current && isDockJobRunning(PLEX_SYNC_DOCK_ID)) {
      markDockItem(PLEX_SYNC_DOCK_ID, event.current.id, event.current.ok ? "done" : "failed");
    }
    return;
  }

  if (!isDockJobRunning(PLEX_SYNC_DOCK_ID)) return;

  setDockJobStatus(PLEX_SYNC_DOCK_ID, terminalStatusFromCounts(event.synced, event.failed ?? 0));
}

export function handlePlexSyncAllProgress(
  event: PlexSyncAllProgressPayload,
  utils: Utils,
  viewerId: string | null
): void {
  emitPlexSyncAll({
    phase: event.phase,
    synced: event.synced,
    total: event.total,
    failed: event.failed,
  });

  utils.requests.getPlexSyncAllState.setData(undefined, {
    running: event.phase !== "complete",
    synced: event.synced,
    total: event.total,
  });

  driveDock(event, utils, viewerId);

  if (event.phase === "complete") {
    invalidateRequestListNow(utils);
  }
}
