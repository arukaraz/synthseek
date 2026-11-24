import { describe, expect, it } from "vitest";

import { bySourceKey, figureGroupsOf, figureLabelKey } from "../helpers";

describe("figureGroupsOf", () => {
  it("orders the listeners Last.fm, catalog, ListenBrainz and the plays Last.fm, ListenBrainz", () => {
    const [listeners, plays] = figureGroupsOf({
      lastfm: { listeners: 100, plays: 900 },
      listenbrainz: { listeners: 30, plays: 400 },
      catalogFans: { provider: "Deezer", fans: 5000 },
    });

    expect(listeners).toEqual({
      kind: "listeners",
      entries: [
        { source: "lastfm", name: "Last.fm", value: 100, fans: false },
        { source: "catalog", name: "Deezer", value: 5000, fans: true },
        { source: "listenbrainz", name: "ListenBrainz", value: 30, fans: false },
      ],
    });
    expect(plays).toEqual({
      kind: "plays",
      entries: [
        { source: "lastfm", name: "Last.fm", value: 900, fans: false },
        { source: "listenbrainz", name: "ListenBrainz", value: 400, fans: false },
      ],
    });
  });

  it("leads with the catalog's fans when Last.fm is not answering", () => {
    const [listeners, plays] = figureGroupsOf({
      lastfm: null,
      listenbrainz: { listeners: 30, plays: 400 },
      catalogFans: { provider: "Deezer", fans: 5000 },
    });

    expect(listeners.entries.map((entry) => entry.source)).toEqual(["catalog", "listenbrainz"]);
    expect(plays.entries.map((entry) => entry.source)).toEqual(["listenbrainz"]);
  });

  it("leaves out a figure its source does not have, keeping the other one", () => {
    const [listeners, plays] = figureGroupsOf({
      lastfm: { listeners: null, plays: 900 },
      listenbrainz: { listeners: 30, plays: null },
      catalogFans: null,
    });

    expect(listeners.entries.map((entry) => entry.source)).toEqual(["listenbrainz"]);
    expect(plays.entries.map((entry) => entry.source)).toEqual(["lastfm"]);

    const [mirroredListeners, mirroredPlays] = figureGroupsOf({
      lastfm: { listeners: 100, plays: null },
      listenbrainz: { listeners: null, plays: 400 },
      catalogFans: null,
    });

    expect(mirroredListeners.entries.map((entry) => entry.source)).toEqual(["lastfm"]);
    expect(mirroredPlays.entries.map((entry) => entry.source)).toEqual(["listenbrainz"]);
  });

  it("keeps both groups, empty, when nothing has answered yet", () => {
    expect(figureGroupsOf({ lastfm: undefined, listenbrainz: undefined, catalogFans: undefined })).toEqual([
      { kind: "listeners", entries: [] },
      { kind: "plays", entries: [] },
    ]);
  });

  it("counts a zero as a figure", () => {
    const [listeners] = figureGroupsOf({
      lastfm: { listeners: 0, plays: null },
      listenbrainz: null,
      catalogFans: null,
    });

    expect(listeners.entries).toEqual([{ source: "lastfm", name: "Last.fm", value: 0, fans: false }]);
  });
});

describe("figureLabelKey and bySourceKey", () => {
  it("calls the figure Fans only while the catalog leads it", () => {
    expect(figureLabelKey("listeners", { source: "catalog", name: "Deezer", value: 1, fans: true })).toBe("stats.fans");
    expect(figureLabelKey("listeners", { source: "lastfm", name: "Last.fm", value: 1, fans: false })).toBe(
      "stats.listeners"
    );
    expect(figureLabelKey("listeners", undefined)).toBe("stats.listeners");
    expect(figureLabelKey("plays", undefined)).toBe("stats.plays");
  });

  it("titles the breakdown after the figure it breaks down", () => {
    expect(bySourceKey("listeners")).toBe("stats.bySource.listeners");
    expect(bySourceKey("plays")).toBe("stats.bySource.plays");
  });
});
