import type { FollowRelease } from "@hooks/api/queries/artist-follow/types";

export type CalendarView = "month" | "list";

export interface MonthRef {
  year: number;
  month: number;
}

export interface GridDay {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  releases: FollowRelease[];
}

export interface DayGroup {
  iso: string;
  releases: FollowRelease[];
}

export interface MonthGridInput {
  ref: MonthRef;
  firstDay: number;
  releases: readonly FollowRelease[];
  today: string | null;
}

export type GridKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "PageUp" | "PageDown" | "Home" | "End";
