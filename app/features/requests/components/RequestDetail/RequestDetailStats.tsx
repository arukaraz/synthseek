"use client";

import { ACTIVE_STATUSES, ContentType, RequestStatus, UNRESOLVED_STATUSES } from "@api/__generated__/types";
import { useTranslation } from "react-i18next";
import { RequestDetailStatsCard } from "./RequestDetailStatsCard";
import { detailStatsGrid } from "./styles";
import type { RequestDetailStatsProps } from "./types";

export function RequestDetailStats({ request, tracks, isResolving }: RequestDetailStatsProps) {
  const { t } = useTranslation("requests");

  if (request.status === RequestStatus.enum.delegated) {
    return null;
  }

  const completeCount = tracks.filter((track) => track.status === RequestStatus.enum.complete).length;
  const failedCount = tracks.filter((track) =>
    (UNRESOLVED_STATUSES as readonly string[]).includes(track.status)
  ).length;
  const activeCount = tracks.filter((track) => (ACTIVE_STATUSES as readonly string[]).includes(track.status)).length;
  const hasDuplicates = request.duplicateCount > 0;
  const requestedTracks = request.requested_tracks > 0 ? request.requested_tracks : request.total_tracks;
  const missingTracks = Math.max(0, request.total_tracks - requestedTracks);
  const isPlaylist = request.contentType === ContentType.enum.playlist;

  return (
    <div className={detailStatsGrid({ columns: hasDuplicates ? 5 : 4 })}>
      <RequestDetailStatsCard
        label={t("stats.tracksLabel")}
        value={`${request.completed_tracks}/${requestedTracks}`}
        sublabel={
          missingTracks > 0
            ? t(isPlaylist ? "stats.tracksOfPlaylist" : "stats.tracksOfAlbum", {
                requested: requestedTracks,
                total: request.total_tracks,
              })
            : t("stats.tracksSublabel")
        }
      />
      <RequestDetailStatsCard
        label={t("stats.completeLabel")}
        value={isResolving ? "-" : completeCount}
        sublabel={t("stats.completeSublabel")}
        valueClassName="text-green-400"
      />
      <RequestDetailStatsCard
        label={t("stats.failedLabel")}
        value={isResolving ? "-" : failedCount}
        sublabel={t("stats.failedSublabel")}
        valueClassName="text-red-400"
      />
      <RequestDetailStatsCard
        label={t("stats.activeLabel")}
        value={isResolving ? "-" : activeCount}
        sublabel={t("stats.activeSublabel")}
        valueClassName="text-primary-400"
      />
      {hasDuplicates && (
        <RequestDetailStatsCard
          label={t("stats.duplicatesLabel")}
          value={request.duplicateCount}
          sublabel={t("stats.duplicatesSublabel")}
          valueClassName="text-fg/60"
        />
      )}
    </div>
  );
}
