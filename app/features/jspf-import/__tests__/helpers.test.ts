import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { MAX_FILE_BYTES } from "../constants";
import {
  buildSelectionArray,
  coverageLabel,
  fetchTextFromUrl,
  filenameFromUrl,
  formatDurationMs,
  formatFromName,
  formatFromUrl,
  generateJobId,
  matchConfidence,
  newDownloadsCount,
  orderedTrackEntries,
  readFileAsText,
  selectedCount,
  selectedDurationMs,
  totalMatched,
  trackKey,
} from "../helpers";
import type { CollectionCoverage, ImportPreviewResult, TrackCoverage } from "../types";

function coverage(overrides: Partial<TrackCoverage> = {}): TrackCoverage {
  return {
    title: "Digital Love",
    artist: "Daft Punk",
    image: null,
    durationMs: 301_000,
    matched: true,
    method: "isrc",
    alreadyInLibrary: false,
    ...overrides,
  };
}

function collection(tracks: TrackCoverage[], overrides: Partial<CollectionCoverage> = {}): CollectionCoverage {
  return {
    name: "Playlist",
    type: "playlist",
    total: tracks.length,
    matched: tracks.filter((track) => track.matched).length,
    unmatched: tracks.filter((track) => !track.matched).length,
    alreadyInLibrary: tracks.filter((track) => track.alreadyInLibrary).length,
    tracks,
    ...overrides,
  };
}

function preview(collections: CollectionCoverage[]): ImportPreviewResult {
  return { collections };
}

describe("reading the format off a name", () => {
  it("recognises each playlist format the importer takes", () => {
    expect(formatFromName("mix.jspf")).toBe("jspf");
    expect(formatFromName("mix.xspf")).toBe("xspf");
    expect(formatFromName("mix.csv")).toBe("csv");
  });

  it("ignores the case the extension was written in", () => {
    expect(formatFromName("MIX.JSPF")).toBe("jspf");
  });

  it("refuses a file it cannot parse", () => {
    expect(formatFromName("mix.m3u")).toBeNull();
    expect(formatFromName("mix")).toBeNull();
  });
});

describe("reading the format off a URL", () => {
  it("reads the extension out of the path, ignoring the query", () => {
    expect(formatFromUrl("https://example.com/lists/mix.jspf?token=abc")).toBe("jspf");
  });

  it("refuses a URL whose path names no format", () => {
    expect(formatFromUrl("https://example.com/lists/mix")).toBeNull();
  });

  it("refuses something that is not a URL at all", () => {
    expect(formatFromUrl("not a url")).toBeNull();
  });
});

describe("naming the import after its URL", () => {
  it("takes the last path segment as the name", () => {
    expect(filenameFromUrl("https://example.com/lists/summer.jspf")).toBe("summer.jspf");
  });

  it("falls back to a generic name when the path names nothing", () => {
    expect(filenameFromUrl("https://example.com/")).toBe("playlist");
  });

  it("falls back to a generic name for something that is not a URL", () => {
    expect(filenameFromUrl("not a url")).toBe("playlist");
  });
});

describe("generateJobId", () => {
  it("gives every import its own id", () => {
    expect(generateJobId()).not.toBe(generateJobId());
  });
});

describe("reading the file the listener chose", () => {
  it("reads a file the importer can hold in memory", async () => {
    const file = new File(["<playlist/>"], "mix.xspf");
    Object.defineProperty(file, "text", { value: () => Promise.resolve("<playlist/>") });

    await expect(readFileAsText(file)).resolves.toBe("<playlist/>");
  });

  it("refuses a file too large to hold, naming the limit to the listener", async () => {
    const file = new File(["x"], "mix.jspf");
    Object.defineProperty(file, "size", { value: MAX_FILE_BYTES + 1 });
    Object.defineProperty(file, "text", { value: () => Promise.resolve("x") });

    await expect(readFileAsText(file)).rejects.toThrow(enLibrary.jspfImport.errors.fileTooLarge);
  });
});

describe("fetching the playlist behind a URL", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the body the server sent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 }))
    );

    await expect(fetchTextFromUrl("https://example.com/mix.jspf")).resolves.toBe("{}");
  });

  it("names the status when the server refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 }))
    );

    await expect(fetchTextFromUrl("https://example.com/mix.jspf")).rejects.toThrow("404");
  });
});

describe("coverageLabel", () => {
  it("reports how much of the playlist was matched", () => {
    const label = coverageLabel(collection([coverage(), coverage({ matched: false, method: "unmatched" })]));

    expect(label).toContain("1");
    expect(label).toContain("2");
  });

  it("mentions the tracks the library already holds", () => {
    const label = coverageLabel(collection([coverage({ alreadyInLibrary: true })]));

    expect(label).toContain(enLibrary.jspfImport.coverage.alreadyInLibrary.replace("{{count}}", "1"));
  });

  it("says nothing about matters that do not apply to this playlist", () => {
    const label = coverageLabel(collection([coverage()]));

    expect(label).not.toContain(enLibrary.jspfImport.coverage.unmatched.replace("{{count}}", "0"));
    expect(label.split(" · ")).toHaveLength(1);
  });
});

describe("totalMatched", () => {
  it("adds the matches across every playlist in the file", () => {
    expect(totalMatched(preview([collection([coverage()]), collection([coverage(), coverage()])]))).toBe(3);
  });

  it("counts nothing for an empty file", () => {
    expect(totalMatched(preview([]))).toBe(0);
  });
});

describe("matchConfidence", () => {
  it("calls a track nothing matched it at all", () => {
    expect(matchConfidence("unmatched")).toBeNull();
  });

  it("calls a fuzzy search an approximation, since the listener may want to check it", () => {
    expect(matchConfidence("smart-search")).toBe("approx");
  });

  it("calls an identifier match exact", () => {
    expect(matchConfidence("isrc")).toBe("exact");
  });
});

describe("orderedTrackEntries", () => {
  it("puts what needs the listener's attention first and what is settled last", () => {
    const tracks = [
      coverage({ title: "settled", alreadyInLibrary: true }),
      coverage({ title: "will download" }),
      coverage({ title: "needs a look", method: "smart-search" }),
      coverage({ title: "no match", matched: false, method: "unmatched" }),
    ];

    expect(orderedTrackEntries(tracks, "").map(([, track]) => track.title)).toEqual([
      "no match",
      "needs a look",
      "will download",
      "settled",
    ]);
  });

  it("keeps the original index so a toggle still points at the right track", () => {
    const tracks = [
      coverage({ title: "settled", alreadyInLibrary: true }),
      coverage({ title: "no match", matched: false }),
    ];

    expect(orderedTrackEntries(tracks, "").map(([index]) => index)).toEqual([1, 0]);
  });

  it("filters on the title and on the artist together", () => {
    const tracks = [coverage({ title: "Digital Love" }), coverage({ title: "Windowlicker", artist: "Aphex Twin" })];

    expect(orderedTrackEntries(tracks, "aphex").map(([, track]) => track.title)).toEqual(["Windowlicker"]);
  });

  it("ignores the case and the padding the listener typed", () => {
    const tracks = [coverage({ title: "Digital Love" }), coverage({ title: "Windowlicker" })];

    expect(orderedTrackEntries(tracks, "  DIGITAL  ")).toHaveLength(1);
  });

  it("keeps every track when the search box is empty", () => {
    const tracks = [coverage({ title: "Digital Love" }), coverage({ title: "Windowlicker" })];

    expect(orderedTrackEntries(tracks, "   ")).toHaveLength(2);
  });
});

describe("the selection", () => {
  const twoCollections = preview([
    collection([coverage({ title: "a" }), coverage({ title: "b" })]),
    collection([coverage({ title: "c" })]),
  ]);

  it("keys a track by the playlist it belongs to as well as its place in it", () => {
    expect(trackKey(1, 2)).toBe("1:2");
  });

  it("lists the chosen tracks per playlist, in the shape the commit takes", () => {
    const selected = new Set([trackKey(0, 1), trackKey(1, 0)]);

    expect(buildSelectionArray(twoCollections, selected)).toEqual([[1], [0]]);
  });

  it("leaves a playlist nothing was chosen from as an empty list, not a missing one", () => {
    expect(buildSelectionArray(twoCollections, new Set([trackKey(0, 0)]))).toEqual([[0], []]);
  });

  it("counts everything the listener chose", () => {
    expect(selectedCount(twoCollections, new Set([trackKey(0, 0), trackKey(1, 0)]))).toBe(2);
  });

  it("counts only what will actually be downloaded, not what the library already holds", () => {
    const mixed = preview([
      collection([coverage({ alreadyInLibrary: true }), coverage(), coverage({ matched: false })]),
    ]);
    const all = new Set([trackKey(0, 0), trackKey(0, 1), trackKey(0, 2)]);

    expect(newDownloadsCount(mixed, all)).toBe(1);
  });

  it("adds up how long the chosen tracks run", () => {
    expect(selectedDurationMs(twoCollections, new Set([trackKey(0, 0), trackKey(0, 1)]))).toBe(602_000);
  });

  it("adds up to nothing when the listener chose nothing", () => {
    expect(selectedDurationMs(twoCollections, new Set())).toBe(0);
  });
});

describe("formatDurationMs", () => {
  it("reads a short playlist in minutes", () => {
    expect(formatDurationMs(25 * 60_000)).toBe(enLibrary.jspfImport.duration.minutes.replace("{{count}}", "25"));
  });

  it("reads a long playlist in hours and minutes", () => {
    expect(formatDurationMs(95 * 60_000)).toBe(
      enLibrary.jspfImport.duration.hoursMinutes.replace("{{hours}}", "1").replace("{{minutes}}", "35")
    );
  });

  it("switches to hours exactly at the hour", () => {
    expect(formatDurationMs(60 * 60_000)).toContain("1");
  });
});
