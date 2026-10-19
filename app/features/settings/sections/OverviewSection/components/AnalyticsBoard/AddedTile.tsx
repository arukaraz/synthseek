"use client";

import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLibraryGrowth } from "@hooks/api/queries/analytics/useLibraryGrowth";

import { AnalyticsTile } from "./AnalyticsTile";
import { deltaOf } from "./helpers";
import { MetricValue } from "./MetricValue";
import { SparkBars } from "./SparkBars";

export function AddedTile() {
  const { t } = useTranslation("settings");
  const growth = useLibraryGrowth();
  const added = growth.data?.addedLast30 ?? 0;

  return (
    <AnalyticsTile
      icon={Plus}
      title={t("overview.analytics.added.title")}
      subtitle={t("overview.analytics.added.subtitle")}
      info={t("overview.analytics.added.info")}
      titleId="analytics-added"
      loading={growth.isLoading}
      note={growth.isError ? t("overview.analytics.loadError") : null}
    >
      <MetricValue
        value={added.toLocaleString()}
        unit={t("overview.analytics.added.unit", { count: added })}
        delta={deltaOf(added, growth.data?.addedPrev30 ?? 0)}
      />
      <SparkBars values={growth.data?.addedByWeek ?? []} />
    </AnalyticsTile>
  );
}
