"use client";

import { MAX_BULK_TRACK_IDS, useRetryTracks, useUpgradeTracks } from "@hooks/api";
import { notifyBulkTrackLimit } from "@utils/request-helpers";
import { useCallback } from "react";

export function useLibraryTrackActions() {
  const retryTracks = useRetryTracks();
  const upgradeTracks = useUpgradeTracks();
  const retryMutate = retryTracks.mutate;
  const upgradeMutate = upgradeTracks.mutate;

  const retryFailed = useCallback(
    (trackIds: string[]) => {
      if (trackIds.length === 0) return;
      if (trackIds.length > MAX_BULK_TRACK_IDS) {
        notifyBulkTrackLimit(MAX_BULK_TRACK_IDS);
        return;
      }
      retryMutate({ trackIds });
    },
    [retryMutate]
  );

  const searchBetterQuality = useCallback(
    (trackIds: string[]) => {
      if (trackIds.length === 0) return;
      if (trackIds.length > MAX_BULK_TRACK_IDS) {
        notifyBulkTrackLimit(MAX_BULK_TRACK_IDS);
        return;
      }
      upgradeMutate({ trackIds });
    },
    [upgradeMutate]
  );

  return {
    retryFailed,
    isRetrying: retryTracks.isPending,
    searchBetterQuality,
    isUpgrading: upgradeTracks.isPending,
  };
}
