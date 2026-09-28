import { describe, expect, it } from "vitest";

import { VIEW_CONFIG } from "../constants";
import {
  buildTracksInput,
  clampPage,
  computePageCount,
  countActiveFilters,
  isLibraryView,
  parseFilterValues,
  resolveEffectiveDirection,
  resolvePageSize,
  serializeFilterValues,
  toggleFilterValue,
  topFacetValues,
  viewCountFor,
} from "../helpers";
import type { FacetSearchState, FilterParamMap, LibraryView } from "../types";

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
