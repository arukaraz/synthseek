import { describe, expect, it } from "vitest";

import { RECENT_SEARCHES_LIMIT } from "../constants";
import {
  cycleScope,
  isApplePlatform,
  isRecentSearches,
  isSearchShortcut,
  parseRecentSearches,
  stepHighlight,
  withRecentSearch,
} from "../helpers";

describe("parseRecentSearches", () => {
  it("accepts a short list of non-empty strings", () => {
    expect(parseRecentSearches('["a","b"]')).toEqual(["a", "b"]);
    expect(isRecentSearches("[]")).toBe(true);
  });

  it("rejects malformed JSON, other shapes, empty entries and overlong lists", () => {
    expect(parseRecentSearches("{")).toBeNull();
    expect(parseRecentSearches('{"a":1}')).toBeNull();
    expect(parseRecentSearches('[""]')).toBeNull();
    expect(
      parseRecentSearches(JSON.stringify(Array.from({ length: RECENT_SEARCHES_LIMIT + 1 }, (_, i) => `q${i}`)))
    ).toBeNull();
    expect(isRecentSearches("nope")).toBe(false);
  });
});

describe("withRecentSearch", () => {
  it("puts the newest search first, drops a case-insensitive repeat and keeps the limit", () => {
    const recent = ["one", "Two", "three", "four", "five"];

    expect(withRecentSearch(recent, "two")).toEqual(["two", "one", "three", "four", "five"]);
    expect(withRecentSearch(recent, "six")).toHaveLength(RECENT_SEARCHES_LIMIT);
    expect(withRecentSearch(recent, "six")[0]).toBe("six");
  });
});

describe("cycleScope", () => {
  it("steps through the scopes and wraps both ways", () => {
    const scopes = ["all", "track", "album"];

    expect(cycleScope(scopes, "all", 1)).toBe("track");
    expect(cycleScope(scopes, "album", 1)).toBe("all");
    expect(cycleScope(scopes, "all", -1)).toBe("album");
  });
});

describe("stepHighlight", () => {
  it("enters the list from either end and wraps around", () => {
    expect(stepHighlight(-1, 3, 1)).toBe(0);
    expect(stepHighlight(-1, 3, -1)).toBe(2);
    expect(stepHighlight(2, 3, 1)).toBe(0);
    expect(stepHighlight(0, 3, -1)).toBe(2);
  });

  it("highlights nothing in an empty list", () => {
    expect(stepHighlight(0, 0, 1)).toBe(-1);
  });
});

describe("isSearchShortcut", () => {
  it("matches Ctrl or Cmd with K only", () => {
    expect(isSearchShortcut({ key: "k", ctrlKey: true, metaKey: false })).toBe(true);
    expect(isSearchShortcut({ key: "K", ctrlKey: false, metaKey: true })).toBe(true);
    expect(isSearchShortcut({ key: "k", ctrlKey: false, metaKey: false })).toBe(false);
    expect(isSearchShortcut({ key: "j", ctrlKey: true, metaKey: false })).toBe(false);
  });
});

describe("isApplePlatform", () => {
  it("recognises Apple user agents", () => {
    expect(isApplePlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)")).toBe(true);
    expect(isApplePlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe(true);
    expect(isApplePlatform("Mozilla/5.0 (X11; Linux x86_64)")).toBe(false);
  });
});
