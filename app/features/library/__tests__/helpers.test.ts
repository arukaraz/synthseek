import { describe, expect, it, vi } from "vitest";

import type { KeyboardEvent } from "react";

import type { LibraryAlbumItem, LibraryFilesStatus, LibraryTrackItem } from "@hooks/api/queries/library/types";

import { VIEW_CONFIG } from "../constants";
import {
  applySelectionShortcut,
  buildAlbumsInput,
  buildTracksInput,
  clampPage,
  computePageCount,
  countActiveFilters,
  fileJobReport,
  isLibraryView,
  parseFilterValues,
  resolveEffectiveDirection,
  rangePreviewTone,
  resolvePageSize,
  selectedAlbumsFileTarget,
  selectedTracksFileTarget,
  serializeFilterValues,
  spendsSelection,
  toggleFilterValue,
  topFacetValues,
  trackFileTarget,
  viewCountFor,
} from "../helpers";
import type { FacetSearchState, FilterParamMap, LibraryFileJob, LibraryFileTarget, LibraryView } from "../types";

describe("parseFilterValues", () => {
  it("returns an empty array for undefined or empty input", () => {
    expect(parseFilterValues(undefined)).toEqual([]);
    expect(parseFilterValues("")).toEqual([]);
  });

  it("splits a comma list and trims and drops empties", () => {
    expect(parseFilterValues("a, b ,,c")).toEqual(["a", "b", "c"]);
  });
});

describe("serializeFilterValues", () => {
  it("returns null for an empty array so the URL param is dropped", () => {
    expect(serializeFilterValues([])).toBeNull();
  });

  it("joins values with a comma", () => {
    expect(serializeFilterValues(["a", "b"])).toBe("a,b");
  });
});

describe("toggleFilterValue", () => {
  it("adds a value that is not present", () => {
    expect(toggleFilterValue(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes a value that is present", () => {
    expect(toggleFilterValue(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("clampPage", () => {
  it("falls back to 1 for invalid or out-of-range input", () => {
    expect(clampPage("0")).toBe(1);
    expect(clampPage("-3")).toBe(1);
    expect(clampPage("abc")).toBe(1);
  });

  it("parses a valid page number", () => {
    expect(clampPage("7")).toBe(7);
  });
});

describe("resolvePageSize", () => {
  it("falls back to the first option for an unknown size", () => {
    expect(resolvePageSize("999")).toBe(50);
    expect(resolvePageSize("abc")).toBe(50);
  });

  it("accepts an allowed size", () => {
    expect(resolvePageSize("100")).toBe(100);
    expect(resolvePageSize("200")).toBe(200);
  });
});

describe("computePageCount", () => {
  it("returns at least 1 for an empty result", () => {
    expect(computePageCount(0, 50)).toBe(1);
  });

  it("rounds up partial pages", () => {
    expect(computePageCount(101, 50)).toBe(3);
    expect(computePageCount(100, 50)).toBe(2);
  });
});

describe("countActiveFilters", () => {
  it("sums every selected value across filters", () => {
    const filters: FilterParamMap = { status: ["complete", "failed"], source: ["deezer"] };
    expect(countActiveFilters(filters)).toBe(3);
  });

  it("returns 0 when no filters are set", () => {
    expect(countActiveFilters({})).toBe(0);
  });
});

describe("isLibraryView", () => {
  it("accepts the four known views", () => {
    expect(isLibraryView("tracks")).toBe(true);
    expect(isLibraryView("albums")).toBe(true);
    expect(isLibraryView("artists")).toBe(true);
    expect(isLibraryView("playlists")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isLibraryView("songs")).toBe(false);
    expect(isLibraryView(undefined)).toBe(false);
  });
});

describe("topFacetValues", () => {
  const values = Array.from({ length: 12 }, (_, index) => ({
    value: `v${index}`,
    label: `v${index}`,
    count: 1,
  }));

  it("truncates to the top N when not searching", () => {
    expect(topFacetValues(values, 8, false)).toHaveLength(8);
  });

  it("returns all values while searching", () => {
    expect(topFacetValues(values, 8, true)).toHaveLength(12);
  });
});

describe("buildTracksInput", () => {
  const baseFacetSearch: FacetSearchState = {};

  it("maps valid status and format values and drops unknown ones", () => {
    const input = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: undefined,
      filters: { status: ["complete", "bogus"], format: ["mp3", "bogus"] },
      facetSearch: baseFacetSearch,
    });

    expect(input.filters?.status).toEqual(["complete"]);
    expect(input.filters?.format).toEqual(["mp3"]);
  });

  it("omits empty filter arrays as undefined", () => {
    const input = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: undefined,
      filters: {},
      facetSearch: baseFacetSearch,
    });

    expect(input.filters?.artist).toBeUndefined();
    expect(input.filters?.orphan).toBeUndefined();
  });

  it("encodes the orphan flag and forwards facet search terms", () => {
    const input = buildTracksInput({
      limit: 50,
      offset: 100,
      q: "love",
      sort: "title",
      direction: undefined,
      filters: { orphan: ["true"], artist: ["Foo"] },
      facetSearch: { artist: "Fo" },
    });

    expect(input.filters?.orphan).toBe(true);
    expect(input.filters?.artist).toEqual(["Foo"]);
    expect(input.sort).toBe("title");
    expect(input.q).toBe("love");
    expect(input.offset).toBe(100);
    expect(input.facetSearch).toEqual({ artist: "Fo" });
  });

  it("forwards requestedBy user ids and omits the empty list", () => {
    const withRequester = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: undefined,
      filters: { requestedBy: ["user-1", "user-2"] },
      facetSearch: baseFacetSearch,
    });
    expect(withRequester.filters?.requestedBy).toEqual(["user-1", "user-2"]);

    const withoutRequester = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: undefined,
      filters: {},
      facetSearch: baseFacetSearch,
    });
    expect(withoutRequester.filters?.requestedBy).toBeUndefined();
  });

  it("falls back to the recent sort for an unknown sort value", () => {
    const input = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "nonsense",
      direction: undefined,
      filters: {},
      facetSearch: baseFacetSearch,
    });

    expect(input.sort).toBe("recent");
  });

  it("omits direction when unset and forwards it when present", () => {
    const withoutDir = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: undefined,
      filters: {},
      facetSearch: baseFacetSearch,
    });
    expect(withoutDir.direction).toBeUndefined();

    const withDir = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: "asc",
      filters: {},
      facetSearch: baseFacetSearch,
    });
    expect(withDir.direction).toBe("asc");
  });
});

describe("resolveEffectiveDirection", () => {
  it("returns the explicit direction when one is set", () => {
    expect(resolveEffectiveDirection(VIEW_CONFIG.albums, "name", "desc")).toBe("desc");
  });

  it("falls back to the sort option's default direction when unset", () => {
    expect(resolveEffectiveDirection(VIEW_CONFIG.albums, "name", undefined)).toBe("asc");
    expect(resolveEffectiveDirection(VIEW_CONFIG.albums, "year", undefined)).toBe("desc");
    expect(resolveEffectiveDirection(VIEW_CONFIG.tracks, "recent", undefined)).toBe("desc");
    expect(resolveEffectiveDirection(VIEW_CONFIG.artists, "name", undefined)).toBe("asc");
  });

  it("falls back to descending for an unknown sort", () => {
    expect(resolveEffectiveDirection(VIEW_CONFIG.playlists, "nonsense", undefined)).toBe("desc");
  });
});

describe("viewCountFor", () => {
  it("returns undefined while counts are loading", () => {
    expect(viewCountFor("albums", undefined)).toBeUndefined();
  });

  it("reads the count for the requested view", () => {
    const counts = { tracks: 12, albums: 3, artists: 7, playlists: 2 };
    expect(viewCountFor("artists", counts)).toBe(7);
  });
});

describe("VIEW_CONFIG layout", () => {
  it("renders tracks as a table and the other three as grids", () => {
    expect(VIEW_CONFIG.tracks.layout).toBe("table");
    expect(VIEW_CONFIG.albums.layout).toBe("grid");
    expect(VIEW_CONFIG.artists.layout).toBe("grid");
    expect(VIEW_CONFIG.playlists.layout).toBe("grid");
  });

  it("gives every sort option a default direction", () => {
    const views: LibraryView[] = ["tracks", "albums", "artists", "playlists"];
    for (const view of views) {
      for (const option of VIEW_CONFIG[view].sortOptions) {
        expect(option.defaultDirection === "asc" || option.defaultDirection === "desc").toBe(true);
      }
    }
  });
});

function track(overrides: Partial<LibraryTrackItem>): LibraryTrackItem {
  return {
    id: "trk-1",
    external_id: "ext-1",
    title: "Aerodynamic",
    artist: "Daft Punk",
    status: "complete",
    source: "local",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    file_bitrate: null,
    file_format: null,
    playable: true,
    sources: [],
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: [],
    playlistIds: [],
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    libraryPath: null,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
    ...overrides,
  };
}

function album(overrides: Partial<LibraryAlbumItem>): LibraryAlbumItem {
  return {
    id: "alb-1",
    external_id: "ext-alb-1",
    name: "Discovery",
    artist: "Daft Punk",
    album_art: null,
    status: "complete",
    total_tracks: 14,
    completed_tracks: 14,
    source_provider: null,
    release_date: "2001-03-12",
    genres: [],
    year: 2001,
    quality: null,
    requested: true,
    libraryPaths: [],
    created_at: new Date("2001-03-12T00:00:00.000Z"),
    ...overrides,
  };
}

const STATUS: LibraryFilesStatus = {
  running: false,
  kind: "move",
  targetPathId: "archive",
  total: 3,
  processed: 3,
  done: 3,
  failed: 0,
  startedAt: "2026-10-14T10:00:00.000Z",
  finishedAt: "2026-10-14T10:00:05.000Z",
  failures: [],
};

const JOB: LibraryFileJob = { kind: "move", targetLabel: "Archive", baseline: null, since: 1000, visible: true };

describe("library path facet", () => {
  it.each(["tracks", "albums"] as const)("is offered on the %s view and read from the URL", (view) => {
    expect(VIEW_CONFIG[view].facets.map((facet) => facet.key)).toContain("libraryPath");
    expect(VIEW_CONFIG[view].filterParamKeys).toContain("libraryPath");
  });

  it("hides itself while the library has a single path to pick", () => {
    const def = VIEW_CONFIG.tracks.facets.find((facet) => facet.key === "libraryPath");
    expect(def?.hideWithoutChoice).toBe(true);
  });

  it("sends the chosen path ids with the tracks query", () => {
    const input = buildTracksInput({
      limit: 50,
      offset: 0,
      q: undefined,
      sort: "recent",
      direction: undefined,
      filters: { libraryPath: ["music", "archive"] },
      facetSearch: {},
    });

    expect(input.filters?.libraryPath).toEqual(["music", "archive"]);
  });

  it("sends the chosen path ids with the albums query, and nothing when none is chosen", () => {
    const base = { limit: 50, offset: 0, q: undefined, sort: "recent", direction: undefined, facetSearch: {} };

    expect(buildAlbumsInput({ ...base, filters: { libraryPath: ["archive"] } }).filters?.libraryPath).toEqual([
      "archive",
    ]);
    expect(buildAlbumsInput({ ...base, filters: {} }).filters?.libraryPath).toBeUndefined();
  });
});

describe("file targets", () => {
  it("targets a track by id, with the path it sits in", () => {
    expect(trackFileTarget(track({ libraryPath: { id: "music", label: "Music" } }))).toEqual({
      scope: "track",
      trackId: "trk-1",
      title: "Aerodynamic",
      pathIds: ["music"],
    });
  });

  it("gives a track with no file in the library no path", () => {
    expect(trackFileTarget(track({})).pathIds).toEqual([]);
  });

  it("collects the selected rows and each path they sit in once", () => {
    const items = [
      track({ id: "a", libraryPath: { id: "music", label: "Music" } }),
      track({ id: "b", libraryPath: { id: "music", label: "Music" } }),
      track({ id: "c", libraryPath: { id: "archive", label: "Archive" } }),
      track({ id: "d", libraryPath: { id: "archive", label: "Archive" } }),
    ];

    expect(selectedTracksFileTarget(items, ["a", "b", "c"])).toEqual({
      scope: "tracks",
      trackIds: ["a", "b", "c"],
      pathIds: ["music", "archive"],
    });
  });

  it("spends the selection on a delete and on a bulk move, never on a single row's move", () => {
    const row = trackFileTarget(track({ libraryPath: { id: "music", label: "Music" } }));
    const bulk = selectedTracksFileTarget([track({ libraryPath: { id: "music", label: "Music" } })], ["trk-1"]);

    expect(spendsSelection({ kind: "move", target: row })).toBe(false);
    expect(spendsSelection({ kind: "move", target: bulk })).toBe(true);
    expect(spendsSelection({ kind: "delete", target: row })).toBe(true);
  });

  it("spends the album selection on a bulk album move, never on one album's own move", () => {
    const one: LibraryFileTarget = { scope: "album", albumId: "alb-1", name: "Discovery", pathIds: ["music"] };
    const many: LibraryFileTarget = { scope: "albums", albumIds: ["alb-1", "alb-2"], pathIds: ["music"] };

    expect(spendsSelection({ kind: "move", target: one })).toBe(false);
    expect(spendsSelection({ kind: "move", target: many })).toBe(true);
  });

  it("collects the selected albums by album id and each path they sit in once", () => {
    const items = [
      album({ id: "a", libraryPaths: [{ id: "music", label: "Music" }] }),
      album({
        id: "b",
        libraryPaths: [
          { id: "music", label: "Music" },
          { id: "archive", label: "Archive" },
        ],
      }),
      album({ id: "c", libraryPaths: [{ id: "lossy", label: "Lossy" }] }),
    ];

    expect(selectedAlbumsFileTarget(items, ["a", "b"])).toEqual({
      scope: "albums",
      albumIds: ["a", "b"],
      pathIds: ["music", "archive"],
    });
  });
});

describe("applySelectionShortcut", () => {
  function keyEvent(init: Partial<KeyboardEvent<HTMLElement>>): KeyboardEvent<HTMLElement> {
    return {
      key: "",
      code: "",
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      ...init,
    } as unknown as KeyboardEvent<HTMLElement>;
  }

  function target(selectedCount: number) {
    return { selectedCount, setMany: vi.fn(), clear: vi.fn() };
  }

  it("selects every shown id on Ctrl+A or Cmd+A", () => {
    const ctrl = target(0);
    const meta = target(0);
    const event = keyEvent({ key: "a", code: "KeyA", ctrlKey: true });

    expect(applySelectionShortcut(event, ctrl, ["a", "b"])).toBe(true);
    expect(applySelectionShortcut(keyEvent({ key: "a", code: "KeyA", metaKey: true }), meta, ["a"])).toBe(true);

    expect(ctrl.setMany).toHaveBeenCalledWith(["a", "b"], true);
    expect(meta.setMany).toHaveBeenCalledWith(["a"], true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("leaves Ctrl+A and Escape to a text field the person is typing in", () => {
    const selection = target(2);
    const input = document.createElement("input");
    const event = keyEvent({ key: "a", code: "KeyA", ctrlKey: true, target: input });

    expect(applySelectionShortcut(event, selection, ["a"])).toBe(false);
    expect(applySelectionShortcut(keyEvent({ key: "Escape", target: input }), selection, ["a"])).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(selection.setMany).not.toHaveBeenCalled();
    expect(selection.clear).not.toHaveBeenCalled();
  });

  it("still selects from a checkbox, which takes no text", () => {
    const selection = target(0);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    expect(applySelectionShortcut(keyEvent({ code: "KeyA", ctrlKey: true, target: checkbox }), selection, ["a"])).toBe(
      true
    );
  });

  it("leaves Ctrl+Shift+A and a bare A alone", () => {
    const selection = target(0);

    expect(applySelectionShortcut(keyEvent({ code: "KeyA", ctrlKey: true, shiftKey: true }), selection, ["a"])).toBe(
      false
    );
    expect(applySelectionShortcut(keyEvent({ key: "a", code: "KeyA" }), selection, ["a"])).toBe(false);
    expect(selection.setMany).not.toHaveBeenCalled();
  });

  it("clears on Escape only while something is selected", () => {
    const empty = target(0);
    const some = target(2);

    expect(applySelectionShortcut(keyEvent({ key: "Escape" }), empty, [])).toBe(false);
    expect(applySelectionShortcut(keyEvent({ key: "Escape" }), some, [])).toBe(true);

    expect(empty.clear).not.toHaveBeenCalled();
    expect(some.clear).toHaveBeenCalledTimes(1);
  });
});

describe("rangePreviewTone", () => {
  it("previews nothing without a range, and the anchor's state otherwise", () => {
    expect(rangePreviewTone(null)).toBe("none");
    expect(rangePreviewTone({ ids: ["a"], selected: true })).toBe("select");
    expect(rangePreviewTone({ ids: ["a"], selected: false })).toBe("clear");
  });
});

describe("fileJobReport", () => {
  it("reads a status fetched after the job began whose run is a new one", () => {
    expect(fileJobReport(JOB, STATUS, 2000)).toBe(STATUS);
  });

  it("ignores a status fetched before the job began", () => {
    expect(fileJobReport(JOB, STATUS, 999)).toBeNull();
  });

  it("ignores the run that was already on record when the job began", () => {
    expect(fileJobReport({ ...JOB, baseline: STATUS.startedAt }, STATUS, 2000)).toBeNull();
  });

  it("ignores a status that has never run anything", () => {
    expect(fileJobReport(JOB, { ...STATUS, startedAt: null }, 2000)).toBeNull();
  });

  it("reports nothing without a job or a status", () => {
    expect(fileJobReport(null, STATUS, 2000)).toBeNull();
    expect(fileJobReport(JOB, undefined, 2000)).toBeNull();
  });
});
