import { describe, it, expect } from "vitest";

import { entriesToText, filterEntries, isRefreshOption } from "../helpers";
import type { LogEntry } from "../types";

function entry(overrides: Partial<LogEntry> = {}): LogEntry {
  return { raw: "[INFO] hello", level: "INFO", requestId: null, ...overrides };
}

describe("isRefreshOption", () => {
  it("accepts known refresh interval values", () => {
    expect(isRefreshOption("0")).toBe(true);
    expect(isRefreshOption("30")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isRefreshOption("7")).toBe(false);
    expect(isRefreshOption("abc")).toBe(false);
  });
});

describe("filterEntries", () => {
  const entries = [
    entry({ raw: "[INFO] started", level: "INFO" }),
    entry({ raw: "[ERROR] boom", level: "ERROR" }),
    entry({ raw: "raw line with no level", level: null }),
  ];

  it("keeps entries whose level is active", () => {
    const result = filterEntries(entries, new Set(["INFO"]), "");
    expect(result.map((e) => e.raw)).toEqual(["[INFO] started", "raw line with no level"]);
  });

  it("always keeps null-level entries", () => {
    const result = filterEntries(entries, new Set<string>(), "");
    expect(result.map((e) => e.raw)).toEqual(["raw line with no level"]);
  });

  it("filters by a case-insensitive search needle", () => {
    const result = filterEntries(entries, new Set(["INFO", "ERROR"]), "BOOM");
    expect(result.map((e) => e.raw)).toEqual(["[ERROR] boom"]);
  });
});

describe("entriesToText", () => {
  it("joins raw lines with newlines", () => {
    expect(entriesToText([entry({ raw: "a" }), entry({ raw: "b" })])).toBe("a\nb");
  });
});
