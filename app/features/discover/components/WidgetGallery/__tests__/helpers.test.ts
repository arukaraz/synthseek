import { describe, expect, it } from "vitest";

import type { BoardItem, BoardList, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetCatalog, WidgetPreset, WidgetProblem } from "@hooks/api/queries/widgets/types";
import { createWidgetCatalog, createWidgetPreset } from "@test/factories";

import { BOARD_MAX_ITEMS, BOARD_WIDGETS } from "../../ExploreBoard/constants";
import { DEFAULT_GALLERY_FILTERS, PREVIEW_BOX } from "../constants";
import {
  availableEntries,
  bulkAddRoomOf,
  bulkPlacementOf,
  cardPillsOf,
  countInCategory,
  galleryGroups,
  gallerySourceRows,
  matchesQuery,
  presetPeriodOf,
  previewFrame,
  problemText,
  sourceFilterLabel,
  sourceFilterOf,
  sourceMatches,
} from "../helpers";
import type { GalleryEntry, GalleryFilters, GallerySourceFilter } from "../types";

function entry(widget: BoardWidgetKey, title: string, description = ""): GalleryEntry {
  return { widget, definition: BOARD_WIDGETS[widget], name: title, title, description };
}

const ENTRIES: GalleryEntry[] = [
  entry("trending", "Trending now", "Catalog charts"),
  entry("topTracks", "Top tracks", "Most scrobbled"),
  entry("scrobbles", "Recent scrobbles", "Latest plays"),
  entry("mixes", "Discover mixes", "ListenBrainz playlists"),
  entry("requests", "Recent requests", "What you asked for"),
];

describe("availableEntries", () => {
  const NOT_PLACED = new Map<BoardWidgetKey, string>();
  const shown = (active: Parameters<typeof availableEntries>[1], onBoard = NOT_PLACED) =>
    availableEntries(ENTRIES, active, onBoard).map((item) => item.widget);

  it("hides a widget whose third party is not set up, and leaves the ones that need none", () => {
    expect(shown(["listenbrainz"])).toEqual(["trending", "mixes", "requests"]);
    expect(shown(["lastfm"])).toEqual(["trending", "topTracks", "scrobbles", "requests"]);
  });

  it("shows every widget once all their third parties are active", () => {
    expect(shown(["listenbrainz", "lastfm"])).toEqual(["trending", "topTracks", "scrobbles", "mixes", "requests"]);
  });

  it("keeps a placed widget in the gallery so it can still be removed there", () => {
    expect(shown(["listenbrainz"], new Map<BoardWidgetKey, string>([["scrobbles", "s1"]]))).toEqual([
      "trending",
      "scrobbles",
      "mixes",
      "requests",
    ]);
  });

  it("offers no third-party widget until the server has said which are active", () => {
    expect(shown(undefined)).toEqual(["trending", "requests"]);
  });
});

describe("gallery sources", () => {
  const SOURCED: GalleryEntry[] = [...ENTRIES, entry("serverPlaylists", "Your playlists", "On media servers")];
  const catalogWith = (feeds: Partial<WidgetCatalog["feeds"]>): WidgetCatalog => {
    const catalog = createWidgetCatalog();
    return { ...catalog, feeds: { ...catalog.feeds, ...feeds } };
  };
  const summary = (catalog: WidgetCatalog | undefined) =>
    gallerySourceRows(catalog, SOURCED).map((row) => [row.source, row.status, row.reason, row.count]);

  it("lists Last.fm, ListenBrainz and each connected server, counting the widgets each feeds", () => {
    expect(summary(catalogWith({ lastfmState: "active", servers: ["jellyfin", "plex"] }))).toEqual([
      ["lastfm", "active", null, 2],
      ["listenbrainz", "active", null, 1],
      ["jellyfin", "active", null, 1],
      ["plex", "active", null, 1],
    ]);
  });

  it("says why Last.fm is off, telling a refused key from one never set, and keeps ListenBrainz on", () => {
    expect(summary(catalogWith({ lastfmState: "refused" })).slice(0, 2)).toEqual([
      ["lastfm", "inactive", "lastfmRefused", 2],
      ["listenbrainz", "active", null, 1],
    ]);
    expect(summary(catalogWith({ lastfmState: "notSetUp" }))[0]).toEqual(["lastfm", "inactive", "lastfmNotSetUp", 2]);
  });

  it("folds the servers into one inactive row with the three of them when none is connected", () => {
    const rows = gallerySourceRows(catalogWith({ servers: [] }), SOURCED);
    const media = rows.filter((row) => row.source === "mediaServer");

    expect(rows.map((row) => row.source)).toEqual(["lastfm", "listenbrainz", "mediaServer"]);
    expect(media.map((row) => [row.status, row.reason])).toEqual([["inactive", "noMediaServer"]]);
    expect(media[0].pills.map((pill) => pill.source)).toEqual(["plex", "jellyfin", "navidrome"]);
    expect(media[0].label).toBe("Plex, Jellyfin, or Navidrome");
  });

  it("calls every source unknown, with the reason to try again, while the server has not answered", () => {
    expect(summary(undefined)).toEqual([
      ["lastfm", "unknown", "unknown", 2],
      ["listenbrainz", "unknown", "unknown", 1],
      ["mediaServer", "unknown", "unknown", 1],
    ]);
  });

  it("matches a widget to its own source, a server to every media-server widget, and Synthseek to the rest", () => {
    const picked = (filter: GallerySourceFilter) =>
      SOURCED.filter((item) => sourceMatches(filter, item)).map((item) => item.widget);

    expect(picked("all")).toHaveLength(SOURCED.length);
    expect(picked("synthseek")).toEqual(["trending", "requests"]);
    expect(picked("lastfm")).toEqual(["topTracks", "scrobbles"]);
    expect(picked("listenbrainz")).toEqual(["mixes"]);
    expect(picked("plex")).toEqual(["serverPlaylists"]);
    expect(picked("mediaServer")).toEqual(["serverPlaylists"]);
  });

  it("accepts only a source the menu lists, and names it in the trigger", () => {
    const rows = gallerySourceRows(catalogWith({ servers: ["plex"] }), SOURCED);

    expect(sourceFilterOf(rows, "plex")).toBe("plex");
    expect(sourceFilterOf(rows, "jellyfin")).toBeNull();
    expect(sourceFilterOf(rows, "synthseek")).toBe("synthseek");
    expect(sourceFilterLabel(rows, "all")).toBeNull();
    expect(sourceFilterLabel(rows, "lastfm")).toBe("Last.fm");
    expect(sourceFilterLabel(rows, "synthseek")).toBe("Synthseek");
  });

  it("marks a card with its source, or with every connected server for a media-server widget", () => {
    expect(cardPillsOf(undefined, ["plex"])).toEqual([]);
    expect(cardPillsOf("lastfm", []).map((pill) => pill.label)).toEqual(["Last.fm"]);
    expect(cardPillsOf("mediaServer", ["plex", "jellyfin"]).map((pill) => pill.label)).toEqual(["Plex", "Jellyfin"]);
    expect(cardPillsOf("mediaServer", [])).toEqual([]);
  });

  it("labels a preset with the period or range it reads, and nothing for one without", () => {
    const feedPreset = (query: Extract<WidgetPreset["draft"]["query"], { type: "feed" }>) =>
      createWidgetPreset({ draft: { ...createWidgetPreset().draft, query } });
    const pick = { by: "rank", order: "asc", limit: 10, random: null } as const;

    expect(
      presetPeriodOf(feedPreset({ type: "feed", source: "lastfm.topTracks", params: { period: "7day" }, pick }))
    ).toBe("Last 7 days");
    expect(
      presetPeriodOf(feedPreset({ type: "feed", source: "listenbrainz.charts", params: { range: "week" }, pick }))
    ).toBe("Last week");
    expect(
      presetPeriodOf(feedPreset({ type: "feed", source: "lastfm.charts", params: { country: null }, pick }))
    ).toBeNull();
    expect(presetPeriodOf(undefined)).toBeNull();
  });
});

describe("matchesQuery over the name", () => {
  it("finds a twin by the provider its name carries", () => {
    const twin = { ...entry("listenbrainzCharts", "Charts", "Top tracks worldwide"), name: "Charts (ListenBrainz)" };

    expect(matchesQuery(twin, "listenbrainz")).toBe(true);
    expect(matchesQuery(entry("charts", "Charts", "Top tracks worldwide"), "listenbrainz")).toBe(false);
  });

  it("finds a widget whose name carries accents by a query typed without them", () => {
    expect(matchesQuery({ ...entry("charts", "Charts"), name: "Éxitos del año" }, "exitos ano")).toBe(true);
  });

  it("sorts twins that share a title by the provider their name carries", () => {
    const twins = [
      { ...entry("listenbrainzCharts", "Charts"), name: "Charts (ListenBrainz)" },
      { ...entry("charts", "Charts"), name: "Charts (Last.fm)" },
    ];
    const sorted = galleryGroups(twins, { ...DEFAULT_GALLERY_FILTERS, sort: "name" }, new Map());

    expect(sorted[0]?.entries.map((item) => item.widget)).toEqual(["charts", "listenbrainzCharts"]);
  });
});

describe("bulkPlacementOf", () => {
  const onList = (placed: Record<BoardList, readonly BoardWidgetKey[]>) => (list: BoardList, widget: BoardWidgetKey) =>
    placed[list].includes(widget);

  it("offers to add where a shown widget is missing and to remove where one is placed", () => {
    expect(bulkPlacementOf(["trending", "mixes"], onList({ items: ["trending"], mobile: [] }))).toEqual({
      addable: ["items", "mobile"],
      removable: ["items"],
    });
  });

  it("offers no add where every shown widget is placed, and nothing at all for an empty list", () => {
    expect(bulkPlacementOf(["trending"], onList({ items: ["trending"], mobile: ["trending", "mixes"] }))).toEqual({
      addable: [],
      removable: ["items", "mobile"],
    });
    expect(bulkPlacementOf([], onList({ items: ["trending"], mobile: [] }))).toEqual({ addable: [], removable: [] });
  });
});

describe("bulkAddRoomOf", () => {
  const tiles = (count: number): BoardItem[] =>
    Array.from({ length: count }, (_, index) => ({ kind: "custom", id: `t${index}`, widgetId: "w", size: "M" }));
  const none = () => false;

  it("fits a layout the missing widgets fill exactly, and refuses one they would take past the limit", () => {
    const lists = { items: tiles(BOARD_MAX_ITEMS - 2), mobile: tiles(BOARD_MAX_ITEMS - 1) };

    expect(bulkAddRoomOf(["trending", "mixes"], ["items", "mobile"], lists, none)).toEqual({
      fits: ["items"],
      full: ["mobile"],
    });
  });

  it("counts only the widgets a layout is missing, and judges only the layouts picked", () => {
    const lists = { items: tiles(BOARD_MAX_ITEMS), mobile: tiles(BOARD_MAX_ITEMS) };
    const placed = (list: BoardList) => list === "items";

    expect(bulkAddRoomOf(["trending"], ["items"], lists, placed)).toEqual({ fits: ["items"], full: [] });
    expect(bulkAddRoomOf(["trending"], ["mobile"], lists, placed)).toEqual({ fits: [], full: ["mobile"] });
  });
});

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
    const frame = previewFrame("trending");

    expect(frame.stageWidth).toBe(1200);
    expect(frame.stageHeight).toBe(336);
    expect(frame.scale).toBeCloseTo(0.25);
    expect(frame.width).toBe(PREVIEW_BOX.width);
    expect(frame.height).toBe(84);
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

  it.each<[WidgetProblem, string]>([
    [{ code: "measureNotForSubject", measure: "plays", subject: "tracks" }, "plays is not a measure for tracks."],
    [{ code: "rankDeltaNeedsCompare" }, "Places climbed needs a comparison with the previous period."],
    [{ code: "groupByNotForSubject", subject: "tracks" }, "tracks cannot be grouped by time."],
    [{ code: "groupByNotForMeasure", measure: "plays" }, "plays cannot be grouped by time."],
    [{ code: "pickByNotMeasure", measure: "plays" }, "Items can only be picked by plays or by name."],
    [{ code: "setRuleNotAllowed", field: "genreName" }, "Genre name is not available on playlists."],
    [{ code: "setSlotNeedsParam", origin: "onRepeat" }, "On repeat needs a value."],
    [{ code: "setSlotParamInvalid", origin: "onRepeat" }, "The value of On repeat is not valid."],
    [{ code: "setSlotDuplicate" }, "Two lists share one id."],
    [
      { code: "ruleNotForSubject", field: "genreName", subject: "tracks" },
      "The rule Genre name does not apply to tracks.",
    ],
    [
      { code: "ruleNotForSource", field: "genreName", source: "lastfm.charts" },
      "The rule Genre name does not apply to Top tracks by country (Last.fm).",
    ],
    [
      { code: "pickByNotForSource", by: "plays", source: "lastfm.charts" },
      "Top tracks by country (Last.fm) cannot be ordered by My plays.",
    ],
    [{ code: "blockNotForShape", block: "list", shape: "ranked" }, "The List view cannot show this result."],
    [{ code: "playlistNeedsTracks" }, "Only a recipe that lists tracks, without grouping, can also be a playlist."],
    [{ code: "userRuleOnce" }, "A recipe can say whose listening it reads only once."],
    [{ code: "userRuleNeedsAll" }, "Whose listening can only be used when every rule must match."],
    [{ code: "tooLarge", maxBytes: 16_384 }, "The JSON is larger than 16 KB."],
    [{ code: "invalidJson" }, "This is not valid JSON."],
  ])("explains %j in words with its names filled in", (problem, text) => {
    expect(problemText(problem)).toBe(text);
  });
});
