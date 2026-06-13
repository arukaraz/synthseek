"use client";

import { useRetryTracks } from "@hooks/api";
import { useCallback } from "react";

export function useLibraryTrackActions() {
  const retryTracks = useRetryTracks();

  const retryFailed = useCallback(
    (trackIds: string[]) => {
      if (trackIds.length === 0) return;
      retryTracks.mutate({ trackIds });
    },
    [retryTracks]
  );

  return {
    retryFailed,
    isRetrying: retryTracks.isPending,
  };
}
