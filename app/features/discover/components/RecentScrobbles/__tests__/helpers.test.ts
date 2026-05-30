import { describe, expect, it } from "vitest";

import { describeScrobbleAge } from "../helpers";

const NOW = new Date("2026-05-29T12:00:00.000Z").getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("describeScrobbleAge", () => {
  it("returns 'now' when playedAt is null", () => {
    expect(describeScrobbleAge(null, NOW)).toBe("now");
  });

  it("returns 'now' when playedAt is undefined", () => {
    expect(describeScrobbleAge(undefined, NOW)).toBe("now");
  });

  it("returns 'just now' for under a minute", () => {
    expect(describeScrobbleAge(new Date(NOW - 30 * 1000).toISOString(), NOW)).toBe("just now");
  });

  it("returns 'Nm ago' under an hour", () => {
    expect(describeScrobbleAge(new Date(NOW - 5 * MIN).toISOString(), NOW)).toBe("5m ago");
  });

  it("returns 'Nh ago' under a day", () => {
    expect(describeScrobbleAge(new Date(NOW - 3 * HOUR).toISOString(), NOW)).toBe("3h ago");
  });

  it("returns 'Nd ago' for older scrobbles", () => {
    expect(describeScrobbleAge(new Date(NOW - 4 * DAY).toISOString(), NOW)).toBe("4d ago");
  });
});
