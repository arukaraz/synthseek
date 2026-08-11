import type { PlexSyncAllProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { emitPlexSyncAll } from "../../shared/plexSyncAll";
import {
  hasDockJob,
  isDockJobDismissed,
  markDockItem,
  PLEX_SYNC_DOCK_ID,
  seedPlexSyncDockJob,
  setDockJobStatus,
  terminalStatusFromCounts,
} from "../../shared/progressDock";

type Utils = ReturnType<typeof trpc.useUtils>;

function driveDock(event: PlexSyncAllProgressPayload, utils: Utils): void {
  if (event.phase === "start") {
    seedPlexSyncDockJob(event.items ?? []);
    return;
  }

  if (event.phase === "progress") {
    if (!hasDockJob(PLEX_SYNC_DOCK_ID) && !isDockJobDismissed(PLEX_SYNC_DOCK_ID)) {
      void utils.requests.getPlexSyncAllItems.invalidate();
    }
    if (event.current) {
      markDockItem(PLEX_SYNC_DOCK_ID, event.current.id, event.current.ok ? "done" : "failed");
    }
    return;
  }

  setDockJobStatus(PLEX_SYNC_DOCK_ID, terminalStatusFromCounts(event.synced, event.failed ?? 0));
}

export function handlePlexSyncAllProgress(event: PlexSyncAllProgressPayload, utils: Utils): void {
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

  driveDock(event, utils);

  if (event.phase === "complete") {
    void utils.requests.getAll.invalidate();
  }
}
