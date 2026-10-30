import { describe, expect, it } from "vitest";

import {
  activeDeliveries,
  deltaOf,
  formatPercent,
  landedShare,
  listeningTimeLabel,
  qualityRows,
  totalOf,
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
