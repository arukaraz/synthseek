"use client";

import { MAX_BULK_UPGRADE_TRACKS, useRetryTracks, useUpgradeTracks } from "@hooks/api";
import { notifyBulkUpgradeLimit } from "@utils/request-helpers";
import { useCallback } from "react";

export function useLibraryTrackActions() {
  const retryTracks = useRetryTracks();
  const upgradeTracks = useUpgradeTracks();

  const retryFailed = useCallback(
    (trackIds: string[]) => {
      if (trackIds.length === 0) return;
      retryTracks.mutate({ trackIds });
    },
    [retryTracks]
  );

  const searchBetterQuality = useCallback(
    (trackIds: string[]) => {
      if (trackIds.length === 0) return;
      if (trackIds.length > MAX_BULK_UPGRADE_TRACKS) {
        notifyBulkUpgradeLimit(MAX_BULK_UPGRADE_TRACKS);
        return;
      }
      upgradeTracks.mutate({ trackIds });
    },
    [upgradeTracks]
  );

  return {
    retryFailed,
    isRetrying: retryTracks.isPending,
    searchBetterQuality,
    isUpgrading: upgradeTracks.isPending,
  };
}
