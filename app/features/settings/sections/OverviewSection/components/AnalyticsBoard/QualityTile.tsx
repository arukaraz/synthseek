"use client";

import { Disc3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ProgressBar } from "@components/ui/ProgressBar";
import { useQualityMix } from "@hooks/api/queries/analytics/useQualityMix";

import { AnalyticsTile } from "./AnalyticsTile";
import { QUALITY_ROW_LIMIT } from "./constants";
import { formatPercent, qualityRows } from "./helpers";
import { qualityFormat, qualityList, qualityNumber, qualityRow } from "./styles";

export function QualityTile() {
  const { t } = useTranslation("settings");
  const quality = useQualityMix();
  const total = quality.data?.total ?? 0;
  const rows = qualityRows(quality.data?.formats ?? [], total, QUALITY_ROW_LIMIT);

  return (
    <AnalyticsTile
      icon={Disc3}
      title={t("overview.analytics.quality.title")}
      subtitle={t("overview.analytics.quality.subtitle")}
      info={t("overview.analytics.quality.info")}
      titleId="analytics-quality"
      loading={quality.isLoading}
      note={
        quality.isError ? t("overview.analytics.loadError") : total === 0 ? t("overview.analytics.quality.empty") : null
      }
    >
      <ul className={qualityList()}>
        {rows.map((row) => (
          <li key={row.format} className={qualityRow()}>
            <span className={qualityFormat()}>{row.format}</span>
            <ProgressBar progress={row.share * 100} size="sm" />
            <span className={qualityNumber()}>{formatPercent(row.share)}</span>
            <span className={qualityNumber()}>{row.count.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </AnalyticsTile>
  );
}
