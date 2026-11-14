import type { ParseKeys } from "i18next";

import type { BoardDevice } from "@components/BoardGrid";
import type { ClockPeriod } from "@hooks/api/queries/analytics/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

import type { AnalyticsHeight } from "./types";

export const ANALYTICS_CELL_ROWS: Record<BoardDevice, Record<AnalyticsHeight, Record<BoardSize, number>>> = {
  wide: {
    short: { S: 2, M: 2, L: 2, XL: 2 },
    regular: { S: 4, M: 4, L: 4, XL: 4 },
  },
  narrow: {
    short: { S: 2, M: 2, L: 2, XL: 2 },
    regular: { S: 4, M: 4, L: 5, XL: 5 },
  },
};

export const SUMMARY_WINDOW_DAYS = 7;

export const QUALITY_ROW_LIMIT = 5;

export const CLOCK_DEFAULT_PERIOD: ClockPeriod = "1month";

export const CLOCK_PERIODS: readonly ClockPeriod[] = ["7day", "1month", "3month"];

export const CLOCK_PERIOD_KEYS: Record<ClockPeriod, ParseKeys<"settings">> = {
  "7day": "overview.analytics.clock.periods.7day",
  "1month": "overview.analytics.clock.periods.1month",
  "3month": "overview.analytics.clock.periods.3month",
};
