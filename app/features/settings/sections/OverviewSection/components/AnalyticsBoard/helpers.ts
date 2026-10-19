import i18n from "@locale";

import type { QualityFormat, ScrobbleHealth } from "@hooks/api/queries/analytics/types";

import {
  DAY_MS,
  HEAT_FLOOR,
  REFERENCE_MONDAY_UTC,
  SPARK_BAR_GAP,
  SPARK_BAR_MIN,
  SPARK_HEIGHT,
  SPARK_INSET,
  SPARK_WIDTH,
  WEEKDAY_COUNT,
} from "./constants";
import type { ClockPeak, Delta, QualityRow, SparkBar, SparkPath, WindowTotals } from "./types";

export function totalOf(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function windowTotals(values: readonly number[], window: number): WindowTotals {
  return { current: totalOf(values.slice(-window)), previous: totalOf(values.slice(-2 * window, -window)) };
}

export function formatPercent(ratio: number, signed = false): string {
  return new Intl.NumberFormat(i18n.language, {
    style: "percent",
    maximumFractionDigits: 0,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(ratio);
}

export function deltaOf(current: number, previous: number): Delta | null {
  if (previous === 0) {
    return current === 0 ? null : { tone: "muted", label: i18n.t("settings:overview.analytics.deltaNew") };
  }
  const change = Math.round(((current - previous) / previous) * 100) / 100;
  return { tone: change > 0 ? "success" : change < 0 ? "danger" : "muted", label: formatPercent(change, true) };
}

export function listeningTimeLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return i18n.t("settings:overview.analytics.listeningTime.value", { hours, minutes });
}

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

export function landedShare(completed: number, failed: number): number | null {
  const total = completed + failed;
  return total === 0 ? null : completed / total;
}

export function qualityRows(formats: readonly QualityFormat[], total: number, limit: number): QualityRow[] {
  return [...formats]
    .sort((left, right) => right.count - left.count)
    .slice(0, limit)
    .map((entry) => ({ format: entry.format, count: entry.count, share: total > 0 ? entry.count / total : 0 }));
}

export function activeDeliveries(services: readonly ScrobbleHealth[]): ScrobbleHealth[] {
  return services.filter((service) => service.sent + service.pending + service.failed > 0);
}

export function clockPeak(cells: readonly (readonly number[])[]): ClockPeak | null {
  let peak: ClockPeak | null = null;
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
  return Array.from({ length: WEEKDAY_COUNT }, (_, index) => format.format(REFERENCE_MONDAY_UTC + index * DAY_MS));
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
