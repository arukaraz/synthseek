"use client";

import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useDownloadOutcomes } from "@hooks/api/queries/analytics/useDownloadOutcomes";
import { formatElapsed } from "@utils/formatters";

import { formatPercent, landedShare } from "./helpers";
import { MetricValue } from "./MetricValue";
import { caption, shareVars, splitBar, splitFill } from "./styles";

export function DownloadsTile() {
  const { t } = useTranslation("settings");
  const outcomes = useDownloadOutcomes();
  const completed = outcomes.data?.completed ?? 0;
  const failed = outcomes.data?.failed ?? 0;
  const share = landedShare(completed, failed);
  const median = outcomes.data?.medianMinutes ?? null;

  return (
    <WidgetFrame
      compactOnPhone
      icon={Download}
      title={t("overview.analytics.downloads.title")}
      subtitle={t("overview.analytics.downloads.subtitle")}
      info={t("overview.analytics.downloads.info")}
      titleId="analytics-downloads"
      loading={outcomes.isLoading}
      note={
        outcomes.isError
          ? t("overview.analytics.loadError")
          : share === null
            ? t("overview.analytics.downloads.empty")
            : null
      }
    >
      <MetricValue value={formatPercent(share ?? 0)} unit={t("overview.analytics.downloads.unit")} />
      <div
        className={splitBar()}
        role="img"
        aria-label={t("overview.analytics.downloads.summary", { completed, failed })}
      >
        <div className={splitFill()} style={shareVars(share ?? 0)} />
      </div>
      {median === null ? null : (
        <p className={caption()}>
          {t("overview.analytics.downloads.median", { duration: formatElapsed(median * 60) })}
        </p>
      )}
    </WidgetFrame>
  );
}
