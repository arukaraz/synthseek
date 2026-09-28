"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { SpotifySourceCard } from "./SpotifySourceCard";

export function LibrarySourcesSection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">{t("common.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={emptyPanel()}>
        <span className="text-destructive-vivid text-sm">
          {t("common.loadFailedWithReason", { reason: error?.message ?? t("common.unknownError") })}
        </span>
      </div>
    );
  }

  return (
    <div className={sectionGrid()}>
      <SpotifySourceCard spotify={data.connections.spotify} />
    </div>
  );
}
