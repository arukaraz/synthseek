"use client";

import { useTranslation } from "react-i18next";

import type { WidgetBlockProps } from "../CustomWidget/types";
import { CHART_LIMITS } from "./constants";
import { barsOf } from "./helpers";
import { bar, barColumn, barLabel, barsChart, barTrack, barVars, chartAxis, chartBody } from "./styles";

export function BarsBlock({ shape, points, size, accent }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const series = shape === "series";
  const bars = barsOf(points, series ? CHART_LIMITS.seriesBars[size] : CHART_LIMITS.bucketBars[size], series);
  const first = bars.at(0);
  const last = bars.at(-1);

  return (
    <div data-acc={accent} className={chartBody()}>
      <ol className={barsChart()} aria-label={t("customWidget.chart.bars")}>
        {bars.map((entry) => (
          <li key={entry.key} className={barColumn()} title={entry.title} aria-label={entry.title}>
            <span className={barTrack()}>
              <span className={bar({ peak: entry.peak })} style={barVars(entry.share)} />
            </span>
            {series ? null : <span className={barLabel()}>{entry.label}</span>}
          </li>
        ))}
      </ol>
      {series && first && last ? (
        <div className={chartAxis()} aria-hidden>
          <span>{first.label}</span>
          <span>{last.label}</span>
        </div>
      ) : null}
    </div>
  );
}
