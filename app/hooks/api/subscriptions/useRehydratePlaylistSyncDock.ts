import { trpc } from "@utils/trpc";
import { useEffect } from "react";

import { hasDockJob, isDockJobDismissed, PLAYLIST_SYNC_DOCK_ID, seedPlaylistSyncDockJob } from "./shared/progressDock";

export function useRehydratePlaylistSyncDock(): void {
  const { data: items } = trpc.requests.getPlaylistSyncAllItems.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
  const { data: state } = trpc.requests.getPlaylistSyncAllState.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
  const server = state?.server ?? null;

  useEffect(() => {
    if (!items || items.length === 0 || server === null) return;
    if (hasDockJob(PLAYLIST_SYNC_DOCK_ID) || isDockJobDismissed(PLAYLIST_SYNC_DOCK_ID)) return;
    seedPlaylistSyncDockJob(server, items);
  }, [items, server]);
}
