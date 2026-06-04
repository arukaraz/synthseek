import i18n from "@locale";

import type { ScheduleSpec } from "../types";
import { DAY_OPTIONS } from "./constants";

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function describeSchedule(value: ScheduleSpec): string {
  const day = DAY_OPTIONS.find((o) => o.value === value.dayOfWeek);
  const fullKey = day?.fullKey ?? "discoveryIntegrations.schedule.monFull";
  const dayLabel = i18n.t(`library:${fullKey}`);
  return i18n.t("library:discoveryIntegrations.schedule.summary", { day: dayLabel, hour: pad(value.hour) });
}
