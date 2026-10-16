"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot, emptyPanel, sectionGrid } from "../../styles";
import { EnrichmentCard } from "./EnrichmentCard";

export function MetadataSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.metadata;
  const { data, isLoading, error } = useSettings();

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      {isLoading ? (
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">{t("common.loading")}</span>
        </div>
      ) : error || !data ? (
        <div className={emptyPanel()}>
          <span className="text-sm text-red-400">{t("common.loadFailed")}</span>
        </div>
      ) : (
        <div className={sectionGrid()}>
          <EnrichmentCard initial={data.connections.enrichment} />
        </div>
      )}
    </div>
  );
}
