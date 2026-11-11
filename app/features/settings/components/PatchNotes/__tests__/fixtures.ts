import type { ChangelogEntry } from "../types";

export function makeEntry(overrides: Partial<ChangelogEntry> = {}): ChangelogEntry {
  return {
    version: "2.3.0",
    date: "2026-06-20",
    type: "minor",
    title: "Multi-provider catalog",
    sections: [],
    ...overrides,
  };
}
