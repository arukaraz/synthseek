"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { PlexIntegrationCard } from "./PlexIntegrationCard";

export function PlexSection() {
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
        <span className="text-sm text-red-400">{t("common.loadFailed")}</span>
      </div>
    );
  }

  return (
    <div className={sectionGrid()}>
      <PlexIntegrationCard
        initial={{
          connection: data.connections.plex,
          behavior: data.engine.plexBehavior,
          naming: data.formatting,
        }}
      />
    </div>
  );
}
