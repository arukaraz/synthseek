import { describe, expect, it } from "vitest";

import { getNextOffset, stripPaging } from "../helpers";

function page(itemCount: number, total: number) {
  return { items: Array.from({ length: itemCount }, (_, index) => index), total };
}

describe("getNextOffset", () => {
  it("returns the loaded count as the next offset while more remain", () => {
    const first = page(50, 120);
    expect(getNextOffset(first, [first])).toBe(50);
  });

  it("accumulates the loaded count across all pages", () => {
    const first = page(50, 120);
    const second = page(50, 120);
    expect(getNextOffset(second, [first, second])).toBe(100);
  });

  it("returns undefined once every item is loaded", () => {
    const first = page(50, 120);
    const second = page(50, 120);
    const third = page(20, 120);
    expect(getNextOffset(third, [first, second, third])).toBeUndefined();
  });

  it("returns undefined when a single page already holds the full total", () => {
    const only = page(30, 30);
    expect(getNextOffset(only, [only])).toBeUndefined();
  });

  it("returns undefined for an empty result set", () => {
    const empty = page(0, 0);
    expect(getNextOffset(empty, [empty])).toBeUndefined();
  });
});

describe("stripPaging", () => {
  it("drops offset and limit but keeps the filter-bearing fields", () => {
    const stripped = stripPaging({ offset: 100, limit: 50, q: "rock", sort: "name" });
    expect(stripped).toEqual({ q: "rock", sort: "name" });
  });

  it("leaves an input without paging fields untouched", () => {
    const stripped = stripPaging({ q: "jazz" });
    expect(stripped).toEqual({ q: "jazz" });
  });
});
