import { describe, expect, it } from "vitest";

import { emptyReasonOf, formatPlaycount, topTrackItem } from "../helpers";
import { createTopTrack } from "./fixtures";

describe("topTrackItem", () => {
  it("draws the track with its artist and its plays as the value, with nothing to act on", () => {
    expect(topTrackItem(createTopTrack(), "4.2k plays")).toMatchObject({
      key: "deezer:1",
      title: "Windowlicker",
      subtitle: "Aphex Twin",
      cover: "https://img/windowlicker.jpg",
      value: "4.2k plays",
      play: null,
      request: null,
      open: null,
    });
  });
});

describe("emptyReasonOf", () => {
  const ready = { status: "ready" as const, username: "aphex", topTracks: [], recentTracks: [] };

  it("names the reason the tile has nothing to rank", () => {
    expect(emptyReasonOf({ isError: true, data: undefined, empty: true })).toBe("error");
    expect(emptyReasonOf({ isError: false, data: { status: "inactive" }, empty: true })).toBe("inactive");
    expect(emptyReasonOf({ isError: false, data: { status: "unlinked" }, empty: true })).toBe("unlinked");
    expect(emptyReasonOf({ isError: false, data: ready, empty: true })).toBe("no-data");
  });

  it("names none while loading or once there is something to rank", () => {
    expect(emptyReasonOf({ isError: false, data: undefined, empty: true })).toBeNull();
    expect(emptyReasonOf({ isError: false, data: ready, empty: false })).toBeNull();
  });
});

describe("formatPlaycount", () => {
  it("returns plain integer under 1000", () => {
    expect(formatPlaycount(0)).toBe("0");
    expect(formatPlaycount(412)).toBe("412");
    expect(formatPlaycount(999)).toBe("999");
  });

  it("returns one-decimal k between 1000 and 10000", () => {
    expect(formatPlaycount(1234)).toBe("1.2k");
    expect(formatPlaycount(9876)).toBe("9.9k");
  });

  it("returns rounded k above 10000", () => {
    expect(formatPlaycount(15678)).toBe("16k");
    expect(formatPlaycount(412345)).toBe("412k");
  });
});
