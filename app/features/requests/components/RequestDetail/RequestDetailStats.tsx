"use client";

import { ACTIVE_STATUSES, RequestStatus, UNRESOLVED_STATUSES } from "@api/__generated__/types";
import { useTranslation } from "react-i18next";
import { RequestDetailStatsCard } from "./RequestDetailStatsCard";
import { detailStatsGrid } from "./styles";
import type { RequestDetailStatsProps } from "./types";

export function RequestDetailStats({ request }: RequestDetailStatsProps) {
  const { t } = useTranslation("requests");
  const tracks = request.tracks ?? [];
  const completeCount = tracks.filter((track) => track.status === RequestStatus.enum.complete).length;
  const failedCount = tracks.filter((track) =>
    (UNRESOLVED_STATUSES as readonly string[]).includes(track.status)
  ).length;
  const activeCount = tracks.filter((track) => (ACTIVE_STATUSES as readonly string[]).includes(track.status)).length;

  return (
    <div className={detailStatsGrid()}>
      <RequestDetailStatsCard
        label={t("stats.tracksLabel")}
        value={`${request.completed_tracks}/${request.total_tracks}`}
        sublabel={t("stats.tracksSublabel")}
      />
      <RequestDetailStatsCard
        label={t("stats.completeLabel")}
        value={completeCount}
        sublabel={t("stats.completeSublabel")}
        valueClassName="text-green-400"
      />
      <RequestDetailStatsCard
        label={t("stats.failedLabel")}
        value={failedCount}
        sublabel={t("stats.failedSublabel")}
        valueClassName="text-red-400"
      />
      <RequestDetailStatsCard
        label={t("stats.activeLabel")}
        value={activeCount}
        sublabel={t("stats.activeSublabel")}
        valueClassName="text-primary-400"
      />
    </div>
  );
}
