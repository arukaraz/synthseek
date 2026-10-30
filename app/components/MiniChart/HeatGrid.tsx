"use client";

import { Fragment } from "react";

import { HEAT_HOUR_TICKS } from "./constants";
import { heatLevel } from "./helpers";
import { heatCell, heatDay, heatGrid, heatHour, heatVars } from "./styles";
import type { HeatGridProps } from "./types";

export function HeatGrid({ cells, weekdays, label, cellTitle, hourLabel, tone = "primary" }: HeatGridProps) {
  const max = Math.max(0, ...cells.flat());

  return (
    <div className={heatGrid()} role="img" aria-label={label}>
      {cells.map((row, day) => (
        <Fragment key={weekdays[day] ?? day}>
          <span className={heatDay()}>{weekdays[day]}</span>
          {row.map((count, hour) => (
            <span
              key={hour}
              className={heatCell({ empty: count === 0, tone })}
              style={heatVars(heatLevel(count, max))}
              title={cellTitle(weekdays[day] ?? "", hour, count)}
            />
          ))}
        </Fragment>
      ))}
      <span />
      {HEAT_HOUR_TICKS.map((hour) => (
        <span key={hour} className={heatHour()}>
          {hourLabel(hour)}
        </span>
      ))}
    </div>
  );
}
