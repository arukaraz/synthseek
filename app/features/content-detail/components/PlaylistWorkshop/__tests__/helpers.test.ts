import { describe, expect, it } from "vitest";

import { arrangeTracks, gathered, nudged, removalsOf, sameOrder, totalMinutes, workshopTracks } from "../helpers";
import type { WorkshopTrack } from "../types";

function track(requestId: string, overrides?: Partial<WorkshopTrack>): WorkshopTrack {
  return {
    externalId: `ext-${requestId}`,
    title: `Title ${requestId}`,
    artist: "Artist",
    artistExternalId: null,
    durationMs: 60_000,
    trackNumber: 1,
    plays: null,
    hasPreview: false,
    album: null,
    inLibrary: true,
    requestId,
    slskd_request_id: null,
    status: "complete",
    failureReason: null,
    ...overrides,
  };
}

const ids = (tracks: readonly WorkshopTrack[]) => tracks.map((entry) => entry.requestId);

describe("arrangeTracks", () => {
  const stored = [track("a"), track("b"), track("c")];

  it("keeps the stored order while nothing was moved", () => {
    expect(ids(arrangeTracks(stored, null))).toEqual(["a", "b", "c"]);
  });

  it("follows the order the user arranged", () => {
    expect(ids(arrangeTracks(stored, ["c", "a", "b"]))).toEqual(["c", "a", "b"]);
  });

  it("drops an arranged id the playlist no longer holds and appends a track the arrangement never saw", () => {
    expect(ids(arrangeTracks(stored, ["gone", "b"]))).toEqual(["b", "a", "c"]);
  });

  it("places a repeated id once", () => {
    expect(ids(arrangeTracks(stored, ["b", "b", "a", "c"]))).toEqual(["b", "a", "c"]);
  });
});

describe("sameOrder", () => {
  it("tells an identical order from a moved one and from a shorter one", () => {
    expect(sameOrder(["a", "b"], ["a", "b"])).toBe(true);
    expect(sameOrder(["a", "b"], ["b", "a"])).toBe(false);
    expect(sameOrder(["a", "b"], ["a"])).toBe(false);
  });
});

describe("nudged", () => {
  it("moves a track one place down and one place up", () => {
    expect(nudged(["a", "b", "c"], "a", 1)).toEqual(["b", "a", "c"]);
    expect(nudged(["a", "b", "c"], "c", -1)).toEqual(["a", "c", "b"]);
  });

  it("leaves the order alone at either end and for an id it does not hold", () => {
    expect(nudged(["a", "b", "c"], "a", -1)).toEqual(["a", "b", "c"]);
    expect(nudged(["a", "b", "c"], "c", 1)).toEqual(["a", "b", "c"]);
    expect(nudged(["a", "b", "c"], "z", 1)).toEqual(["a", "b", "c"]);
  });
});

describe("gathered", () => {
  it("moves the picked tracks to the top keeping their relative order", () => {
    expect(gathered(["a", "b", "c", "d"], new Set(["d", "b"]), "top")).toEqual(["b", "d", "a", "c"]);
  });

  it("moves the picked tracks to the bottom keeping their relative order", () => {
    expect(gathered(["a", "b", "c", "d"], new Set(["c", "a"]), "bottom")).toEqual(["b", "d", "a", "c"]);
  });
});

describe("removalsOf", () => {
  it("records each picked track with the position it holds on screen", () => {
    const ordered = [track("a"), track("b"), track("c")];

    expect(removalsOf(ordered, new Set(["c", "a"]))).toEqual([
      { trackId: "a", position: 0, title: "Title a" },
      { trackId: "c", position: 2, title: "Title c" },
    ]);
  });

  it("leaves out a picked track that is still on its way", () => {
    const ordered = [track("a", { status: "downloading" }), track("b")];

    expect(removalsOf(ordered, new Set(["a", "b"]))).toEqual([{ trackId: "b", position: 1, title: "Title b" }]);
  });
});

describe("totalMinutes", () => {
  it("adds the lengths and rounds to the minute", () => {
    expect(totalMinutes([track("a", { durationMs: 90_000 }), track("b", { durationMs: 45_000 })])).toBe(2);
    expect(totalMinutes([])).toBe(0);
  });
});

describe("workshopTracks", () => {
  it("keeps only the rows that belong to the playlist as requests", () => {
    const rows = [{ requestId: "a" }, { requestId: null }, { requestId: "c" }];

    expect(workshopTracks(rows)).toEqual([{ requestId: "a" }, { requestId: "c" }]);
  });
});
