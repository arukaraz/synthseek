"use client";

import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SparkLine } from "@components/MiniChart";
import { WidgetFrame } from "@components/WidgetFrame";
import { useListeningSummary } from "@hooks/api/queries/analytics/useListeningSummary";

import { SUMMARY_WINDOW_DAYS } from "./constants";
import { deltaOf, windowTotals } from "./helpers";
import { MetricValue } from "./MetricValue";

export function PlaysTile() {
  const { t } = useTranslation("settings");
  const summary = useListeningSummary();
  const plays = summary.data?.playsByDay ?? [];
  const totals = windowTotals(plays, SUMMARY_WINDOW_DAYS);

  return (
    <WidgetFrame
      compactOnPhone
      icon={Play}
      title={t("overview.analytics.plays.title")}
      subtitle={t("overview.analytics.plays.subtitle")}
      info={t("overview.analytics.plays.info")}
      titleId="analytics-plays"
      loading={summary.isLoading}
      note={summary.isError ? t("overview.analytics.loadError") : null}
    >
      <MetricValue value={totals.current.toLocaleString()} delta={deltaOf(totals.current, totals.previous)} />
      <SparkLine values={plays} />
    </WidgetFrame>
  );
}
