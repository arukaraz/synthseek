import type { DayOfWeek } from "../types";

export const DAY_OPTIONS: { value: DayOfWeek; label: string; full: string }[] = [
  { value: "daily", label: "Daily", full: "Every day" },
  { value: 1, label: "Mon", full: "Mondays" },
  { value: 2, label: "Tue", full: "Tuesdays" },
  { value: 3, label: "Wed", full: "Wednesdays" },
  { value: 4, label: "Thu", full: "Thursdays" },
  { value: 5, label: "Fri", full: "Fridays" },
  { value: 6, label: "Sat", full: "Saturdays" },
  { value: 0, label: "Sun", full: "Sundays" },
];

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
