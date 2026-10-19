import type { ParseKeys } from "i18next";

import type { ClockPeriod } from "@hooks/api/queries/analytics/types";

export const SUMMARY_WINDOW_DAYS = 7;

export const QUALITY_ROW_LIMIT = 5;

export const SPARK_WIDTH = 100;

export const SPARK_HEIGHT = 30;

export const SPARK_VIEWBOX = `0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`;

export const SPARK_INSET = 3;

export const SPARK_BAR_GAP = 2;

export const SPARK_BAR_MIN = 2;

export const HEAT_FLOOR = 0.15;

export const CLOCK_DEFAULT_PERIOD: ClockPeriod = "1month";

export const CLOCK_PERIODS: readonly ClockPeriod[] = ["7day", "1month", "3month"];

export const CLOCK_PERIOD_KEYS: Record<ClockPeriod, ParseKeys<"settings">> = {
  "7day": "overview.analytics.clock.periods.7day",
  "1month": "overview.analytics.clock.periods.1month",
  "3month": "overview.analytics.clock.periods.3month",
};

export const CLOCK_HOUR_TICKS: readonly number[] = [0, 6, 12, 18];

export const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1);

export const DAY_MS = 86_400_000;

export const WEEKDAY_COUNT = 7;
