import i18n from "@locale";

import { heatLevel, heatPeak } from "@components/MiniChart";
import { calendarDateOf } from "@utils/formatters";

import type { WidgetCells, WidgetPoint } from "../CustomWidget/types";
import { compactCount, percentOf } from "../helpers";
import { CALENDAR_DAY_LENGTH, DAYS_PER_WEEK, SHARE_TONES } from "./constants";
import type { WeekdayTotal, WidgetBar, WidgetPair, WidgetSlice, WidgetTrend, YearCell, YearWeek } from "./types";

function pointTitle(point: WidgetPoint): string {
  return i18n.t("discover:customWidget.chart.point", { label: point.label, value: point.text });
}

export function barsOf(points: readonly WidgetPoint[], limit: number, trailing: boolean): WidgetBar[] {
  const shown = trailing ? points.slice(-limit) : points.slice(0, limit);
  const max = Math.max(0, ...shown.map((point) => point.value));
  return shown.map((point) => ({
    key: point.key,
    label: point.label,
    title: pointTitle(point),
    share: max > 0 ? point.value / max : 0,
    peak: max > 0 && point.value === max,
  }));
}

export function slicesOf(points: readonly WidgetPoint[], limit: number): WidgetSlice[] {
  const positive = points.filter((point) => point.value > 0);
  const total = positive.reduce((sum, point) => sum + point.value, 0);
  if (total === 0) return [];
  const fits = positive.length <= Math.min(limit, SHARE_TONES.length);
  const head = fits ? positive : positive.slice(0, Math.min(limit - 1, SHARE_TONES.length));
  const rest = positive.slice(head.length).reduce((sum, point) => sum + point.value, 0);
  const slices: WidgetSlice[] = head.map((point, index) => ({
    key: point.key,
    label: point.label,
    text: percentOf(point.value / total),
    share: point.value / total,
    tone: SHARE_TONES[index] ?? "other",
  }));
  if (rest === 0) return slices;
  return [
    ...slices,
    {
      key: "other",
      label: i18n.t("discover:customWidget.share.other"),
      text: percentOf(rest / total),
      share: rest / total,
      tone: "other",
    },
  ];
}

export function pairsOf(points: readonly WidgetPoint[], limit: number): WidgetPair[] {
  const shown = points.slice(0, limit);
  const max = Math.max(0, ...shown.flatMap((point) => [point.value, point.prev ?? 0]));
  return shown.map((point) => ({
    key: point.key,
    label: point.label,
    currentShare: max > 0 ? point.value / max : 0,
    previousShare: max > 0 ? (point.prev ?? 0) / max : 0,
    currentText: point.text,
    previousText: point.prevText ?? compactCount(0),
  }));
}

export function trendOf(points: readonly WidgetPoint[]): WidgetTrend | null {
  const last = points.at(-1);
  if (!last) return null;
  const base = points.length > 1 ? (points.at(-2)?.value ?? null) : last.prev;
  return {
    value: last.text,
    label: last.label,
    delta: base === null ? null : last.value - base,
    values: points.map((point) => point.value),
  };
}

function weekdayOf(key: string): number | null {
  if (key.length !== CALENDAR_DAY_LENGTH) return null;
  const date = calendarDateOf(key);
  return date ? (date.getDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK : null;
}

export function yearWeeksOf(points: readonly WidgetPoint[], weeks: number): YearWeek[] {
  const [first] = points;
  const lead = first ? weekdayOf(first.key) : null;
  if (weeks === 0 || lead === null) return [];
  const padded: (WidgetPoint | null)[] = [...Array.from({ length: lead }, () => null), ...points];
  const columns: (WidgetPoint | null)[][] = [];
  for (let start = 0; start < padded.length; start += DAYS_PER_WEEK) {
    columns.push(padded.slice(start, start + DAYS_PER_WEEK));
  }
  const shown = columns.slice(-weeks);
  const max = Math.max(0, ...shown.flat().map((point) => point?.value ?? 0));
  return shown.map((column) =>
    column.map(
      (point): YearCell | null =>
        point && { key: point.key, title: pointTitle(point), level: heatLevel(point.value, max) }
    )
  );
}

export function yearTotalOf(points: readonly WidgetPoint[]): number {
  return points.reduce((sum, point) => sum + point.value, 0);
}

export function weekdayTotalsOf(cells: WidgetCells, weekdays: readonly string[]): WeekdayTotal[] {
  const totals = cells.map((row) => row.reduce((sum, value) => sum + value, 0));
  const max = Math.max(0, ...totals);
  return totals.map((total, index) => ({
    day: weekdays[index] ?? "",
    share: max > 0 ? total / max : 0,
    text: compactCount(total),
  }));
}

export function heatPeakText(cells: WidgetCells, weekdays: readonly string[]): string | null {
  const peak = heatPeak(cells);
  if (!peak) return null;
  return i18n.t("discover:customWidget.heatmap.peak", { day: weekdays[peak.day] ?? "", hour: peak.hour });
}
