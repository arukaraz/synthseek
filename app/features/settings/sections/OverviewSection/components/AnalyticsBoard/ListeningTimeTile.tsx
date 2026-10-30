"use client";

import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SparkBars } from "@components/MiniChart";
import { WidgetFrame } from "@components/WidgetFrame";
import { useListeningSummary } from "@hooks/api/queries/analytics/useListeningSummary";

import { SUMMARY_WINDOW_DAYS } from "./constants";
import { deltaOf, listeningTimeLabel, windowTotals } from "./helpers";
import { MetricValue } from "./MetricValue";

export function ListeningTimeTile() {
  const { t } = useTranslation("settings");
  const summary = useListeningSummary();
  const minutes = summary.data?.minutesByDay ?? [];
  const totals = windowTotals(minutes, SUMMARY_WINDOW_DAYS);

  return (
    <WidgetFrame
      compactOnPhone
      icon={Clock}
      title={t("overview.analytics.listeningTime.title")}
      subtitle={t("overview.analytics.listeningTime.subtitle")}
      info={t("overview.analytics.listeningTime.info")}
      titleId="analytics-listening-time"
      loading={summary.isLoading}
      note={summary.isError ? t("overview.analytics.loadError") : null}
    >
      <MetricValue value={listeningTimeLabel(totals.current)} delta={deltaOf(totals.current, totals.previous)} />
      <SparkBars values={minutes.slice(-SUMMARY_WINDOW_DAYS)} />
    </WidgetFrame>
  );
}
