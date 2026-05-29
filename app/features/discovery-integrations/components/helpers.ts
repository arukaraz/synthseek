import type { DayOfWeek, ScheduleSpec } from "../types";
import { DAY_OPTIONS } from "./constants";

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function describeSchedule(value: ScheduleSpec): string {
  const day = DAY_OPTIONS.find((o) => o.value === value.dayOfWeek);
  const dayLabel = day?.full ?? "Mondays";
  return `${dayLabel} at ${pad(value.hour)}:00`;
}

export function getDayLabel(value: DayOfWeek): string {
  return DAY_OPTIONS.find((o) => o.value === value)?.label ?? "Mon";
}
