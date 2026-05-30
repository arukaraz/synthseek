import { NEXT_RUN_FALLBACK } from "./constants";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function describeInterval(intervalMs: number): string {
  if (intervalMs < HOUR_MS) {
    const minutes = Math.round(intervalMs / MINUTE_MS);
    return minutes <= 1 ? "Every minute" : `Every ${minutes} minutes`;
  }

  if (intervalMs < DAY_MS) {
    const hours = Math.round(intervalMs / HOUR_MS);
    return hours <= 1 ? "Every hour" : `Every ${hours} hours`;
  }

  const days = Math.round(intervalMs / DAY_MS);
  return days <= 1 ? "Every day" : `Every ${days} days`;
}

export interface NextRunParts {
  value: string;
  unit?: string;
}

export function formatNextRun(date: Date | null, now: number): NextRunParts {
  if (!date) return { value: NEXT_RUN_FALLBACK };

  const diffMs = date.getTime() - now;
  if (diffMs <= 0) return { value: "now" };

  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return { value: String(seconds), unit: "s" };

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return { value: String(minutes), unit: "min" };

  const hours = Math.round(minutes / 60);
  if (hours < 24) return { value: String(hours), unit: "h" };

  const days = Math.round(hours / 24);
  return { value: String(days), unit: "d" };
}
