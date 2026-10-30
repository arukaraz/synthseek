import type { BoardSize } from "@hooks/api/queries/board/types";

import type {
  FeedSeed,
  FeedSeedKind,
  ListenBrainzPlaylist,
  NamedPeriod,
  QuestionGroupBy,
  RuleField,
  TimeMode,
  WidgetKind,
  WidgetRule,
} from "./types";

export const PREVIEW_DEBOUNCE_MS = 400;

export const WORKSHOP_SIZES: readonly BoardSize[] = ["S", "M", "L"];

export const WIDGET_KINDS: readonly WidgetKind[] = ["question", "feed"];

export const TIME_MODES: readonly TimeMode[] = ["relative", "named", "absolute", "sameLastYear"];

export const NO_ROTATION = "none";

export const DEFAULT_DAYS = 30;

export const DEFAULT_GROUP_BY: QuestionGroupBy = "day";

export const DEFAULT_FEED_SEED: FeedSeed = { kind: "myTopArtists", n: 10, days: 90 };

export const DEFAULT_FRESH_RELEASE_DAYS = 30;

export const DEFAULT_LISTENBRAINZ_PLAYLIST: ListenBrainzPlaylist = "weekly-jams";

export const FEED_SEED_KINDS: readonly FeedSeedKind[] = ["myTopArtists", "favorites"];

export const DAILY_YEAR_MIN_DAYS = 180;

export const NAMED_PERIOD_DAYS: Record<NamedPeriod, number> = {
  thisWeek: 7,
  thisMonth: 31,
  thisYear: 366,
  all: 3650,
};

export const YEAR_DAYS = 365;

export const MONTH_DAYS = 31;

export const MONTH_NAME_REFERENCE_YEAR = 2024;

export const MONTHS_IN_YEAR = 12;

export const WHOLE_YEAR = 0;

export const SHARE_PERCENT = 100;

export const DEFAULT_RULES: Record<RuleField, WidgetRule> = {
  plays: { field: "plays", op: "gte", value: 5 },
  notPlayedInLast: { field: "notPlayedInLast", op: "days", value: 90 },
  addedOlderThan: { field: "addedOlderThan", op: "days", value: 60 },
  bitrate: { field: "bitrate", op: "lt", value: 256 },
  ownedShare: { field: "ownedShare", op: "lt", value: 0.5 },
  favorite: { field: "favorite", op: "is", value: true },
  inLibrary: { field: "inLibrary", op: "is", value: false },
  requestStatus: { field: "requestStatus", op: "is", value: "complete" },
  genre: { field: "genre", op: "inMyTop", value: 5 },
  decade: { field: "decade", op: "is", value: "myTop" },
  artistInMyTop: { field: "artistInMyTop", op: "within", value: { n: 10, days: 90 } },
  inCurrentTimeSlot: { field: "inCurrentTimeSlot", op: "is", value: true },
  releaseType: { field: "releaseType", op: "isNot", value: "single" },
  listeners: { field: "listeners", op: "lt", value: 50_000 },
  artistInLibrary: { field: "artistInLibrary", op: "is", value: true },
};

export const DECADE_CHOICES: readonly number[] = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export const RELEASE_TYPE_CHOICES = ["album", "ep", "single", "other"] as const;

export const NUMBER_BOUNDS = {
  daysMin: 1,
  topNMin: 1,
  count: { min: 0, max: 100_000 },
  bitrate: { min: 32, max: 10_000, step: 32 },
  percent: { min: 0, max: 100, step: 5 },
  listeners: { min: 0, max: 100_000_000, step: 1000 },
} as const;
