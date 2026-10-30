import type { BoardSize } from "@hooks/api/queries/board/types";

import type { ShareTone } from "./types";

export const CHART_LIMITS = {
  seriesBars: { S: 8, M: 16, L: 32 },
  bucketBars: { S: 4, M: 6, L: 10 },
  share: { S: 4, M: 5, L: 5 },
  compare: { S: 3, M: 5, L: 8 },
  yearWeeks: { S: 0, M: 26, L: 53 },
} as const satisfies Record<string, Record<BoardSize, number>>;

export const SHARE_TONES: readonly ShareTone[] = ["explore", "weekly", "cf", "daily"];

export const CALENDAR_DAY_LENGTH = 10;

export const DAYS_PER_WEEK = 7;
