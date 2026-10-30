export type ShareTone = "explore" | "weekly" | "cf" | "daily" | "other";

export interface WidgetBar {
  key: string;
  label: string;
  title: string;
  share: number;
  peak: boolean;
}

export interface WidgetSlice {
  key: string;
  label: string;
  text: string;
  share: number;
  tone: ShareTone;
}

export interface WidgetPair {
  key: string;
  label: string;
  currentShare: number;
  previousShare: number;
  currentText: string;
  previousText: string;
}

export interface WidgetTrend {
  value: string;
  label: string;
  delta: number | null;
  values: readonly number[];
}

export interface YearCell {
  key: string;
  title: string;
  level: number;
}

export type YearWeek = readonly (YearCell | null)[];

export interface WeekdayTotal {
  day: string;
  share: number;
  text: string;
}
