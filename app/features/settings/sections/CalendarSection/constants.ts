import { z } from "zod";

import type { FollowFilter, FollowReleaseType, FollowSort } from "@hooks/api/queries/artist-follow/types";

import type { CalendarView, GridKey } from "./types";

export const CALENDAR_VIEW_STORAGE_KEY = "synthseek.calendar.view";

export const DEFAULT_CALENDAR_VIEW: CalendarView = "month";

export const WEEK_LENGTH = 7;

export const CIVIL_DATE_LENGTH = 10;

export const CHIPS_PER_DAY = 3;

export const DOTS_PER_DAY = 3;

export const COMPACT_GRID_MAX_WIDTH = 560;

export const WIDE_LIST_MIN_WIDTH = 760;

export const MEDIUM_LIST_MIN_WIDTH = 560;

export const MONTH_PARAM = "month";

export const TYPE_ORDER: Readonly<Record<FollowReleaseType, number>> = { album: 0, ep: 1, single: 2, other: 3 };

export const MONTHS_PER_YEAR = 12;

export const MONDAY = 1;

export const SUNDAY = 7;

export const PAGE_MONTHS = 1;

export const SUNDAY_FIRST_LANGUAGES: readonly string[] = ["en", "ja", "ko", "zh", "he", "pt"];

export const WEEK_INFO_SCHEMA = z.object({ firstDay: z.number().int().min(MONDAY).max(SUNDAY) });

export const GRID_KEYS: readonly GridKey[] = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
];

const DEFAULT_FOLLOW_SORT: FollowSort = "name";
const DEFAULT_FOLLOW_FILTER: FollowFilter = "all";
const FOLLOW_SORTS: readonly FollowSort[] = ["name", "followedAt", "latestRelease"];
const FOLLOW_FILTERS: readonly FollowFilter[] = ["all", "autoRequest"];

export const FOLLOWING_URL_SCHEMA = {
  q: {},
  sort: { defaultValue: DEFAULT_FOLLOW_SORT, validValues: FOLLOW_SORTS },
  filter: { defaultValue: DEFAULT_FOLLOW_FILTER, validValues: FOLLOW_FILTERS },
  page: {},
};
