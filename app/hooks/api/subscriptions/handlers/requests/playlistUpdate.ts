import { ContentType, type PlaylistUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

import { settleRequestDockJobByRequestId } from "../../shared/progressDock";
import type { DockJobStatus } from "../../shared/progressDock";

type Utils = ReturnType<typeof trpc.useUtils>;

type PopulatePhase = NonNullable<PlaylistUpdatePayload["populatePhase"]>;

const POPULATE_PHASE_DOCK_STATUS: Record<PopulatePhase, DockJobStatus> = {
  complete: "complete",
  partial: "partial",
  failed: "failed",
};

export function handlePlaylistUpdate(event: PlaylistUpdatePayload, utils: Utils): void {
  if (event.populatePhase) {
    settleRequestDockJobByRequestId(event.playlistId, POPULATE_PHASE_DOCK_STATUS[event.populatePhase]);
  }

  const current = utils.requests.getAll.getData();
  const exists = current?.some(
    (item) => item.contentType === ContentType.enum.playlist && item.id === event.playlistId
  );
  if (!exists) {
    void utils.requests.getAll.invalidate();
    return;
  }
  utils.requests.getAll.setData(undefined, (old) => {
    if (!old) return old;
    return old.map((item) => {
      if (item.contentType !== ContentType.enum.playlist || item.id !== event.playlistId) return item;
      return {
        ...item,
        status: event.status,
        completed_tracks: event.completedTracks,
        total_tracks: event.totalTracks,
        updated_at: new Date(),
      };
    });
  });
}
