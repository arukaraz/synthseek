import { describe, expect, it, vi } from "vitest";

import {
  createAlbumResult,
  createArtistResult,
  createBucketResult,
  createFeedAlbumResult,
  createFeedAlbumRow,
  createFeedArtistResult,
  createFeedArtistRow,
  createFeedEventResult,
  createFeedEventRow,
  createFeedTrackResult,
  createFeedTrackRow,
  createMatrixResult,
  createNewsResult,
  createRecipeAlbumRow,
  createRecipeTrackRow,
  createSeriesResult,
  createServerPlaylistResult,
  createServerPlaylistRow,
  createSetList,
  createSetResult,
  createTrackResult,
} from "@test/factories";

import {
  calendarPartsOf,
  customWidgetNote,
  fieldText,
  itemControls,
  measureText,
  mixItemOf,
  moveDirection,
  moveOf,
  moveText,
  setHiddenNote,
  setStatusOf,
  suggestBlocks,
  viewIsEmpty,
  widgetCellsOf,
  widgetIconOf,
  widgetItemsOf,
  widgetPointsOf,
  widgetStatsOf,
  widgetViewOf,
  withListOpening,
} from "../helpers";
import { WIDGET_ICONS } from "../constants";
import type { WidgetHandlers, WidgetItem, WidgetItemControls } from "../types";

const WINDOW = { from: new Date("2026-08-30T00:00:00Z"), to: new Date("2026-09-29T00:00:00Z") };

const ARTIST_ROW = {
  id: "r1",
  artistId: null,
  name: "Artist F",
  cover: null,
  tracks: 0,
  plays: 0,
  playedAt: null,
  favorite: false,
  value: 0,
  prev: null,
};

function handlers(): WidgetHandlers {
  return {
    play: vi.fn(),
    shuffle: vi.fn(),
    radio: vi.fn(),
    request: vi.fn(),
    customize: vi.fn(),
    open: vi.fn(),
    openUrl: vi.fn(),
  };
}

function onlyItem(items: WidgetItem[]): WidgetItem {
  const [item] = items;
  if (!item) throw new Error("no item");
  return item;
}

describe("widgetItemsOf", () => {
  it("shows a played track with its measure and plays it by its library id", () => {
    const item = onlyItem(widgetItemsOf(createTrackResult([createRecipeTrackRow()]), undefined));
    expect(item).toMatchObject({ title: "Song One", subtitle: "Artist A", value: "12 plays", date: "2026-10-28" });
    expect(item.play).toEqual({ kind: "tracks", trackIds: ["req-1"] });
    expect(item.request).toBeNull();
  });

  it("offers no playback for a track that is not in the library", () => {
    const item = onlyItem(widgetItemsOf(createTrackResult([createRecipeTrackRow({ inLibrary: false })]), undefined));
    expect(item.play).toBeNull();
  });

  it("opens and requests an album by its catalog id and plays it only when it is in the library", () => {
    const owned = onlyItem(widgetItemsOf(createAlbumResult([createRecipeAlbumRow()]), undefined));
    expect(owned.play).toEqual({ kind: "album", albumExternalId: "dz-album-1" });
    expect(owned.open).toMatchObject({ mode: "album", id: "dz-album-1" });
    expect(owned.request).toMatchObject({ type: "album", id: "dz-album-1", name: "Album One" });

    const missing = onlyItem(widgetItemsOf(createAlbumResult([createRecipeAlbumRow({ inLibrary: false })]), undefined));
    expect(missing.play).toBeNull();
    expect(missing.request).not.toBeNull();
  });

  it("gives a feed album without a catalog id nothing to open, request or play", () => {
    const item = onlyItem(widgetItemsOf(createFeedAlbumResult([createFeedAlbumRow()]), undefined));
    expect(item).toMatchObject({ play: null, request: null, open: null, date: "2026-11-07" });
  });

  it("plays a feed album that the library already holds through its catalog id", () => {
    const row = createFeedAlbumRow({ catalogAlbumId: "dz-9", inLibrary: true });
    const item = onlyItem(widgetItemsOf(createFeedAlbumResult([row]), undefined));
    expect(item.play).toEqual({ kind: "album", albumExternalId: "dz-9" });
    expect(item.request).toMatchObject({ id: "dz-9" });
  });

  it("plays and opens a server playlist through the Synthseek playlist it mirrors, and names its server", () => {
    const item = onlyItem(widgetItemsOf(createServerPlaylistResult([createServerPlaylistRow()]), undefined));
    expect(item).toMatchObject({ title: "Road trip", subtitle: "12 tracks · Plex", request: null, link: null });
    expect(item.play).toEqual({ kind: "playlist", playlistId: "pl-1" });
    expect(item.open).toMatchObject({ id: "pl-1", name: "Road trip" });
  });

  it("leaves a server playlist with no Synthseek copy nothing to play or open, and skips an unknown count", () => {
    const row = createServerPlaylistRow({ playlistId: null, tracks: null, server: "navidrome" });
    const item = onlyItem(widgetItemsOf(createServerPlaylistResult([row]), undefined));
    expect(item).toMatchObject({ subtitle: "Navidrome", play: null, open: null });
  });

  it("labels a decade bucket with its suffix and keeps a genre label as it is", () => {
    const decade = { key: "1990", label: "1990", value: 40, prev: null };
    expect(onlyItem(widgetItemsOf(createBucketResult([decade], "decades"), undefined)).title).toBe("1990s");
    const genre = { key: "rock", label: "Rock", value: 5, prev: null };
    expect(onlyItem(widgetItemsOf(createBucketResult([genre]), undefined)).title).toBe("Rock");
  });

  it("returns no items for a series or matrix result", () => {
    const series = { ...createTrackResult([]), dataset: "series" as const, shape: "series" as const, rows: [] };
    expect(widgetItemsOf(series, undefined)).toEqual([]);
  });

  it("reads a bound field for a slot and falls back when the field is missing", () => {
    const result = createTrackResult([createRecipeTrackRow()]);
    expect(onlyItem(widgetItemsOf(result, { subtitle: "album" })).subtitle).toBe("Album A");
    expect(onlyItem(widgetItemsOf(result, { subtitle: "nope" })).subtitle).toBe("Artist A");
  });
});

describe("fieldText", () => {
  it("formats numbers and leaves booleans and nulls out", () => {
    expect(fieldText({ plays: 1200 }, "plays")).toBe("1.2K");
    expect(fieldText({ inLibrary: true, cover: null }, "inLibrary")).toBeNull();
    expect(fieldText({ inLibrary: true, cover: null }, "cover")).toBeNull();
  });
});

describe("measureText", () => {
  it("names the movement of a rank delta", () => {
    expect(measureText("rankDelta", null, null)).toBe("New");
    expect(measureText("rankDelta", 0, null)).toBe("Same");
    expect(measureText("rankDelta", 3, null)).toBe("Up 3");
    expect(measureText("rankDelta", -2, null)).toBe("Down 2");
  });

  it("rounds minutes and counts tracks", () => {
    expect(measureText("minutes", 41.6, null)).toBe("42 min");
    expect(measureText("distinctTracks", 1, null)).toBe("1 track");
  });

  it("shows the date of a date measure, and nothing without one", () => {
    expect(measureText("lastPlayed", null, null)).toBeNull();
    expect(measureText("addedAt", null, new Date(Date.now() - 2 * 86_400_000))).toBe("2d ago");
  });
});

describe("widgetStatsOf", () => {
  it("turns buckets into labelled values with the change against the previous window", () => {
    const stats = widgetStatsOf(createBucketResult([{ key: "rock", label: "Rock", value: 12, prev: 9 }]));
    expect(stats).toEqual([{ key: "rock", label: "Rock", value: "12", delta: 3 }]);
  });

  it("reads a ranked result as one stat per row", () => {
    const row = createRecipeTrackRow({ value: 12, prev: 10 });
    expect(widgetStatsOf(createTrackResult([row]))).toEqual([{ key: row.id, label: row.title, value: "12", delta: 2 }]);
  });
});

describe("itemControls", () => {
  const item = onlyItem(widgetItemsOf(createAlbumResult([createRecipeAlbumRow()]), undefined));

  it("puts a play button on the cover and opens the details on select", () => {
    const calls = handlers();
    const controls = itemControls(item, "play", calls);
    controls.coverAction?.onClick();
    controls.onSelect?.();
    expect(controls.coverAction).toMatchObject({ kind: "play", label: "Play Album One" });
    expect(calls.play).toHaveBeenCalledWith({ kind: "album", albumExternalId: "dz-album-1" });
    expect(calls.open).toHaveBeenCalledWith(expect.objectContaining({ id: "dz-album-1" }));
  });

  it("puts a request button on the cover for the request action", () => {
    const calls = handlers();
    itemControls(item, "request", calls).coverAction?.onClick();
    expect(calls.request).toHaveBeenCalledWith(expect.objectContaining({ type: "album", id: "dz-album-1" }));
  });

  it("offers no request button for an artist, which has nothing to request directly", () => {
    const artistItem: WidgetItem = {
      ...item,
      request: { type: "artist", id: "dz-artist-1", name: "Artist One", images: [], genres: [], followers: null },
    };
    expect(itemControls(artistItem, "request", handlers()).coverAction).toBeUndefined();
  });

  it("only opens for the open action, and does nothing for none", () => {
    expect(itemControls(item, "open", handlers()).coverAction).toBeUndefined();
    expect(itemControls(item, "none", handlers())).toEqual({});
  });

  it("drops the play button when the item has nothing to play", () => {
    const controls = itemControls({ ...item, play: null }, "play", handlers());
    expect(controls.coverAction).toBeUndefined();
    expect(controls.onSelect).toBeDefined();
  });
});

describe("customWidgetNote", () => {
  const result = createTrackResult([]);

  it("prefers the error, then the missing integration, then empty", () => {
    expect(customWidgetNote({ result, isError: true, empty: true })).toBe("Couldn't load this right now.");
    expect(customWidgetNote({ result: createFeedAlbumResult([], "lastfm"), isError: false, empty: true })).toEqual({
      i18nKey: "customWidget.needs.lastfm",
      href: "/settings/connections/services#lastfm",
    });
    expect(customWidgetNote({ result, isError: false, empty: true })).toBe("Nothing matches this widget right now.");
    expect(customWidgetNote({ result, isError: false, empty: false })).toBeNull();
  });
});

describe("moveOf and moveText", () => {
  it("reads a rank delta as places moved and a missing one as new", () => {
    expect(moveOf("rankDelta", { value: 3, prev: null }, true)).toEqual({ kind: "rank", by: 3 });
    expect(moveOf("rankDelta", { value: null, prev: null }, true)).toEqual({ kind: "new" });
    expect(moveText({ kind: "rank", by: -2 })).toBe("Down 2");
  });

  it("measures the change of any other measure only when the recipe compares", () => {
    expect(moveOf("plays", { value: 12, prev: 9 }, true)).toEqual({ kind: "value", by: 3 });
    expect(moveOf("plays", { value: 12, prev: null }, true)).toEqual({ kind: "new" });
    expect(moveOf("plays", { value: 12, prev: 9 }, false)).toBeNull();
    expect(moveText({ kind: "value", by: 3 })).toBe("+3");
    expect(moveDirection({ kind: "value", by: 0 })).toBe("same");
  });

  it("carries the move of a compared track row into its item", () => {
    const result = { ...createTrackResult([createRecipeTrackRow({ value: 5, prev: 8 })]), previous: WINDOW };
    expect(onlyItem(widgetItemsOf(result, undefined)).move).toEqual({ kind: "value", by: -3 });
  });
});

describe("widgetPointsOf and widgetCellsOf", () => {
  it("labels daily and monthly series keys as dates and keeps the measure text", () => {
    const points = widgetPointsOf(
      createSeriesResult([
        { key: "2026-10-27", value: 4, prev: 2 },
        { key: "2026-10", value: 30, prev: null },
      ])
    );
    expect(points.map((point) => point.label)).toEqual(["Oct 27", "Oct 2026"]);
    expect(points[0]).toMatchObject({ value: 4, prev: 2, text: "4 plays", prevText: "2 plays" });
  });

  it("counts an empty bucket as zero", () => {
    const [point] = widgetPointsOf(createBucketResult([{ key: "jazz", label: "Jazz", value: null, prev: null }]));
    expect(point).toMatchObject({ value: 0, label: "Jazz" });
  });

  it("lays a matrix out as seven days of twenty-four hours from Monday", () => {
    const cells = widgetCellsOf(
      createMatrixResult([
        { weekday: 0, hour: 9, value: 3 },
        { weekday: 6, hour: 23, value: 5 },
      ])
    );
    expect(cells).toHaveLength(7);
    expect(cells[0]?.[9]).toBe(3);
    expect(cells[6]?.[23]).toBe(5);
    expect(cells[3]?.reduce((sum, value) => sum + value, 0)).toBe(0);
  });
});

describe("viewIsEmpty", () => {
  it("is empty only without items, without a non-zero point and without a non-zero cell", () => {
    const empty = widgetViewOf(createSeriesResult([{ key: "2026-10-01", value: 0, prev: null }]), undefined);
    expect(viewIsEmpty(empty)).toBe(true);
    const busy = widgetViewOf(createSeriesResult([{ key: "2026-10-01", value: 2, prev: null }]), undefined);
    expect(viewIsEmpty(busy)).toBe(false);
    const matrix = widgetViewOf(createMatrixResult([{ weekday: 1, hour: 2, value: 1 }]), undefined);
    expect(viewIsEmpty(matrix)).toBe(false);
    expect(viewIsEmpty(widgetViewOf(undefined, undefined))).toBe(true);
  });
});

describe("suggestBlocks", () => {
  const contracts = [
    { key: "list", shapes: ["ranked", "buckets"], needsCompare: false, needsNumbers: false },
    { key: "mosaic", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
    { key: "rankingMoves", shapes: ["ranked"], needsCompare: true, needsNumbers: false },
    { key: "leader", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
    { key: "feed", shapes: ["ranked"], needsCompare: false, needsNumbers: false },
    { key: "bars", shapes: ["series", "buckets", "ranked"], needsCompare: false, needsNumbers: true },
    { key: "yearCalendar", shapes: ["series"], needsCompare: false, needsNumbers: false },
    { key: "sparkline", shapes: ["series"], needsCompare: false, needsNumbers: false },
    { key: "statTrend", shapes: ["series", "single"], needsCompare: false, needsNumbers: false },
    { key: "share", shapes: ["buckets"], needsCompare: false, needsNumbers: true },
    { key: "compare", shapes: ["buckets"], needsCompare: true, needsNumbers: true },
  ] as const;
  const input = { compare: false, numeric: true, dailyYear: false };

  it("orders the views that fit a shape by the suggestion table and puts the rest after", () => {
    expect(suggestBlocks(contracts, { ...input, shape: "ranked", numeric: false })).toEqual([
      "list",
      "leader",
      "mosaic",
      "feed",
    ]);
  });

  it("offers a chart of ranked rows only when the measure is a number", () => {
    expect(suggestBlocks(contracts, { ...input, shape: "ranked" })).toContain("bars");
    expect(suggestBlocks(contracts, { ...input, shape: "ranked", numeric: false })).not.toContain("bars");
  });

  it("offers views that need a comparison only when the recipe compares", () => {
    expect(suggestBlocks(contracts, { ...input, shape: "buckets", compare: true })).toEqual([
      "share",
      "bars",
      "compare",
      "list",
    ]);
    expect(suggestBlocks(contracts, { ...input, shape: "ranked", compare: true })).toContain("rankingMoves");
  });

  it("offers the year calendar only for a long daily series", () => {
    expect(suggestBlocks(contracts, { ...input, shape: "series", dailyYear: true })).toEqual([
      "bars",
      "sparkline",
      "yearCalendar",
      "statTrend",
    ]);
    expect(suggestBlocks(contracts, { ...input, shape: "series" })).toEqual(["bars", "sparkline", "statTrend"]);
  });
});

describe("mixItemOf", () => {
  const item = (key: string, play: WidgetItem["play"]): WidgetItem => ({
    key,
    title: key,
    subtitle: "",
    cover: null,
    value: null,
    date: null,
    move: null,
    play,
    request: null,
    open: null,
    link: null,
  });

  it("plays every track of the set as one queue", () => {
    const items = [item("a", { kind: "tracks", trackIds: ["1"] }), item("b", { kind: "tracks", trackIds: ["2"] })];
    expect(mixItemOf(items, "Mix").play).toEqual({ kind: "tracks", trackIds: ["1", "2"] });
  });

  it("falls back to the first item when the rows are not tracks", () => {
    const items = [item("a", { kind: "album", albumExternalId: "al1" }), item("b", null)];
    expect(mixItemOf(items, "Mix").play).toEqual({ kind: "album", albumExternalId: "al1" });
  });

  it("has nothing to play for an empty set", () => {
    expect(mixItemOf([], "Mix").play).toBeNull();
  });
});

describe("calendarPartsOf and widgetIconOf", () => {
  it("splits a calendar day and refuses a partial date", () => {
    expect(calendarPartsOf("2026-11-07")).toEqual({ month: "Nov", day: "7" });
    expect(calendarPartsOf("2026")).toBeNull();
    expect(calendarPartsOf(null)).toBeNull();
  });

  it("draws every published icon name with its own glyph", () => {
    const glyphs = Object.values(WIDGET_ICONS);
    expect(new Set(glyphs).size).toBe(glyphs.length);
    expect(widgetIconOf("flame")).not.toBe(widgetIconOf("sparkles"));
  });
});

describe("widgetItemsOf for feed rows", () => {
  it("requests a feed track by its catalog id and plays it only when the library has it", () => {
    const row = createFeedTrackRow({
      catalogTrackId: "dz-9",
      trackId: "lib-9",
      plays: 3,
      album: "Disc",
      durationMs: 1000,
    });
    const item = onlyItem(widgetItemsOf(createFeedTrackResult([row]), undefined));
    expect(item).toMatchObject({ title: "Hit One", subtitle: "Artist C", value: "3 plays" });
    expect(item.play).toEqual({ kind: "tracks", trackIds: ["lib-9"] });
    expect(item.request).not.toBeNull();
  });

  it("gives a feed track outside the catalog and the library nothing to request, play or count", () => {
    const item = onlyItem(widgetItemsOf(createFeedTrackResult([createFeedTrackRow()]), undefined));
    expect(item).toMatchObject({ play: null, request: null, value: null });
  });

  it("opens and requests a feed artist by catalog id, plays a library artist, and counts their plays", () => {
    const known = createFeedArtistRow({ catalogArtistId: "dz-a", artistId: "lib-a", plays: 5 });
    const item = onlyItem(widgetItemsOf(createFeedArtistResult([known]), undefined));
    expect(item).toMatchObject({ subtitle: "", value: "5 plays", play: { kind: "artist", artist: "Artist D" } });
    expect(item.open).not.toBeNull();
    expect(item.request).not.toBeNull();
    const unknown = onlyItem(widgetItemsOf(createFeedArtistResult([createFeedArtistRow()]), undefined));
    expect(unknown).toMatchObject({ play: null, request: null, open: null, value: null });
  });

  it("places an event by its venue and country, skipping a missing city, and links out", () => {
    const item = onlyItem(widgetItemsOf(createFeedEventResult([createFeedEventRow()]), undefined));
    expect(item).toMatchObject({
      title: "Artist E",
      subtitle: "Hall · MX",
      link: "https://events.test/e1",
      date: "2026-12-01",
    });
  });

  it("dates a news item only when it says when it was published", () => {
    const row = {
      id: "n1",
      rank: 1,
      title: "Story",
      url: null,
      summary: "Sum",
      publishedAt: null,
      image: null,
      source: "Pitchfork",
    };
    expect(onlyItem(widgetItemsOf(createNewsResult([row]), undefined))).toMatchObject({
      date: null,
      value: "Pitchfork",
    });
    const dated = { ...row, publishedAt: "2026-11-01T10:00:00Z" };
    expect(onlyItem(widgetItemsOf(createNewsResult([dated]), undefined)).date).toBe("2026-11-01");
  });

  it("reads a bound field on every kind of row before its own default", () => {
    const album = createAlbumResult([createRecipeAlbumRow()]);
    expect(onlyItem(widgetItemsOf(album, { title: "artist", value: "tracks" }))).toMatchObject({
      title: "Artist A",
      value: "10",
    });
    const artist = createArtistResult([{ ...ARTIST_ROW, tracks: 4, plays: 9, value: 9 }]);
    expect(onlyItem(widgetItemsOf(artist, { subtitle: "name" })).subtitle).toBe("Artist F");
    const event = createFeedEventResult([createFeedEventRow()]);
    expect(onlyItem(widgetItemsOf(event, { title: "title" })).title).toBe("Live");
  });

  it("has nothing to play for an artist without library tracks, and no date for an album without a release day", () => {
    const artist = createArtistResult([{ ...ARTIST_ROW, tracks: 0, plays: 0, value: 0 }]);
    expect(onlyItem(widgetItemsOf(artist, undefined)).play).toBeNull();
    const album = createAlbumResult([createRecipeAlbumRow({ releaseDate: "", inLibrary: false })]);
    expect(onlyItem(widgetItemsOf(album, undefined))).toMatchObject({ date: null, play: null });
  });
});

describe("playlist sets", () => {
  it("shows each list with its length in hours or minutes and plays it as one queue", () => {
    const short = createSetList({ durationMs: 50 * 60_000 });
    const long = createSetList({ slotId: "s2", durationMs: 135 * 60_000, trackIds: [] });
    const [first, second] = widgetItemsOf(createSetResult({ lists: [short, long] }), undefined);
    expect(first).toMatchObject({ subtitle: "On repeat", value: "2 tracks · 50 min", listSlot: "s1" });
    expect(first?.play).toEqual({ kind: "tracks", trackIds: ["t1", "t2"] });
    expect(second).toMatchObject({ value: "0 tracks · 2 h 15 min", play: null });
  });

  it("states when the set refreshes, and says so when the last refresh failed", () => {
    expect(setStatusOf(undefined)).toBeNull();
    expect(setStatusOf(createTrackResult([]))).toBeNull();
    expect(setStatusOf(createSetResult())).toBe("Next only when you ask");
    expect(setStatusOf(createSetResult({ failedAt: new Date() }))).toBe(
      "Last refresh failed. Showing the previous lists."
    );
    const both = setStatusOf(
      createSetResult({ updatedAt: new Date("2026-11-01T10:00:00Z"), nextAt: new Date("2026-11-08T10:00:00Z") })
    );
    expect(both).toMatch(/^Updated .+ · Next .+/);
    expect(both).not.toContain("only when you ask");
  });

  it("names the hidden lists only when some list is still shown", () => {
    const hidden = [{ slotId: "s9", name: "Deep cuts", found: 2 }];
    expect(setHiddenNote(createSetResult({ hidden }))).toBe("1 hidden, under the minimum: Deep cuts");
    expect(setHiddenNote(createSetResult())).toBeNull();
    expect(setHiddenNote(createSetResult({ hidden, lists: [] }))).toBeNull();
    expect(setHiddenNote(undefined)).toBeNull();
  });

  it("opens a set's list on select and leaves other items with their own actions", () => {
    const actions = vi.fn((): WidgetItemControls => ({}));
    expect(withListOpening(actions, undefined)).toBe(actions);
    const onOpenList = vi.fn();
    const opening = withListOpening(actions, onOpenList);
    const [list] = widgetItemsOf(createSetResult(), undefined);
    if (!list) throw new Error("no list");
    opening(list).onSelect?.();
    expect(onOpenList).toHaveBeenCalledWith("s1");
    const plain = onlyItem(widgetItemsOf(createTrackResult([createRecipeTrackRow()]), undefined));
    expect(opening(plain).onSelect).toBeUndefined();
  });
});

describe("measureText and fieldText edges", () => {
  it("shows nothing for a missing count, minutes or tracks", () => {
    expect(measureText("plays", null, null)).toBeNull();
    expect(measureText("minutes", null, null)).toBeNull();
    expect(measureText("distinctTracks", null, null)).toBeNull();
  });

  it("keeps a string, drops an empty one, and reads a date as relative time", () => {
    expect(fieldText({ name: "Song" }, "name")).toBe("Song");
    expect(fieldText({ name: "" }, "name")).toBeNull();
    expect(fieldText({ at: new Date(Date.now() - 2 * 86_400_000) }, "at")).toBe("2d ago");
  });

  it("dates an added-at track by when it was added", () => {
    const row = createRecipeTrackRow({ addedAt: new Date("2026-01-15T12:00:00Z") });
    const result = { ...createTrackResult([row]), measure: "addedAt" as const };
    expect(onlyItem(widgetItemsOf(result, undefined)).date).toBe("2026-01-15");
  });
});
