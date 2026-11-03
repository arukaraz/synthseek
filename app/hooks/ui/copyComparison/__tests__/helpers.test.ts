import { describe, expect, it } from "vitest";

import { clampTo, copyTimeAt, copyVolume, fractionOf, lengthOf, loopAround, startOf, timelineBounds } from "../helpers";
import type { ComparedCopy } from "../types";

function copy(overrides: Partial<ComparedCopy> = {}): ComparedCopy {
  return {
    id: "a",
    src: "/a",
    offsetSeconds: 0,
    loudnessLufs: -10,
    durationSeconds: 200,
    ...overrides,
  };
}

describe("where a copy sits on the shared timeline", () => {
  it("starts every copy at zero until the copies are aligned", () => {
    expect(startOf(copy({ offsetSeconds: 2.5 }), false)).toBe(0);
  });

  it("shifts an aligned copy by its measured offset", () => {
    expect(startOf(copy({ offsetSeconds: 2.5 }), true)).toBe(2.5);
    expect(copyTimeAt(10, copy({ offsetSeconds: 2.5 }), true)).toBe(7.5);
  });

  it("treats a copy with no measured offset as starting at zero", () => {
    expect(startOf(copy({ offsetSeconds: null }), true)).toBe(0);
  });

  it("prefers the length the browser measured over the indexed one", () => {
    expect(lengthOf(copy(), new Map([["a", 201.4]]))).toBe(201.4);
    expect(lengthOf(copy(), new Map())).toBe(200);
    expect(lengthOf(copy({ durationSeconds: null }), new Map())).toBe(0);
  });

  it("spans from the earliest start to the latest end of every copy", () => {
    const copies = [copy({ id: "a", offsetSeconds: -1.5 }), copy({ id: "b", offsetSeconds: 3, durationSeconds: 210 })];
    expect(timelineBounds(copies, true, new Map())).toEqual({ start: -1.5, end: 213 });
    expect(timelineBounds(copies, false, new Map())).toEqual({ start: 0, end: 210 });
  });

  it("has an empty timeline when there is nothing to compare", () => {
    expect(timelineBounds([], true, new Map())).toEqual({ start: 0, end: 0 });
  });

  it("keeps a position inside the timeline", () => {
    expect(clampTo(-4, { start: 0, end: 10 })).toBe(0);
    expect(clampTo(14, { start: 0, end: 10 })).toBe(10);
    expect(clampTo(4, { start: 0, end: 10 })).toBe(4);
  });

  it("reads a position as a fraction of the timeline, and an empty timeline as zero", () => {
    expect(fractionOf(5, { start: 0, end: 10 })).toBe(0.5);
    expect(fractionOf(0, { start: -2, end: 2 })).toBe(0.5);
    expect(fractionOf(3, { start: 4, end: 4 })).toBe(0);
  });
});

describe("how loud each copy plays", () => {
  const a = copy({ id: "a", loudnessLufs: -8 });
  const b = copy({ id: "b", loudnessLufs: -14 });

  it("silences a copy that is switched off", () => {
    expect(copyVolume(a, [a, b], new Set(["b"]), true)).toBe(0);
  });

  it("plays a lone copy at full volume", () => {
    expect(copyVolume(a, [a, b], new Set(["a"]), true)).toBe(1);
  });

  it("shares the volume between copies playing together so the sum keeps its power", () => {
    expect(copyVolume(a, [a, b], new Set(["a", "b"]), false)).toBeCloseTo(1 / Math.sqrt(2));
  });

  it("turns the louder copy down to the quietest when loudness is matched", () => {
    const share = 1 / Math.sqrt(2);
    expect(copyVolume(a, [a, b], new Set(["a", "b"]), true)).toBeCloseTo(share * 10 ** (-6 / 20));
    expect(copyVolume(b, [a, b], new Set(["a", "b"]), true)).toBeCloseTo(share);
  });

  it("leaves a copy with no measured loudness at its share", () => {
    const unmeasured = copy({ id: "c", loudnessLufs: null });
    expect(copyVolume(unmeasured, [a, unmeasured], new Set(["a", "c"]), true)).toBeCloseTo(1 / Math.sqrt(2));
  });
});

describe("the six second loop", () => {
  it("starts a second before the playhead and lasts six seconds", () => {
    expect(loopAround(60, { start: 0, end: 200 })).toEqual({ start: 59, end: 65 });
  });

  it("stays inside the timeline at either end", () => {
    expect(loopAround(0.5, { start: 0, end: 200 })).toEqual({ start: 0, end: 6 });
    expect(loopAround(199, { start: 0, end: 200 })).toEqual({ start: 198, end: 200 });
  });
});
