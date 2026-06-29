import { trpc } from "@utils/trpc";
import { useEffect } from "react";

import { correlateRequestDockJob, findRunningRequestJobId, seedRequestDockJob } from "./shared/progressDock";

export function useRehydrateRequestDock(): void {
  const { data } = trpc.requests.getPopulatingPlaylists.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!data) return;
    for (const playlist of data) {
      if (findRunningRequestJobId(playlist.playlistId)) continue;
      const jobId = seedRequestDockJob({ name: playlist.name, trackCount: playlist.totalTracks });
      correlateRequestDockJob(jobId, playlist.playlistId);
    }
  }, [data]);
}
