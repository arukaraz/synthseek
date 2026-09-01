import i18n from "@locale";
import type { TFunction } from "i18next";

import { formatBytes } from "@utils/formatters";

import type { DuplicateGroupSummary } from "./types";

import { DAY_MS, HOUR_MS, MINUTE_MS } from "./constants";

export function describeInterval(intervalMs: number): string {
  if (intervalMs < HOUR_MS) {
    const minutes = Math.round(intervalMs / MINUTE_MS);
    return minutes <= 1
      ? i18n.t("settings:jobs.interval.everyMinute")
      : i18n.t("settings:jobs.interval.everyMinutes", { count: minutes });
  }

  if (intervalMs < DAY_MS) {
    const hours = Math.round(intervalMs / HOUR_MS);
    return hours <= 1
      ? i18n.t("settings:jobs.interval.everyHour")
      : i18n.t("settings:jobs.interval.everyHours", { count: hours });
  }

  const days = Math.round(intervalMs / DAY_MS);
  return days <= 1
    ? i18n.t("settings:jobs.interval.everyDay")
    : i18n.t("settings:jobs.interval.everyDays", { count: days });
}

export interface NextRunParts {
  value: string;
  unit?: string;
}

export function formatNextRun(date: Date | null, now: number): NextRunParts {
  if (!date) return { value: i18n.t("settings:jobs.row.nextRunFallback") };

  const diffMs = date.getTime() - now;
  if (diffMs <= 0) return { value: i18n.t("settings:jobs.nextRun.now") };

  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return { value: String(seconds), unit: "s" };

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return { value: String(minutes), unit: "min" };

  const hours = Math.round(minutes / 60);
  if (hours < 24) return { value: String(hours), unit: "h" };

  const days = Math.round(hours / 24);
  return { value: String(days), unit: "d" };
}

export function describeCopies(group: DuplicateGroupSummary, t: TFunction<"settings">): string {
  const parts = [t("libraryScan.duplicates.copies", { count: group.copies.length })];
  if (group.formats.length > 0) parts.push(group.formats.map((format) => format.toUpperCase()).join(" + "));
  const lengths = group.distinctLengths;
  parts.push(
    lengths !== null && lengths > 1
      ? t("libraryScan.duplicates.distinctLengths", { count: lengths })
      : group.minBytes === group.maxBytes
        ? t("libraryScan.duplicates.sizeEach", { size: formatBytes(group.maxBytes) })
        : t("libraryScan.duplicates.sizeRange", {
            from: formatBytes(group.minBytes),
            to: formatBytes(group.maxBytes),
          })
  );
  return parts.join(" · ");
}

export function copyAudioUrl(fileId: string): string {
  return `/api/v1/library-copies/${encodeURIComponent(fileId)}/audio`;
}
