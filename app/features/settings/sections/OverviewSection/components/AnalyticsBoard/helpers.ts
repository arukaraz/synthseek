import i18n from "@locale";

import type { QualityFormat, ScrobbleHealth } from "@hooks/api/queries/analytics/types";

import type { Delta, QualityRow, WindowTotals } from "./types";

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
