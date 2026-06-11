import type { PlexSyncAllProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { emitPlexSyncAll } from "../../shared/plexSyncAll";
import {
  buildDockItems,
  hasDockJob,
  isDockJobDismissed,
  markDockItem,
  seedDockJob,
  setDockJobStatus,
  terminalStatusFromCounts,
} from "../../shared/progressDock";
import type { DockItem } from "../../shared/progressDock";

type Utils = ReturnType<typeof trpc.useUtils>;

const PLEX_SYNC_DOCK_ID = "plex-sync";

function anonymousItems(total: number): DockItem[] {
  return Array.from({ length: Math.max(total, 0) }, (_, index) => ({
    key: `plex-${index}`,
    name: "",
    state: "pending",
  }));
}

function seedFromStart(event: PlexSyncAllProgressPayload): void {
  seedDockJob({
    id: PLEX_SYNC_DOCK_ID,
    kind: "plex-sync",
    items: buildDockItems((event.items ?? []).map((item) => ({ key: item.id, name: item.name }))),
    status: "running",
  });
}

function seedFromLateJoin(event: PlexSyncAllProgressPayload): void {
  seedDockJob({
    id: PLEX_SYNC_DOCK_ID,
    kind: "plex-sync",
    items: anonymousItems(event.total),
    status: "running",
  });
}

function driveDock(event: PlexSyncAllProgressPayload): void {
  if (event.phase === "start") {
    seedFromStart(event);
    return;
  }

  if (!hasDockJob(PLEX_SYNC_DOCK_ID)) {
    if (isDockJobDismissed(PLEX_SYNC_DOCK_ID)) return;
    seedFromLateJoin(event);
  }

  if (event.phase === "progress") {
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

  driveDock(event);

  if (event.phase === "complete") {
    void utils.requests.getAll.invalidate();
  }
}
