"use client";

import { useTranslation } from "react-i18next";

import { SparkLine } from "@components/MiniChart";

import type { WidgetBlockProps } from "../CustomWidget/types";
import { trendOf } from "./helpers";
import { chartAxis, chartBody, chartCaption, chartHead, chartValue } from "./styles";

export function SparklineBlock({ points, size, accent }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const trend = trendOf(points);
  if (!trend) return null;
  const first = points.at(0);

  return (
    <div
      data-acc={accent}
      className={chartBody()}
      role="img"
      aria-label={t("customWidget.chart.sparkline", { value: trend.value, label: trend.label })}
    >
      <div className={chartHead()}>
        <span className={chartValue()}>{trend.value}</span>
        <span className={chartCaption()}>{trend.label}</span>
      </div>
      <SparkLine values={trend.values} fill tone="accent" />
      {size === "S" || !first ? null : (
        <div className={chartAxis()} aria-hidden>
          <span>{first.label}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
