"use client";

import { useTranslation } from "react-i18next";

import type { WidgetBlockProps } from "../CustomWidget/types";
import { CHART_LIMITS } from "./constants";
import { pairsOf } from "./helpers";
import {
  barVars,
  chartBody,
  compareBar,
  compareBars,
  compareKey,
  compareLegend,
  compareLine,
  compareList,
  compareRow,
  compareSwatch,
  legendLabel,
  legendValue,
} from "./styles";

export function CompareBlock({ points, size, accent }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const pairs = pairsOf(points, CHART_LIMITS.compare[size]);

  return (
    <div data-acc={accent} className={chartBody()}>
      <div className={compareLegend()}>
        <span className={compareKey()}>
          <span className={compareSwatch({ period: "current" })} aria-hidden />
          {t("customWidget.compare.current")}
        </span>
        <span className={compareKey()}>
          <span className={compareSwatch({ period: "previous" })} aria-hidden />
          {t("customWidget.compare.previous")}
        </span>
      </div>
      <ul className={compareList()}>
        {pairs.map((pair) => (
          <li
            key={pair.key}
            className={compareRow()}
            aria-label={t("customWidget.compare.row", {
              label: pair.label,
              current: pair.currentText,
              previous: pair.previousText,
            })}
          >
            <span className={legendLabel()}>{pair.label}</span>
            <span className={compareBars()} aria-hidden>
              <span className={compareLine()}>
                <span className={compareBar({ period: "current" })} style={barVars(pair.currentShare)} />
                <span className={legendValue()}>{pair.currentText}</span>
              </span>
              <span className={compareLine()}>
                <span className={compareBar({ period: "previous" })} style={barVars(pair.previousShare)} />
                <span className={legendValue()}>{pair.previousText}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
