"use client";

import { useTranslation } from "react-i18next";

import { useLibraryScanStatus } from "@hooks/api/queries/useLibraryScanStatus";
import { useMaintenanceCounts } from "@hooks/api/queries/useMaintenanceCounts";

import { tileGrid } from "../styles";
import { AttentionTile } from "./AttentionTile";

export function AttentionTiles() {
  const { t } = useTranslation("settings");
  const counts = useMaintenanceCounts(true);
  const scan = useLibraryScanStatus();

  return (
    <div className={tileGrid()}>
      <AttentionTile
        title={t("shell.tabs.maintenance.review")}
        count={counts.data?.review ?? 0}
        caption={t("overview.tiles.review")}
        href="/settings/maintenance/review"
      />
      <AttentionTile
        title={t("shell.tabs.maintenance.duplicates")}
        count={counts.data?.duplicates ?? 0}
        caption={t("overview.tiles.duplicates")}
        href="/settings/maintenance/duplicates"
      />
      <AttentionTile
        title={t("shell.tabs.maintenance.quarantine")}
        count={counts.data?.quarantine ?? 0}
        caption={t("overview.tiles.quarantine")}
        href="/settings/maintenance/quarantine"
      />
      <AttentionTile
        title={t("overview.tiles.filesToReviewTitle")}
        count={scan.data?.inventory.reviewFiles ?? 0}
        caption={t("overview.tiles.filesToReview")}
        href="/settings/library/scan"
      />
    </div>
  );
}
