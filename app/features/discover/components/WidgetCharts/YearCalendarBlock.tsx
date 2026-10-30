"use client";

import { useTranslation } from "react-i18next";

import { heatVars } from "@components/MiniChart";

import { compactCount } from "../helpers";
import type { WidgetBlockProps } from "../CustomWidget/types";
import { CHART_LIMITS } from "./constants";
import { yearTotalOf, yearWeeksOf } from "./helpers";
import { StatTrendBlock } from "./StatTrendBlock";
import { chartBody, chartCaption, yearCell, yearGrid } from "./styles";

export function YearCalendarBlock(props: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const { points, size, accent } = props;
  if (size === "S") return <StatTrendBlock {...props} />;
  const weeks = yearWeeksOf(points, CHART_LIMITS.yearWeeks[size]);
  const total = t("customWidget.yearCalendar.total", { value: compactCount(yearTotalOf(points)) });

  return (
    <div data-acc={accent} className={chartBody()}>
      <div className={yearGrid()} role="img" aria-label={total}>
        {weeks.flatMap((week, column) =>
          week.map((cell, row) =>
            cell ? (
              <span
                key={cell.key}
                className={yearCell({ state: cell.level > 0 ? "filled" : "empty" })}
                style={heatVars(cell.level)}
                title={cell.title}
              />
            ) : (
              <span key={`blank-${column}-${row}`} className={yearCell({ state: "blank" })} />
            )
          )
        )}
      </div>
      <span className={chartCaption()}>{total}</span>
    </div>
  );
}
