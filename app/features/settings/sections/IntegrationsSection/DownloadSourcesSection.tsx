"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { SlskdCard } from "./SlskdCard";
import { UsenetCard } from "./UsenetCard";
import { YtdlpCard } from "./YtdlpCard";

export function DownloadSourcesSection() {
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
        <span className="text-sm text-red-400">
          {t("common.loadFailedWithReason", { reason: error?.message ?? t("common.unknownError") })}
        </span>
      </div>
    );
  }

  return (
    <div className={sectionGrid()}>
      <SlskdCard
        initial={{
          connection: data.connections.slskd,
          search: data.engine.search,
          timeouts: data.engine.timeouts,
        }}
      />
      <UsenetCard initial={data.downloadSources} />
      <YtdlpCard initial={data.downloadSources} />
    </div>
  );
}
