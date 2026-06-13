"use client";

import { useRetryTrack } from "@hooks/api";
import { useCallback } from "react";

export function useLibraryTrackActions() {
  const retryTrack = useRetryTrack();

  const retryFailed = useCallback(
    (trackIds: string[]) => {
      for (const trackId of trackIds) {
        retryTrack.mutate({ trackId });
      }
    },
    [retryTrack]
  );

  return {
    retryFailed,
    isRetrying: retryTrack.isPending,
  };
}
