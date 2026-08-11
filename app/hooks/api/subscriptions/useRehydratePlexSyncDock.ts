import { trpc } from "@utils/trpc";
import { useEffect } from "react";

import { hasDockJob, isDockJobDismissed, PLEX_SYNC_DOCK_ID, seedPlexSyncDockJob } from "./shared/progressDock";

export function useRehydratePlexSyncDock(): void {
  const { data } = trpc.requests.getPlexSyncAllItems.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (hasDockJob(PLEX_SYNC_DOCK_ID) || isDockJobDismissed(PLEX_SYNC_DOCK_ID)) return;
    seedPlexSyncDockJob(data);
  }, [data]);
}
