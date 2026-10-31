import type { SetSlot } from "@hooks/api/queries/widgets/types";

export const SPARE_ORIGINS: readonly SetSlot["origin"][] = [
  "onRepeat",
  "rediscover",
  "forgotten",
  "deepCuts",
  "rewind",
  "favorites",
];

export const TOP_PARAM_PREFIX = "top:";

export const TOP_CHOICES: Record<"genre" | "artist", number> = { genre: 6, artist: 3 };

export const WEEK_DAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

export const WEEKDAY_REFERENCE_MONDAY = new Date(2024, 0, 1);

export const SCENE_CHOICES = ["focus", "workout", "sleep", "dinner"] as const;

export const MINUTE_CHARS = 2;

export const NEVER_SETTINGS_HREF = "/settings/listening";

export const LENGTH_STEP = 5;

export const MINUTES_STEP = 15;

export const REPEAT_WINDOW_CUSTOM = "custom";

export const DEFAULT_WINDOW_DAYS = 30;
