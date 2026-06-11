import type { PlexSyncAllProgressPayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { emitPlexSyncAll } from "../../shared/plexSyncAll";

type Utils = ReturnType<typeof trpc.useUtils>;

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

  if (event.phase === "complete") {
    void utils.requests.getAll.invalidate();
  }
}
