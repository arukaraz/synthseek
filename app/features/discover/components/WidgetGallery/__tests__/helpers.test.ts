import { describe, expect, it } from "vitest";

import type { BoardWidgetKey } from "@hooks/api/queries/board/types";

import { BOARD_WIDGETS } from "../../ExploreBoard/constants";
import { PREVIEW_BOX } from "../constants";
import { countInCategory, galleryGroups, matchesQuery, previewFrame } from "../helpers";
import type { GalleryEntry } from "../types";

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
  it("groups every entry by category in board order when showing all", () => {
    const groups = galleryGroups(ENTRIES, "", "all", new Map());

    expect(groups.map((group) => group.category)).toEqual(["now", "history", "discover", "library"]);
    expect(groups[1]?.entries.map((item) => item.widget)).toEqual(["topTracks", "scrobbles"]);
  });

  it("keeps only the chosen category", () => {
    const groups = galleryGroups(ENTRIES, "", "history", new Map());

    expect(groups.map((group) => group.category)).toEqual(["history"]);
  });

  it("searches across every category even when one is chosen", () => {
    const groups = galleryGroups(ENTRIES, "recent", "now", new Map());

    expect(groups.map((group) => group.category)).toEqual(["history", "library"]);
  });

  it("counts how many of each group's entries are on the board and drops empty groups", () => {
    const groups = galleryGroups(ENTRIES, "", "all", new Map([["scrobbles", "s"]]));

    expect(groups.find((group) => group.category === "history")?.onBoard).toBe(1);
    expect(galleryGroups(ENTRIES, "nothing matches", "all", new Map())).toEqual([]);
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
