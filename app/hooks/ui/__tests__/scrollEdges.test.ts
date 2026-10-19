import { describe, expect, it } from "vitest";

import { scrollEdgesOf } from "../helpers";

const metrics = {
  scrollTop: 0,
  scrollLeft: 0,
  scrollHeight: 300,
  scrollWidth: 300,
  clientHeight: 100,
  clientWidth: 100,
};

describe("scrollEdgesOf", () => {
  it("marks only the far edge at the start of an overflowing list", () => {
    expect(scrollEdgesOf(metrics, "y", 4)).toEqual({ start: false, end: true });
  });

  it("marks both edges in the middle and only the near one at the end", () => {
    expect(scrollEdgesOf({ ...metrics, scrollTop: 100 }, "y", 4)).toEqual({ start: true, end: true });
    expect(scrollEdgesOf({ ...metrics, scrollTop: 200 }, "y", 4)).toEqual({ start: true, end: false });
  });

  it("reads the horizontal axis on its own, and ignores a sub-tolerance overflow", () => {
    expect(scrollEdgesOf({ ...metrics, scrollLeft: 50, scrollTop: 0 }, "x", 4)).toEqual({ start: true, end: true });
    expect(scrollEdgesOf({ ...metrics, scrollHeight: 103 }, "y", 4)).toEqual({ start: false, end: false });
  });
});
