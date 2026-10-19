"use client";

import { History } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useDecades } from "@hooks/api/queries/analytics/useDecades";

import { barVars, decadeBar, decadeChart, decadeColumn, decadeLabel, decadeTrack, decadeValue } from "./styles";

export function DecadesTile() {
  const { t } = useTranslation("settings");
  const decades = useDecades();
  const rows = decades.data ?? [];
  const max = Math.max(0, ...rows.map((row) => row.albums));

  return (
    <WidgetFrame
      icon={History}
      title={t("overview.analytics.decades.title")}
      subtitle={t("overview.analytics.decades.subtitle")}
      info={t("overview.analytics.decades.info")}
      titleId="analytics-decades"
      loading={decades.isLoading}
      note={
        decades.isError
          ? t("overview.analytics.loadError")
          : rows.length === 0
            ? t("overview.analytics.decades.empty")
            : null
      }
    >
      <div className={decadeChart()}>
        {rows.map((row) => (
          <div key={row.decade} className={decadeColumn()}>
            <div className={decadeTrack()}>
              <span className={decadeValue()}>{row.albums.toLocaleString()}</span>
              <div
                className={decadeBar({ peak: row.albums === max })}
                style={barVars(max > 0 ? row.albums / max : 0)}
              />
            </div>
            <span className={decadeLabel()}>{t("overview.analytics.decades.label", { decade: row.decade })}</span>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}
