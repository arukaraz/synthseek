import i18n from "@locale";

import {
  HEAT_FLOOR,
  REFERENCE_MONDAY_UTC,
  SPARK_BAR_GAP,
  SPARK_BAR_MIN,
  SPARK_HEIGHT,
  SPARK_INSET,
  SPARK_WIDTH,
  WEEKDAY_COUNT,
  WEEKDAY_MS,
} from "./constants";
import type { HeatPeak, SparkBar, SparkPath } from "./types";

export function sparkPath(values: readonly number[], width = SPARK_WIDTH, height = SPARK_HEIGHT): SparkPath {
  const max = Math.max(...values, 0);
  const min = Math.min(...values, max);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values.map((value, index) => ({
    x: index * step,
    y: height - SPARK_INSET - ((value - min) / span) * (height - 2 * SPARK_INSET),
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const endX = points.at(-1)?.x ?? 0;
  return { line, area: `${line} L${endX} ${height} L0 ${height} Z` };
}

export function sparkBars(values: readonly number[], width = SPARK_WIDTH, height = SPARK_HEIGHT): SparkBar[] {
  const max = Math.max(...values, 0) || 1;
  const slot = values.length > 0 ? width / values.length : width;
  return values.map((value, index) => {
    const barHeight = Math.max(SPARK_BAR_MIN, (value / max) * height);
    return {
      x: index * slot + SPARK_BAR_GAP / 2,
      y: height - barHeight,
      width: Math.max(slot - SPARK_BAR_GAP, SPARK_BAR_MIN),
      height: barHeight,
      last: index === values.length - 1,
    };
  });
}

export function heatPeak(cells: readonly (readonly number[])[]): HeatPeak | null {
  let peak: HeatPeak | null = null;
  for (const [day, row] of cells.entries()) {
    for (const [hour, count] of row.entries()) {
      if (count > (peak?.count ?? 0)) peak = { day, hour, count };
    }
  }
  return peak;
}

export function heatLevel(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return HEAT_FLOOR + (1 - HEAT_FLOOR) * (count / max);
}

export function weekdayLabels(): string[] {
  const format = new Intl.DateTimeFormat(i18n.language, { weekday: "short", timeZone: "UTC" });
  return Array.from({ length: WEEKDAY_COUNT }, (_, index) => format.format(REFERENCE_MONDAY_UTC + index * WEEKDAY_MS));
}
