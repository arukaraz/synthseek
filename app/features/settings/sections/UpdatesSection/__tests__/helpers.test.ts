import { describe, expect, it } from "vitest";

import { compareSemver, entryVariant, formatEntryDate } from "../helpers";

describe("compareSemver", () => {
  it("orders patch, minor and major correctly", () => {
    expect(compareSemver("1.2.1", "1.2.0")).toBe(1);
    expect(compareSemver("1.2.0", "1.2.1")).toBe(-1);
    expect(compareSemver("2.0.0", "1.9.9")).toBe(1);
    expect(compareSemver("1.2.0", "1.2.0")).toBe(0);
  });

  it("treats a missing segment as zero", () => {
    expect(compareSemver("1.2", "1.2.0")).toBe(0);
    expect(compareSemver("1.2", "1.2")).toBe(0);
  });

  it("treats a non-numeric segment as zero", () => {
    expect(compareSemver("1.x", "1.0.0")).toBe(0);
    expect(compareSemver("1.2.0", "1.x.0")).toBe(1);
  });
});

describe("entryVariant", () => {
  it("marks the newest version above current as latest", () => {
    expect(entryVariant("1.2.1", "1.2.0", true)).toBe("latest");
  });

  it("marks a newer but not-newest version as new", () => {
    expect(entryVariant("1.2.1", "1.2.0", false)).toBe("new");
  });

  it("marks the running version as current", () => {
    expect(entryVariant("1.2.0", "1.2.0", true)).toBe("current");
  });

  it("marks older versions as past", () => {
    expect(entryVariant("1.1.0", "1.2.0", false)).toBe("past");
  });

  it("falls back to latest for the newest when current is unknown", () => {
    expect(entryVariant("1.2.0", null, true)).toBe("latest");
    expect(entryVariant("1.1.0", null, false)).toBe("past");
  });
});

describe("formatEntryDate", () => {
  it("formats a valid ISO date with the requested locale", () => {
    expect(formatEntryDate("2026-06-22", "en-US")).toBe("Jun 22, 2026");
  });

  it("respects a non-English locale", () => {
    expect(formatEntryDate("2026-01-05", "es-ES")).toBe("5 ene 2026");
  });

  it("returns the raw string when the date is unparseable", () => {
    expect(formatEntryDate("not-a-date", "en-US")).toBe("not-a-date");
  });

  it("returns the raw string for a value that does not exactly name a day, rather than rolling it over", () => {
    expect(formatEntryDate("2026-02-30", "en-US")).toBe("2026-02-30");
    expect(formatEntryDate("2026-09", "en-US")).toBe("2026-09");
    expect(formatEntryDate("1967", "en-US")).toBe("1967");
  });
});
