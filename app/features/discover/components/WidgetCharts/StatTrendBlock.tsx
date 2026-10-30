"use client";

import { SparkBars } from "@components/MiniChart";

import { deltaText } from "../CustomWidget/helpers";
import { statDelta, statLabel, statValue } from "../CustomWidget/styles";
import type { WidgetBlockProps } from "../CustomWidget/types";
import { trendOf } from "./helpers";
import { chartBody, chartHead } from "./styles";

export function StatTrendBlock({ points, accent }: WidgetBlockProps) {
  const trend = trendOf(points);
  if (!trend) return null;
  const delta = deltaText(trend.delta);

  return (
    <div data-acc={accent} className={chartBody()}>
      <div className={chartHead()}>
        <span className={statValue()}>{trend.value}</span>
        <span className={statLabel()}>{trend.label}</span>
      </div>
      {delta ? <span className={statDelta()}>{delta}</span> : null}
      {trend.values.length > 1 ? <SparkBars values={trend.values} tone="accent" /> : null}
    </div>
  );
}
