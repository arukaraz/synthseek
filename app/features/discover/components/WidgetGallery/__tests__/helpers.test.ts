import { describe, expect, it } from "vitest";

import type { BoardWidgetKey } from "@hooks/api/queries/board/types";

import { BOARD_WIDGETS } from "../../ExploreBoard/constants";
import { DEFAULT_GALLERY_FILTERS, PREVIEW_BOX } from "../constants";
import { countInCategory, galleryGroups, matchesQuery, previewFrame, problemText } from "../helpers";
import type { GalleryEntry, GalleryFilters } from "../types";

function entry(widget: BoardWidgetKey, title: string, description = ""): GalleryEntry {
  return { widget, definition: BOARD_WIDGETS[widget], title, description };
}

const ENTRIES: GalleryEntry[] = [
  entry("trending", "Trending now", "Catalog charts"),
  entry("topTracks", "Top tracks", "Most scrobbled"),
  entry("scrobbles", "Recent scrobbles", "Latest plays"),
  entry("mixes", "Discover mixes", "ListenBrainz playlists"),
  entry("requests", "Recent requests", "What you asked for"),
];

describe("matchesQuery", () => {
  it("matches title or description, ignoring case and outer spaces", () => {
    expect(matchesQuery(ENTRIES[0], "  TRENDING ")).toBe(true);
    expect(matchesQuery(ENTRIES[3], "listenbrainz")).toBe(true);
    expect(matchesQuery(ENTRIES[0], "brainz")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery(ENTRIES[0], "   ")).toBe(true);
  });
});

describe("galleryGroups", () => {
  const widgetsOf = (filters: Partial<GalleryFilters>, onBoard = new Map<BoardWidgetKey, string>()) =>
    galleryGroups(ENTRIES, { ...DEFAULT_GALLERY_FILTERS, ...filters }, onBoard).map((group) => [
      group.category,
      group.entries.map((item) => item.widget),
    ]);

  it("lists every entry in the curated board order without bands by default", () => {
    expect(widgetsOf({})).toEqual([[null, ["trending", "topTracks", "scrobbles", "mixes", "requests"]]]);
  });

  it("groups by category in board order only when sorted by category, and reverses both when descending", () => {
    expect(widgetsOf({ sort: "category" }).map(([category]) => category)).toEqual([
      "now",
      "history",
      "discover",
      "library",
    ]);
    expect(widgetsOf({ sort: "category", direction: "desc" })[0]).toEqual(["library", ["requests"]]);
  });

  it("sorts by name and puts what is on the board first", () => {
    expect(widgetsOf({ sort: "name" })[0]?.[1]).toEqual(["mixes", "requests", "scrobbles", "topTracks", "trending"]);
    expect(widgetsOf({ sort: "onBoardFirst" }, new Map([["mixes", "m"]]))[0]?.[1]).toEqual([
      "mixes",
      "trending",
      "topTracks",
      "scrobbles",
      "requests",
    ]);
  });

  it("keeps only the chosen category, and searches across every category even when one is chosen", () => {
    expect(widgetsOf({ category: "history" })).toEqual([[null, ["topTracks", "scrobbles"]]]);
    expect(widgetsOf({ category: "now", query: "recent" })).toEqual([[null, ["scrobbles", "requests"]]]);
  });

  it("filters by board presence and counts what is on the board", () => {
    const onBoard = new Map<BoardWidgetKey, string>([["scrobbles", "s"]]);
    expect(widgetsOf({ board: "on" }, onBoard)).toEqual([[null, ["scrobbles"]]]);
    expect(widgetsOf({ board: "off" }, onBoard)[0]?.[1]).not.toContain("scrobbles");
    expect(galleryGroups(ENTRIES, { ...DEFAULT_GALLERY_FILTERS, sort: "category" }, onBoard)[1]?.onBoard).toBe(1);
    expect(widgetsOf({ query: "nothing matches" })).toEqual([]);
  });
});

describe("countInCategory", () => {
  it("counts the entries of one category", () => {
    expect(countInCategory(ENTRIES, "history")).toBe(2);
    expect(countInCategory(ENTRIES, "now")).toBe(1);
  });
});

describe("previewFrame", () => {
  it("scales a full-row tile to the preview width", () => {
    const frame = previewFrame("genres");

    expect(frame.stageWidth).toBe(1200);
    expect(frame.stageHeight).toBe(600);
    expect(frame.scale).toBeCloseTo(0.25);
    expect(frame.width).toBe(PREVIEW_BOX.width);
    expect(frame.height).toBe(PREVIEW_BOX.height);
  });

  it("scales a half-width tile to the preview height", () => {
    const frame = previewFrame("rarities");

    expect(frame.stageWidth).toBe(592);
    expect(frame.stageHeight).toBe(336);
    expect(frame.height).toBe(PREVIEW_BOX.height);
    expect(frame.width).toBeLessThanOrEqual(PREVIEW_BOX.width);
  });
});

describe("problemText", () => {
  it("names an invalid field without the raw validation code", () => {
    const text = problemText({ code: "invalidField", reason: "invalid_value" });
    expect(text).toBe("This value is not valid.");
    expect(text).not.toContain("invalid_value");
  });
});
