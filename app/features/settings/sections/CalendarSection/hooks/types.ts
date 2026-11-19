import type { GridDay, MonthRef } from "../types";

export interface UseGridFocusInput {
  ref: MonthRef;
  firstDay: number;
  today: string | null;
  grid: readonly (readonly GridDay[])[];
  onMonthChange: (month: MonthRef) => void;
}
