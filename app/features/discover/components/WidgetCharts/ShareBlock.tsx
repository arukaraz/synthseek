"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";

import type { WidgetBlockProps } from "../CustomWidget/types";
import { CHART_LIMITS } from "./constants";
import { slicesOf } from "./helpers";
import {
  chartBody,
  legendLabel,
  legendValue,
  shareLegend,
  shareRow,
  shareSegment,
  shareStrip,
  shareTone,
  shareVars,
  swatch,
} from "./styles";

export function ShareBlock({ points, size, accent }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const slices = slicesOf(points, CHART_LIMITS.share[size]);

  return (
    <div data-acc={accent} className={chartBody()}>
      <div className={shareStrip()} aria-hidden>
        {slices.map((slice) => (
          <span
            key={slice.key}
            className={cn(shareSegment(), shareTone({ tone: slice.tone }))}
            style={shareVars(slice.share)}
            title={`${slice.label} ${slice.text}`}
          />
        ))}
      </div>
      <ul className={shareLegend()} aria-label={t("customWidget.share.label")}>
        {slices.map((slice) => (
          <li key={slice.key} className={shareRow()}>
            <span className={cn(swatch(), shareTone({ tone: slice.tone }))} aria-hidden />
            <span className={legendLabel()}>{slice.label}</span>
            <span className={legendValue()}>{slice.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
