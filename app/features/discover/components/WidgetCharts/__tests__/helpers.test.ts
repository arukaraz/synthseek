import { describe, expect, it } from "vitest";

import type { WidgetPoint } from "../../CustomWidget/types";
import {
  barsOf,
  heatPeakText,
  pairsOf,
  slicesOf,
  trendOf,
  weekdayTotalsOf,
  yearTotalOf,
  yearWeeksOf,
} from "../helpers";

function point(key: string, value: number, prev: number | null = null): WidgetPoint {
  return { key, label: key, value, prev, text: `${value} plays`, prevText: prev === null ? null : `${prev} plays` };
}

describe("barsOf", () => {
  it("keeps the latest points of a series and the first buckets, scaled to the tallest", () => {
    const points = [point("a", 2), point("b", 8), point("c", 4)];
    expect(barsOf(points, 2, true).map((bar) => bar.key)).toEqual(["b", "c"]);
    const bars = barsOf(points, 2, false);
    expect(bars.map((bar) => [bar.key, bar.share, bar.peak])).toEqual([
      ["a", 0.25, false],
      ["b", 1, true],
    ]);
    expect(bars[0]?.title).toBe("a: 2 plays");
  });

  it("marks no peak when every value is zero", () => {
    expect(barsOf([point("a", 0)], 4, true)[0]).toMatchObject({ share: 0, peak: false });
  });
});

describe("slicesOf", () => {
  it("colours each bucket while they fit and splits off the remainder as Other", () => {
    const points = [point("a", 50), point("b", 20), point("c", 15), point("d", 10), point("e", 5)];
    const slices = slicesOf(points, 4);
    expect(slices.map((slice) => [slice.key, slice.tone, slice.text])).toEqual([
      ["a", "explore", "50%"],
      ["b", "weekly", "20%"],
      ["c", "cf", "15%"],
      ["other", "other", "15%"],
    ]);
    expect(slices.reduce((sum, slice) => sum + slice.share, 0)).toBeCloseTo(1);
  });

  it("keeps four buckets whole and drops empty ones", () => {
    const slices = slicesOf([point("a", 3), point("b", 1), point("c", 0)], 5);
    expect(slices.map((slice) => slice.key)).toEqual(["a", "b"]);
    expect(slicesOf([point("a", 0)], 5)).toEqual([]);
  });
});

describe("pairsOf", () => {
  it("scales both periods against the largest value of either", () => {
    const [pair] = pairsOf([point("rock", 5, 10)], 3);
    expect(pair).toMatchObject({
      currentShare: 0.5,
      previousShare: 1,
      currentText: "5 plays",
      previousText: "10 plays",
    });
  });
});

describe("trendOf", () => {
  it("compares the last point of a series with the one before it", () => {
    expect(trendOf([point("w1", 30), point("w2", 42)])).toMatchObject({ value: "42 plays", label: "w2", delta: 12 });
  });

  it("compares a single value with its previous window", () => {
    expect(trendOf([point("all", 10, 14)])?.delta).toBe(-4);
    expect(trendOf([point("all", 10)])?.delta).toBeNull();
    expect(trendOf([])).toBeNull();
  });
});

describe("yearWeeksOf", () => {
  it("pads the first week from Monday and keeps the latest weeks", () => {
    const days = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05"].map((key, index) =>
      point(key, index)
    );
    const weeks = yearWeeksOf(days, 53);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]?.slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0]?.[3]?.key).toBe("2026-10-01");
    expect(weeks[1]?.[0]?.key).toBe("2026-10-05");
    expect(weeks[1]?.[0]?.level).toBe(1);
    expect(yearWeeksOf(days, 1).map((week) => week[0]?.key)).toEqual(["2026-10-05"]);
    expect(yearTotalOf(days)).toBe(10);
  });

  it("draws nothing for a series that is not daily", () => {
    expect(yearWeeksOf([point("2026-10", 4)], 53)).toEqual([]);
  });
});

describe("weekdayTotalsOf and heatPeakText", () => {
  const cells = [
    [0, 4, 0],
    [1, 1, 6],
  ];

  it("sums each day and scales it to the busiest day", () => {
    expect(weekdayTotalsOf(cells, ["Mon", "Tue"])).toEqual([
      { day: "Mon", share: 0.5, text: "4" },
      { day: "Tue", share: 1, text: "8" },
    ]);
  });

  it("names the busiest hour, and nothing without plays", () => {
    expect(heatPeakText(cells, ["Mon", "Tue"])).toBe("Busiest at Tue 2:00");
    expect(heatPeakText([[0]], ["Mon"])).toBeNull();
  });
});
