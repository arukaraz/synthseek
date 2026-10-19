"use client";

import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { CLOCK_HOUR_TICKS } from "./constants";
import { heatLevel } from "./helpers";
import { heatCell, heatDay, heatGrid, heatHour, heatVars } from "./styles";
import type { HeatGridProps } from "./types";

export function HeatGrid({ cells, weekdays }: HeatGridProps) {
  const { t } = useTranslation("settings");
  const max = Math.max(0, ...cells.flat());

  return (
    <div className={heatGrid()} role="img" aria-label={t("overview.analytics.clock.chart")}>
      {cells.map((row, day) => (
        <Fragment key={weekdays[day] ?? day}>
          <span className={heatDay()}>{weekdays[day]}</span>
          {row.map((count, hour) => (
            <span
              key={hour}
              className={heatCell({ empty: count === 0 })}
              style={heatVars(heatLevel(count, max))}
              title={t("overview.analytics.clock.cell", { day: weekdays[day], hour, count })}
            />
          ))}
        </Fragment>
      ))}
      <span />
      {CLOCK_HOUR_TICKS.map((hour) => (
        <span key={hour} className={heatHour()}>
          {t("overview.analytics.clock.hour", { hour })}
        </span>
      ))}
    </div>
  );
}
