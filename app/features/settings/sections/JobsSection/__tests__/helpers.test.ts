import { describe, it, expect, beforeAll } from "vitest";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { DAY_MS, HOUR_MS, MINUTE_MS } from "../constants";
import { describeInterval, formatNextRun } from "../helpers";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("describeInterval", () => {
  it("describes a single minute", () => {
    expect(describeInterval(MINUTE_MS)).toBe(enSettings.jobs.interval.everyMinute);
  });

  it("describes a sub-minute interval as a single minute", () => {
    expect(describeInterval(30_000)).toBe(enSettings.jobs.interval.everyMinute);
  });

  it("describes multiple minutes", () => {
    expect(describeInterval(5 * MINUTE_MS)).toBe(enSettings.jobs.interval.everyMinutes.replace("{{count}}", "5"));
  });

  it("describes a single hour", () => {
    expect(describeInterval(HOUR_MS)).toBe(enSettings.jobs.interval.everyHour);
  });

  it("describes multiple hours", () => {
    expect(describeInterval(3 * HOUR_MS)).toBe(enSettings.jobs.interval.everyHours.replace("{{count}}", "3"));
  });

  it("describes a single day", () => {
    expect(describeInterval(DAY_MS)).toBe(enSettings.jobs.interval.everyDay);
  });

  it("describes multiple days", () => {
    expect(describeInterval(2 * DAY_MS)).toBe(enSettings.jobs.interval.everyDays.replace("{{count}}", "2"));
  });
});

describe("formatNextRun", () => {
  const now = 1_000_000;

  it("returns the idle fallback when no date is given", () => {
    expect(formatNextRun(null, now)).toEqual({ value: enSettings.jobs.row.nextRunFallback });
  });

  it("returns now when the date is in the past", () => {
    expect(formatNextRun(new Date(now - 1000), now)).toEqual({ value: enSettings.jobs.nextRun.now });
  });

  it("returns now when the date is exactly now", () => {
    expect(formatNextRun(new Date(now), now)).toEqual({ value: enSettings.jobs.nextRun.now });
  });

  it("formats a sub-minute delay in seconds", () => {
    expect(formatNextRun(new Date(now + 45_000), now)).toEqual({ value: "45", unit: "s" });
  });

  it("formats a sub-hour delay in minutes", () => {
    expect(formatNextRun(new Date(now + 5 * MINUTE_MS), now)).toEqual({ value: "5", unit: "min" });
  });

  it("formats a sub-day delay in hours", () => {
    expect(formatNextRun(new Date(now + 3 * HOUR_MS), now)).toEqual({ value: "3", unit: "h" });
  });

  it("formats a multi-day delay in days", () => {
    expect(formatNextRun(new Date(now + 2 * DAY_MS), now)).toEqual({ value: "2", unit: "d" });
  });
});
