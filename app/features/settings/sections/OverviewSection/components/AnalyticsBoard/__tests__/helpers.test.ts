import { describe, expect, it } from "vitest";

import {
  activeDeliveries,
  clockPeak,
  deltaOf,
  formatPercent,
  heatLevel,
  landedShare,
  listeningTimeLabel,
  qualityRows,
  sparkBars,
  sparkPath,
  totalOf,
  weekdayLabels,
  windowTotals,
} from "../helpers";

describe("windowTotals", () => {
  it("sums the latest window and the one before it", () => {
    expect(windowTotals([1, 2, 3, 4, 5, 6], 2)).toEqual({ current: 11, previous: 7 });
    expect(totalOf([])).toBe(0);
  });
});

describe("deltaOf", () => {
  it("reports the signed change against the previous window", () => {
    expect(deltaOf(15, 10)).toEqual({ tone: "success", label: "+50%" });
    expect(deltaOf(5, 10)).toEqual({ tone: "danger", label: "-50%" });
    expect(deltaOf(10, 10)).toEqual({ tone: "muted", label: "0%" });
  });

  it("calls a first window new and stays silent when both are empty", () => {
    expect(deltaOf(3, 0)).toEqual({ tone: "muted", label: "New" });
    expect(deltaOf(0, 0)).toBeNull();
  });
});

describe("formatPercent and listeningTimeLabel", () => {
  it("formats shares and listening time", () => {
    expect(formatPercent(0.926)).toBe("93%");
    expect(listeningTimeLabel(125)).toBe("2h 05m");
    expect(listeningTimeLabel(0)).toBe("0h 00m");
  });
});

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

describe("landedShare", () => {
  it("is the landed share of finished requests, or null with none", () => {
    expect(landedShare(3, 1)).toBe(0.75);
    expect(landedShare(0, 0)).toBeNull();
  });
});

describe("qualityRows", () => {
  it("ranks formats by count, keeps the limit and works out each share", () => {
    const rows = qualityRows(
      [
        { format: "mp3", count: 1 },
        { format: "flac", count: 3 },
        { format: "opus", count: 0 },
      ],
      4,
      2
    );
    expect(rows).toEqual([
      { format: "flac", count: 3, share: 0.75 },
      { format: "mp3", count: 1, share: 0.25 },
    ]);
  });
});

describe("activeDeliveries", () => {
  it("keeps only the services that delivered or tried to", () => {
    const services = activeDeliveries([
      { service: "lastfm", sent: 0, pending: 0, failed: 1 },
      { service: "listenbrainz", sent: 0, pending: 0, failed: 0 },
    ]);
    expect(services.map((service) => service.service)).toEqual(["lastfm"]);
  });
});

describe("clockPeak and heatLevel", () => {
  it("finds the busiest hour, keeping the first one on a tie", () => {
    expect(
      clockPeak([
        [0, 2, 0],
        [2, 5, 5],
      ])
    ).toEqual({ day: 1, hour: 1, count: 5 });
    expect(clockPeak([[0, 0]])).toBeNull();
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
