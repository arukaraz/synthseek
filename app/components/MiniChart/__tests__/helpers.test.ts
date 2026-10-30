import { describe, expect, it } from "vitest";

import { heatLevel, heatPeak, sparkBars, sparkPath, weekdayLabels } from "../helpers";

describe("sparkPath", () => {
  it("draws the highest value at the top inset and closes the area along the bottom", () => {
    const path = sparkPath([0, 10], 100, 30);
    expect(path.line).toBe("M0 27 L100 3");
    expect(path.area).toBe("M0 27 L100 3 L100 30 L0 30 Z");
  });

  it("keeps a flat series on the baseline", () => {
    expect(sparkPath([4, 4], 100, 30).line).toBe("M0 27 L100 27");
  });
});

describe("sparkBars", () => {
  it("scales bars to the tallest, keeps a floor for zero and marks the last bar", () => {
    const bars = sparkBars([0, 5, 10], 90, 30);
    expect(bars.map((bar) => bar.height)).toEqual([2, 15, 30]);
    expect(bars.map((bar) => bar.x)).toEqual([1, 31, 61]);
    expect(bars.map((bar) => bar.last)).toEqual([false, false, true]);
  });
});

describe("heatPeak and heatLevel", () => {
  it("finds the busiest hour, keeping the first one on a tie", () => {
    expect(
      heatPeak([
        [0, 2, 0],
        [2, 5, 5],
      ])
    ).toEqual({ day: 1, hour: 1, count: 5 });
    expect(heatPeak([[0, 0]])).toBeNull();
  });

  it("lifts any play above the floor and leaves silence at zero", () => {
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(10, 10)).toBe(1);
    expect(heatLevel(5, 10)).toBeCloseTo(0.575);
  });
});

describe("weekdayLabels", () => {
  it("names the seven days from Monday", () => {
    expect(weekdayLabels()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });
});
