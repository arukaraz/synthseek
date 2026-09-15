import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calendarDateOf,
  formatCalendarDate,
  formatYear,
  formatRelativeTime,
  formatBytes,
  formatDuration,
  formatShortDate,
  formatTimestamp,
  formatTrackDuration,
  titleCase,
} from "../formatters";

describe("formatYear", () => {
  it("returns empty string for empty input", () => {
    expect(formatYear("")).toBe("");
  });

  it("returns empty string for null", () => {
    expect(formatYear(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(formatYear(undefined)).toBe("");
  });

  it("extracts year from full date string", () => {
    expect(formatYear("2024-05-15")).toBe("2024");
  });

  it("handles date with only year", () => {
    expect(formatYear("2024")).toBe("2024");
  });

  it("handles date with year and month only", () => {
    expect(formatYear("2024-05")).toBe("2024");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Just now' for less than a minute ago", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-01T11:59:30Z");
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("returns minutes ago for 1-59 minutes", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-01T11:55:00Z");
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns hours ago for 1-23 hours", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-01T09:00:00Z");
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days ago for more than 24 hours", () => {
    const now = new Date("2024-01-03T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-01T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2d ago");
  });

  it("handles exactly 1 minute ago", () => {
    const now = new Date("2024-01-01T12:01:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-01T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it("handles exactly 1 hour ago", () => {
    const now = new Date("2024-01-01T13:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-01T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("1h ago");
  });
});

describe("formatDuration", () => {
  it("returns null when end date is not provided", () => {
    const start = new Date("2024-01-01T12:00:00Z");
    expect(formatDuration(start)).toBeNull();
  });

  it("returns null when end is undefined", () => {
    const start = new Date("2024-01-01T12:00:00Z");
    expect(formatDuration(start, undefined)).toBeNull();
  });

  it("returns seconds only for less than a minute", () => {
    const start = new Date("2024-01-01T12:00:00Z");
    const end = new Date("2024-01-01T12:00:45Z");
    expect(formatDuration(start, end)).toBe("45s");
  });

  it("returns minutes and seconds for more than a minute", () => {
    const start = new Date("2024-01-01T12:00:00Z");
    const end = new Date("2024-01-01T12:02:30Z");
    expect(formatDuration(start, end)).toBe("2m 30s");
  });

  it("handles zero duration", () => {
    const date = new Date("2024-01-01T12:00:00Z");
    expect(formatDuration(date, date)).toBe("0s");
  });

  it("handles exactly one minute", () => {
    const start = new Date("2024-01-01T12:00:00Z");
    const end = new Date("2024-01-01T12:01:00Z");
    expect(formatDuration(start, end)).toBe("1m 0s");
  });
});

describe("formatTimestamp", () => {
  it("formats morning time correctly", () => {
    const date = new Date("2024-01-01T09:30:00");
    const result = formatTimestamp(date);
    expect(result).toMatch(/09:30|9:30/);
  });

  it("formats afternoon time correctly", () => {
    const date = new Date("2024-01-01T14:45:00");
    const result = formatTimestamp(date);
    expect(result).toMatch(/02:45|2:45|14:45/);
  });

  it("formats midnight correctly", () => {
    const date = new Date("2024-01-01T00:00:00");
    const result = formatTimestamp(date);
    expect(result).toMatch(/12:00|00:00/);
  });

  it("formats noon correctly", () => {
    const date = new Date("2024-01-01T12:00:00");
    const result = formatTimestamp(date);
    expect(result).toMatch(/12:00/);
  });
});

describe("formatShortDate", () => {
  it("renders a numeric date with the day, month, and two-digit year", () => {
    const date = new Date("2026-06-04T04:15:00");
    const result = formatShortDate(date);
    expect(result).toContain("6");
    expect(result).toContain("4");
    expect(result).toContain("26");
  });

  it("does not render an hour-and-minute time", () => {
    const date = new Date("2026-06-04T04:15:00");
    const result = formatShortDate(date);
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatTrackDuration", () => {
  it("formats 0ms as 0:00", () => {
    expect(formatTrackDuration(0)).toBe("0:00");
  });

  it("formats duration less than a minute", () => {
    expect(formatTrackDuration(45000)).toBe("0:45");
  });

  it("formats exactly one minute", () => {
    expect(formatTrackDuration(60000)).toBe("1:00");
  });

  it("formats duration more than a minute", () => {
    expect(formatTrackDuration(180000)).toBe("3:00");
  });

  it("pads seconds with leading zero", () => {
    expect(formatTrackDuration(65000)).toBe("1:05");
  });

  it("handles hour-long durations", () => {
    expect(formatTrackDuration(3600000)).toBe("60:00");
  });

  it("formats typical track duration", () => {
    expect(formatTrackDuration(213000)).toBe("3:33");
  });
});

describe("formatBytes", () => {
  it("returns 0 B for zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns 0 B for negative and non-finite input", () => {
    expect(formatBytes(-10)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
  });

  it("renders values under a kilobyte as whole bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("renders kilobytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("renders megabytes and gigabytes", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB");
  });

  it("caps at terabytes", () => {
    expect(formatBytes(3 * 1024 ** 4)).toBe("3.0 TB");
    expect(formatBytes(1024 ** 5)).toBe("1024.0 TB");
  });
});

describe("titleCase", () => {
  it("returns empty string for empty input", () => {
    expect(titleCase("")).toBe("");
  });

  it("capitalizes single word", () => {
    expect(titleCase("hello")).toBe("Hello");
  });

  it("capitalizes multiple words", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("handles already title case", () => {
    expect(titleCase("Hello World")).toBe("Hello World");
  });

  it("converts all caps to title case", () => {
    expect(titleCase("HELLO WORLD")).toBe("Hello World");
  });

  it("handles mixed case", () => {
    expect(titleCase("hElLo WoRlD")).toBe("Hello World");
  });

  it("handles single character words", () => {
    expect(titleCase("a b c")).toBe("A B C");
  });
});

describe("calendarDateOf", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("names the same calendar day west of UTC, where a bare parse lands on the day before", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    const date = calendarDateOf("2026-09-14");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(14);
  });

  it("does not over-correct east of UTC, where a bare parse was already on the right day", () => {
    vi.stubEnv("TZ", "Asia/Tokyo");
    const date = calendarDateOf("2026-09-14");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(14);
  });

  it("takes the calendar day out of a UTC midnight timestamp, which is how Wikidata sends a birth date", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    const date = calendarDateOf("1967-07-13T00:00:00Z");
    expect(date?.getFullYear()).toBe(1967);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(13);
  });

  it("returns null for a value that names no date", () => {
    expect(calendarDateOf("not a date")).toBeNull();
    expect(calendarDateOf("")).toBeNull();
  });

  it("refuses an out-of-range component instead of rolling it over into a plausible wrong day", () => {
    expect(calendarDateOf("2026-13-45")).toBeNull();
    expect(calendarDateOf("2026-00-00")).toBeNull();
    expect(calendarDateOf("2026-02-30")).toBeNull();
    expect(calendarDateOf("2026-09")).toBeNull();
    expect(calendarDateOf("  2026-09-14")).toBeNull();
  });

  it("refuses a two-digit year rather than mapping it into the twentieth century", () => {
    expect(calendarDateOf("0026-09-14")).toBeNull();
  });
});

describe("formatCalendarDate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the day the value names rather than the day before it", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    const rendered = formatCalendarDate("2026-09-14");
    expect(rendered).toContain("14");
    expect(rendered).not.toContain("13");
  });

  it("renders a UTC midnight timestamp as its own calendar day", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");
    const rendered = formatCalendarDate("1967-07-13T00:00:00Z");
    expect(rendered).toContain("13");
    expect(rendered).not.toContain("12");
  });

  it("returns null for an absent or unparseable value", () => {
    expect(formatCalendarDate(null)).toBeNull();
    expect(formatCalendarDate(undefined)).toBeNull();
    expect(formatCalendarDate("not a date")).toBeNull();
  });
});
