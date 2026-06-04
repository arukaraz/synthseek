import type { ParseKeys } from "i18next";

import type { DayOfWeek } from "../types";

export const DAY_OPTIONS: { value: DayOfWeek; labelKey: ParseKeys<"library">; fullKey: ParseKeys<"library"> }[] = [
  {
    value: "daily",
    labelKey: "discoveryIntegrations.schedule.dailyShort",
    fullKey: "discoveryIntegrations.schedule.dailyFull",
  },
  { value: 1, labelKey: "discoveryIntegrations.schedule.monShort", fullKey: "discoveryIntegrations.schedule.monFull" },
  { value: 2, labelKey: "discoveryIntegrations.schedule.tueShort", fullKey: "discoveryIntegrations.schedule.tueFull" },
  { value: 3, labelKey: "discoveryIntegrations.schedule.wedShort", fullKey: "discoveryIntegrations.schedule.wedFull" },
  { value: 4, labelKey: "discoveryIntegrations.schedule.thuShort", fullKey: "discoveryIntegrations.schedule.thuFull" },
  { value: 5, labelKey: "discoveryIntegrations.schedule.friShort", fullKey: "discoveryIntegrations.schedule.friFull" },
  { value: 6, labelKey: "discoveryIntegrations.schedule.satShort", fullKey: "discoveryIntegrations.schedule.satFull" },
  { value: 0, labelKey: "discoveryIntegrations.schedule.sunShort", fullKey: "discoveryIntegrations.schedule.sunFull" },
];

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
