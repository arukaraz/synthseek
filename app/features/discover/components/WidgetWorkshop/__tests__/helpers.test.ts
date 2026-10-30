import { describe, expect, it } from "vitest";

import type { FeedQuery, RecipeQuery } from "@hooks/api/queries/widgets/types";
import { createWidgetCatalog, createWidgetGrammar } from "@test/factories";

import { DEFAULT_QUERIES, NEW_WIDGET_DRAFT } from "../../../constants";
import {
  clampedNumber,
  dailyYearOf,
  feedReadbackOf,
  feedServerOf,
  matchingIcons,
  previewableDraft,
  recipeShapeOf,
  readbackOf,
  rotationChoicesOf,
  ruleText,
  viewChoicesOf,
  withFittingView,
  withMeasure,
  serverChoicesOf,
  withServer,
  withSource,
  withSubject,
} from "../helpers";

const grammar = createWidgetGrammar();
const catalog = createWidgetCatalog();
const RECIPE: RecipeQuery = DEFAULT_QUERIES.recipe;

describe("recipeShapeOf and dailyYearOf", () => {
  it("names the shape the server will return for each recipe", () => {
    expect(recipeShapeOf(RECIPE, grammar)).toBe("ranked");
    expect(recipeShapeOf({ ...RECIPE, groupBy: "hour" }, grammar)).toBe("matrix");
    expect(recipeShapeOf({ ...RECIPE, groupBy: "week" }, grammar)).toBe("series");
    expect(recipeShapeOf({ ...RECIPE, subject: "genres" }, grammar)).toBe("buckets");
    expect(recipeShapeOf({ ...RECIPE, subject: "genres", pick: { ...RECIPE.pick, limit: 1 } }, grammar)).toBe("single");
  });

  it("follows the shape rule the grammar publishes rather than its own", () => {
    const moved = {
      ...grammar,
      groupByShapes: { ...grammar.groupByShapes, week: "matrix" },
      subjectShapes: { ...grammar.subjectShapes, genres: { single: "ranked", many: "series" } },
    } satisfies typeof grammar;
    expect(recipeShapeOf({ ...RECIPE, groupBy: "week" }, moved)).toBe("matrix");
    expect(recipeShapeOf({ ...RECIPE, subject: "genres" }, moved)).toBe("series");
    expect(rotationChoicesOf(grammar)).toEqual(["none", ...grammar.pick.rotations]);
  });

  it("treats a daily series over half a year or more as a year", () => {
    expect(dailyYearOf({ ...RECIPE, groupBy: "day", time: { mode: "named", value: "thisYear" } })).toBe(true);
    expect(dailyYearOf({ ...RECIPE, groupBy: "day", time: { mode: "relative", days: 90 } })).toBe(false);
    expect(dailyYearOf({ ...RECIPE, groupBy: "week", time: { mode: "named", value: "thisYear" } })).toBe(false);
  });
});

describe("withSubject and withMeasure", () => {
  it("keeps a measure the new subject offers and falls back to its first one otherwise", () => {
    expect(withSubject({ ...RECIPE, measure: "minutes" }, "albums", grammar).measure).toBe("minutes");
    expect(withSubject({ ...RECIPE, measure: "lastPlayed" }, "genres", grammar).measure).toBe("plays");
  });

  it("drops the rules and the grouping the new subject cannot take", () => {
    const recipe: RecipeQuery = {
      ...RECIPE,
      groupBy: "day",
      rules: {
        all: [
          { field: "notPlayedInLast", op: "days", value: 90 },
          { field: "plays", op: "gte", value: 3 },
        ],
      },
    };
    const albums = withSubject(recipe, "albums", grammar);
    expect(albums.rules).toEqual({ all: [{ field: "plays", op: "gte", value: 3 }] });
    expect(albums.groupBy).toBeUndefined();
    expect(withSubject(recipe, "genres", grammar).rules).toBeUndefined();
  });

  it("turns the comparison on for places climbed and picks by the measure", () => {
    const moved = withMeasure(RECIPE, "rankDelta", grammar);
    expect(moved.compare).toBe("previous");
    expect(moved.pick.by).toBe("rankDelta");
    expect(withMeasure({ ...RECIPE, groupBy: "day" }, "lastPlayed", grammar).groupBy).toBeUndefined();
  });
});

describe("withFittingView and viewChoicesOf", () => {
  it("moves to the first suggested view when the current one no longer fits", () => {
    const draft = { ...NEW_WIDGET_DRAFT, query: { ...RECIPE, groupBy: "hour" as const } };
    expect(withFittingView(draft, catalog, grammar).view.block).toBe("heatmap");
    expect(withFittingView(NEW_WIDGET_DRAFT, catalog, grammar).view.block).toBe("list");
  });

  it("keeps a view the server accepts though the workshop would not suggest it", () => {
    const shortDaily = { ...RECIPE, groupBy: "day" as const, time: { mode: "relative" as const, days: 30 } };
    const draft = {
      ...NEW_WIDGET_DRAFT,
      query: shortDaily,
      view: { ...NEW_WIDGET_DRAFT.view, block: "yearCalendar" as const },
    };
    expect(withFittingView(draft, catalog, grammar).view.block).toBe("yearCalendar");
    const blocks = {
      fitting: ["bars", "sparkline"] as const,
      accepted: ["bars", "sparkline", "yearCalendar"] as const,
    };
    expect(viewChoicesOf(catalog, blocks, "yearCalendar", false).map((choice) => choice.block)).toEqual([
      "bars",
      "sparkline",
      "yearCalendar",
    ]);
    const all = viewChoicesOf(catalog, blocks, "bars", true);
    expect(all.find((choice) => choice.block === "yearCalendar")).toEqual({
      block: "yearCalendar",
      fits: true,
      suggested: false,
    });
    expect(all.find((choice) => choice.block === "heatmap")?.fits).toBe(false);
  });

  it("marks the first fitting view as suggested and shows the rest only on request, disabled", () => {
    const fitting = ["share", "bars", "list"] as const;
    const blocks = { fitting, accepted: fitting };
    expect(viewChoicesOf(catalog, blocks, "share", false)).toEqual([
      { block: "share", fits: true, suggested: true },
      { block: "bars", fits: true, suggested: false },
      { block: "list", fits: true, suggested: false },
    ]);
    const all = viewChoicesOf(catalog, blocks, "share", true);
    expect(all).toHaveLength(catalog.blocks.length);
    expect(all.find((choice) => choice.block === "heatmap")).toEqual({
      block: "heatmap",
      fits: false,
      suggested: false,
    });
  });
});

describe("readbackOf and ruleText", () => {
  it("reads a recipe back as one sentence", () => {
    expect(readbackOf(RECIPE)).toBe("Show me 10 tracks with the most plays in the last 30 days.");
    expect(
      readbackOf({
        ...RECIPE,
        compare: "previous",
        rules: {
          any: [
            { field: "favorite", op: "is", value: true },
            { field: "bitrate", op: "lt", value: 256 },
          ],
        },
      })
    ).toBe(
      "Show me 10 tracks with the most plays in the last 30 days, compared with the previous period, where is a favorite or bitrate below 256 kbps."
    );
    expect(readbackOf({ ...RECIPE, groupBy: "week" })).toBe("Show me plays in the last 30 days, by week.");
  });

  it("puts the number before the unit for day rules and spells out a share", () => {
    expect(ruleText({ field: "notPlayedInLast", op: "days", value: 180 })).toBe("not played in the last 180 days");
    expect(ruleText({ field: "ownedShare", op: "lt", value: 0.5 })).toBe("owned share below 50%");
    expect(ruleText({ field: "decade", op: "is", value: 1990 })).toBe("from the 1990s");
  });
});

describe("withSource and feedReadbackOf", () => {
  const FEED: FeedQuery = {
    ...DEFAULT_QUERIES.feed,
    pick: { by: "plays", order: "desc", limit: 5, random: null },
    rules: { all: [{ field: "inLibrary", op: "is", value: false }] },
  };

  it("swaps the source, keeping the rules and the order it accepts", () => {
    const fresh = withSource(FEED, "listenbrainz.freshReleases", catalog, "US");
    expect(fresh).toMatchObject({ source: "listenbrainz.freshReleases", params: { days: 30 } });
    expect(fresh.rules).toBeUndefined();
    expect(fresh.pick.by).toBe("rank");
    const back = withSource(fresh, "lastfm.similarArtists", catalog, "US");
    expect(back.params).toEqual({ seed: { kind: "myTopArtists", n: 10, days: 90 } });
  });

  it("charts the member's chosen country, not one guessed from the language", () => {
    expect(withSource(FEED, "lastfm.charts", catalog, "MX").params).toEqual({ country: "MX" });
  });

  it("reads a feed back with its rules", () => {
    expect(feedReadbackOf(FEED)).toBe("Show me 5 items from Similar artists (Last.fm), where is not in my library.");
  });

  it("offers the connected servers and keeps a chosen one that is not connected among the choices", () => {
    const connected = { ...catalog, feeds: { ...catalog.feeds, servers: ["jellyfin" as const] } };
    expect(serverChoicesOf(connected, "jellyfin")).toEqual(["jellyfin"]);
    expect(serverChoicesOf(connected, "plex")).toEqual(["jellyfin", "plex"]);
  });

  it("starts on the connected media server, keeps the chosen one across sources, and Lidarr's calendar at 30 days", () => {
    const playlists = withSource(FEED, "mediaServer.playlists", catalog, "US");
    expect(playlists.params).toEqual({ server: "jellyfin" });
    expect(
      withSource(FEED, "mediaServer.playlists", { ...catalog, feeds: { ...catalog.feeds, defaultServer: null } }, "US")
        .params
    ).toEqual({ server: "plex" });
    const onNavidrome = withServer(playlists, "navidrome");
    expect(feedServerOf(onNavidrome)).toBe("navidrome");
    expect(withSource(onNavidrome, "mediaServer.nowPlaying", catalog, "US").params).toEqual({ server: "navidrome" });
    const onJellyfin = withServer(onNavidrome, "jellyfin");
    const calendar = withSource(onJellyfin, "lidarr.calendar", catalog, "US");
    expect(calendar.params).toEqual({ days: 30 });
    expect(feedServerOf(calendar)).toBeNull();
    expect(withServer(calendar, "plex")).toBe(calendar);
  });
});

describe("previewableDraft", () => {
  it("lends a cleared name a placeholder so the preview still runs, and keeps a real one", () => {
    const cleared = { ...NEW_WIDGET_DRAFT, meta: { ...NEW_WIDGET_DRAFT.meta, name: "  " } };
    expect(previewableDraft(cleared, "New widget").meta.name).toBe("New widget");
    const named = { ...NEW_WIDGET_DRAFT, meta: { ...NEW_WIDGET_DRAFT.meta, name: "Night owl" } };
    expect(previewableDraft(named, "New widget")).toBe(named);
  });
});

describe("clampedNumber and matchingIcons", () => {
  it("rounds and bounds a typed number and ignores an empty field", () => {
    expect(clampedNumber("7.6", 1, 50)).toBe(8);
    expect(clampedNumber("900", 1, 50)).toBe(50);
    expect(clampedNumber("", 1, 50)).toBeNull();
    expect(clampedNumber("abc", 1, 50)).toBeNull();
  });

  it("filters icon names by the search text", () => {
    expect(matchingIcons(["music", "music-2", "heart"], " MUS ")).toEqual(["music", "music-2"]);
    expect(matchingIcons(["music", "heart"], "")).toEqual(["music", "heart"]);
    expect(matchingIcons(["calendar-days", "calendar", "clock"], "calendar days")).toEqual(["calendar-days"]);
  });
});
