import { ContentType, type PlaylistUpdatePayload } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import type { trpc } from "@utils/trpc";

import { findCachedRequestListItem, patchRequestListItems } from "../../../queries/requests/requestListCache";
import { settleRequestDockJobByRequestId } from "../../shared/progressDock";
import type { DockJobStatus } from "../../shared/progressDock";
import { invalidateRequestList } from "../../shared/requestListInvalidation";

type Utils = ReturnType<typeof trpc.useUtils>;

type PopulatePhase = NonNullable<PlaylistUpdatePayload["populatePhase"]>;

const POPULATE_PHASE_DOCK_STATUS: Record<PopulatePhase, DockJobStatus> = {
  complete: "complete",
  partial: "partial",
  failed: "failed",
};

export function handlePlaylistUpdate(event: PlaylistUpdatePayload, utils: Utils, queryClient: QueryClient): void {
  if (event.populatePhase) {
    settleRequestDockJobByRequestId(event.playlistId, POPULATE_PHASE_DOCK_STATUS[event.populatePhase]);
  }

  const isEventPlaylist = (item: { contentType: ContentType; id: string }) =>
    item.contentType === ContentType.enum.playlist && item.id === event.playlistId;
  const cached = findCachedRequestListItem(queryClient, isEventPlaylist);
  if (!cached || cached.status !== event.status) invalidateRequestList({ utils, queryClient });
  if (!cached) return;
  patchRequestListItems(queryClient, (item) =>
    isEventPlaylist(item)
      ? {
          ...item,
          status: event.status,
          completed_tracks: event.completedTracks,
          total_tracks: event.totalTracks,
          updated_at: new Date(),
        }
      : item
  );
}
