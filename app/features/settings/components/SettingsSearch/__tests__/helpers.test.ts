import { describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import { SETTINGS_PALETTE_ACTIONS } from "../constants";
import { distinctPlaces, entryHref, highlightParts, matchingActions, searchSettings } from "../helpers";
import type { SettingsSearchEntry, SettingsSearchResult } from "../../../types";

const t = i18n.getFixedT("en", "settings");

const endpoint: SettingsSearchEntry = {
  labelKey: "mcp.endpointLabel",
  page: "apps",
  href: "/settings/apps",
  anchor: "ai-assistants",
  placeKey: "mcp.title",
};

const assistants: SettingsSearchEntry = {
  labelKey: "mcp.title",
  page: "apps",
  href: "/settings/apps",
  anchor: "ai-assistants",
};

const theme: SettingsSearchEntry = {
  labelKey: "general.theme.title",
  page: "appearance",
  href: "/settings/appearance",
  anchor: "theme",
  keywordsKey: "shell.search.keywords.theme",
};

const lastfmCredentials: SettingsSearchEntry = {
  labelKey: "shell.search.entries.lastfmCredentials",
  page: "listening",
  href: "/settings/listening",
  anchor: "lastfm.credentials",
  placeKey: "profile.listening.lastfm.name",
  adminOnly: true,
};

const lastfmFeeds: SettingsSearchEntry = {
  labelKey: "shell.search.entries.lastfmFeeds",
  page: "listening",
  href: "/settings/listening",
  anchor: "lastfm.feeds",
  placeKey: "profile.listening.lastfm.name",
};

const slskd: SettingsSearchEntry = {
  labelKey: "slskd.title",
  page: "downloadSources",
  href: "/settings/download-sources",
};

function labelsOf(results: readonly SettingsSearchResult[]): string[] {
  return results.map((result) => result.label);
}

describe("searchSettings", () => {
  it("returns nothing for a blank query", () => {
    expect(searchSettings("   ", [endpoint, assistants], t, true)).toEqual([]);
  });

  it("ranks label matches before matches on the place, whatever the entry order", () => {
    const results = searchSettings("assistants", [endpoint, assistants], t, true);
    expect(results.map((result) => result.entry)).toEqual([assistants, endpoint]);
  });

  it("matches on the keywords of an entry", () => {
    const results = searchSettings("midnight", [endpoint, theme], t, true);
    expect(results.map((result) => result.entry)).toEqual([theme]);
  });

  it("matches on the page label", () => {
    const page = t("shell.pages.appearance.title").split(" ")[0];
    expect(searchSettings(page, [endpoint, theme], t, true).map((result) => result.entry)).toEqual([theme]);
  });

  it("requires every term, across the label and the place together", () => {
    const results = searchSettings("assistants endpoint", [endpoint, assistants], t, true);
    expect(results.map((result) => result.entry)).toEqual([endpoint]);
  });

  it("ignores accents and case in the query", () => {
    expect(labelsOf(searchSettings("THÉME", [theme], t, true))).toEqual([t("general.theme.title")]);
  });

  it("shows a member neither admin only entries nor entries on server pages", () => {
    const entries = [lastfmCredentials, lastfmFeeds, slskd];
    expect(searchSettings("last", entries, t, false).map((result) => result.entry)).toEqual([lastfmFeeds]);
    expect(searchSettings(t("slskd.title"), entries, t, false)).toEqual([]);
  });

  it("shows an admin every entry", () => {
    const entries = [lastfmCredentials, lastfmFeeds, slskd];
    expect(searchSettings("last", entries, t, true).map((result) => result.entry)).toEqual([
      lastfmCredentials,
      lastfmFeeds,
    ]);
    expect(searchSettings(t("slskd.title"), entries, t, true).map((result) => result.entry)).toEqual([slskd]);
  });

  it("names the place as page and sub place when the entry has one", () => {
    const [result] = searchSettings("endpoint", [endpoint], t, true);
    expect(result.place).toBe(
      i18n.t("settings:shell.search.place", {
        page: t("shell.pages.apps.title"),
        place: t("mcp.title"),
      })
    );
    expect(result.label).toBe(t("mcp.endpointLabel"));
  });

  it("names the place as the page alone otherwise", () => {
    const [result] = searchSettings("theme", [theme], t, true);
    expect(result.place).toBe(t("shell.pages.appearance.title"));
  });
});

describe("matchingActions", () => {
  it("offers a member only the actions on pages they can open", () => {
    expect(matchingActions("", SETTINGS_PALETTE_ACTIONS, t, false).map((action) => action.id)).toEqual([
      "checkForUpdates",
      "newApiKey",
    ]);
  });

  it("offers an admin every action when the query is empty", () => {
    expect(matchingActions("", SETTINGS_PALETTE_ACTIONS, t, true)).toEqual(SETTINGS_PALETTE_ACTIONS);
  });

  it("filters the actions by their label", () => {
    const ids = matchingActions("scan", SETTINGS_PALETTE_ACTIONS, t, true).map((action) => action.id);
    expect(ids).toEqual(["runLibraryScan", "reviewUnidentified"]);
  });
});

describe("distinctPlaces", () => {
  it("counts each place once", () => {
    const results = searchSettings("a", [endpoint, assistants, theme], t, true);
    expect(results).toHaveLength(3);
    expect(distinctPlaces(results)).toBe(3);
    expect(distinctPlaces([results[0], results[0], results[2]])).toBe(2);
  });
});

describe("highlightParts", () => {
  it("returns the whole text unmarked for a blank query", () => {
    expect(highlightParts("Theme", "  ")).toEqual([{ text: "Theme", match: false }]);
  });

  it("marks the matched prefix", () => {
    expect(highlightParts("Theme", "the")).toEqual([
      { text: "The", match: true },
      { text: "me", match: false },
    ]);
  });

  it("marks every occurrence and merges adjacent ones", () => {
    expect(highlightParts("banana", "an")).toEqual([
      { text: "b", match: false },
      { text: "anan", match: true },
      { text: "a", match: false },
    ]);
  });

  it("marks each term on its own and keeps positions after punctuation", () => {
    expect(highlightParts("Last.fm discovery feeds", "fm feeds")).toEqual([
      { text: "Last.", match: false },
      { text: "fm", match: true },
      { text: " discovery ", match: false },
      { text: "feeds", match: true },
    ]);
  });

  it("marks the words on both sides of a punctuation mark", () => {
    expect(highlightParts("Last.fm", "last fm")).toEqual([
      { text: "Last", match: true },
      { text: ".", match: false },
      { text: "fm", match: true },
    ]);
  });

  it("marks accented characters matched by a plain query", () => {
    expect(highlightParts("Música", "musi")).toEqual([
      { text: "Músi", match: true },
      { text: "ca", match: false },
    ]);
  });

  it("marks accented characters matched by an accented query", () => {
    expect(highlightParts("Musica", "MÚS")).toEqual([
      { text: "Mus", match: true },
      { text: "ica", match: false },
    ]);
  });

  it("marks a term the search matched across a dropped punctuation mark", () => {
    expect(highlightParts("Last.fm discovery feeds", "lastfm")).toEqual([
      { text: "Last.fm", match: true },
      { text: " discovery feeds", match: false },
    ]);
  });

  it("marks a folded letter that spells as two", () => {
    expect(highlightParts("Straße", "strasse")).toEqual([{ text: "Straße", match: true }]);
  });

  it("keeps marks in place after a character that spans two code units", () => {
    expect(highlightParts("🎵 Music", "music")).toEqual([
      { text: "🎵 ", match: false },
      { text: "Music", match: true },
    ]);
  });
});

describe("entryHref", () => {
  it("appends the anchor as a hash", () => {
    expect(entryHref(endpoint)).toBe("/settings/apps#ai-assistants");
  });

  it("returns the page href when there is no anchor", () => {
    expect(entryHref(slskd)).toBe("/settings/download-sources");
  });
});
