"use client";

import { useTranslation } from "react-i18next";

import { HeatGrid, weekdayLabels } from "@components/MiniChart";

import { compactCount } from "../helpers";
import type { WidgetBlockProps } from "../CustomWidget/types";
import { heatPeakText, weekdayTotalsOf } from "./helpers";
import {
  barVars,
  chartBody,
  chartCaption,
  legendValue,
  weekdayFill,
  weekdayList,
  weekdayRow,
  weekdayTrack,
} from "./styles";

export function HeatmapBlock({ cells, size, accent }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const weekdays = weekdayLabels();
  const peak = heatPeakText(cells, weekdays);

  return (
    <div data-acc={accent} className={chartBody()}>
      {size === "S" ? (
        <ul className={weekdayList()} aria-label={t("customWidget.heatmap.days")}>
          {weekdayTotalsOf(cells, weekdays).map((total) => (
            <li key={total.day} className={weekdayRow()}>
              <span className={chartCaption()}>{total.day}</span>
              <span className={weekdayTrack()}>
                <span className={weekdayFill()} style={barVars(total.share)} />
              </span>
              <span className={legendValue()}>{total.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <HeatGrid
          cells={cells}
          weekdays={weekdays}
          tone="accent"
          label={t("customWidget.heatmap.label")}
          cellTitle={(day, hour, count) => t("customWidget.heatmap.cell", { day, hour, value: compactCount(count) })}
          hourLabel={(hour) => t("customWidget.heatmap.hour", { hour })}
        />
      )}
      {peak ? <span className={chartCaption()}>{peak}</span> : null}
    </div>
  );
}
