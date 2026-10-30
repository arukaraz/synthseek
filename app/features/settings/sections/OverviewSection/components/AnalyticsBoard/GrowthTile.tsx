"use client";

import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SparkLine } from "@components/MiniChart";
import { WidgetFrame } from "@components/WidgetFrame";
import { useLibraryGrowth } from "@hooks/api/queries/analytics/useLibraryGrowth";

import { totalOf } from "./helpers";
import { axisRow, caption } from "./styles";

export function GrowthTile() {
  const { t } = useTranslation("settings");
  const growth = useLibraryGrowth();
  const weeks = growth.data?.addedByWeek ?? [];
  const total = totalOf(weeks);

  return (
    <WidgetFrame
      icon={TrendingUp}
      title={t("overview.analytics.growth.title")}
      subtitle={t("overview.analytics.growth.subtitle")}
      info={t("overview.analytics.growth.info")}
      titleId="analytics-growth"
      loading={growth.isLoading}
      note={
        growth.isError ? t("overview.analytics.loadError") : total === 0 ? t("overview.analytics.growth.empty") : null
      }
    >
      <p className={caption()}>{t("overview.analytics.growth.total", { count: total, weeks: weeks.length })}</p>
      <SparkLine values={weeks} fill />
      <div className={axisRow()}>
        <span>{t("overview.analytics.growth.start", { count: weeks.length })}</span>
        <span>{t("overview.analytics.growth.end")}</span>
      </div>
    </WidgetFrame>
  );
}
