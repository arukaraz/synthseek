import type { ParseKeys } from "i18next";

import type { ClockPeriod } from "@hooks/api/queries/analytics/types";

export const SUMMARY_WINDOW_DAYS = 7;

export const QUALITY_ROW_LIMIT = 5;

export const CLOCK_DEFAULT_PERIOD: ClockPeriod = "1month";

export const CLOCK_PERIODS: readonly ClockPeriod[] = ["7day", "1month", "3month"];

export const CLOCK_PERIOD_KEYS: Record<ClockPeriod, ParseKeys<"settings">> = {
  "7day": "overview.analytics.clock.periods.7day",
  "1month": "overview.analytics.clock.periods.1month",
  "3month": "overview.analytics.clock.periods.3month",
};
