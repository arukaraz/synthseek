import { describe, it, expect } from "vitest";

import { getActiveFilter, getAvailableTypes, getFilteredResults, getFlatResults } from "../helpers";
import { createMockTrackFull, createMockAlbumSimplified, createMockArtistFull } from "@test/factories";

function buildResponse() {
  return {
    tracks: { items: [createMockTrackFull({ id: "t1" })], total: 1 },
    albums: { items: [createMockAlbumSimplified({ id: "al1" })], total: 1 },
    artists: { items: [createMockArtistFull({ id: "ar1" })], total: 1 },
    playlists: { items: [], total: 0 },
  };
}

describe("getFlatResults", () => {
  it("returns an empty array when there is no response", () => {
    expect(getFlatResults(undefined)).toEqual([]);
  });

  it("flattens every present section into a single list", () => {
    const flat = getFlatResults(buildResponse());

    expect(flat.map((item) => item.id)).toEqual(["t1", "al1", "ar1"]);
  });

  it("tolerates missing sections", () => {
    const flat = getFlatResults({ tracks: { items: [createMockTrackFull({ id: "t1" })], total: 1 } });

    expect(flat).toHaveLength(1);
  });
});

describe("getAvailableTypes", () => {
  it("returns an empty set when there is no response", () => {
    expect(getAvailableTypes(undefined).size).toBe(0);
  });

  it("only includes types that have at least one item", () => {
    const types = getAvailableTypes(buildResponse());

    expect(types.has("track")).toBe(true);
    expect(types.has("album")).toBe(true);
    expect(types.has("artist")).toBe(true);
    expect(types.has("playlist")).toBe(false);
  });
});

describe("getFilteredResults", () => {
  const response = buildResponse();
  const flat = getFlatResults(response);

  it("returns tracks for the track filter", () => {
    expect(getFilteredResults(response, "track", flat).map((i) => i.id)).toEqual(["t1"]);
  });

  it("returns albums for the album filter", () => {
    expect(getFilteredResults(response, "album", flat).map((i) => i.id)).toEqual(["al1"]);
  });

  it("returns artists for the artist filter", () => {
    expect(getFilteredResults(response, "artist", flat).map((i) => i.id)).toEqual(["ar1"]);
  });

  it("returns playlists for the playlist filter", () => {
    expect(getFilteredResults(response, "playlist", flat)).toEqual([]);
  });

  it("returns the flat list for the all filter", () => {
    expect(getFilteredResults(response, "all", flat)).toBe(flat);
  });

  it("falls back to empty arrays when the response is undefined", () => {
    expect(getFilteredResults(undefined, "track", [])).toEqual([]);
    expect(getFilteredResults(undefined, "album", [])).toEqual([]);
    expect(getFilteredResults(undefined, "artist", [])).toEqual([]);
    expect(getFilteredResults(undefined, "playlist", [])).toEqual([]);
  });
});

describe("getActiveFilter", () => {
  it("uses the filter param when it is a valid filter", () => {
    expect(getActiveFilter("album", "all")).toBe("album");
  });

  it("falls back to the initial filter when the param is null", () => {
    expect(getActiveFilter(null, "track")).toBe("track");
  });

  it("falls back to all when the candidate is not a valid filter", () => {
    expect(getActiveFilter("bogus", "all")).toBe("all");
  });
});
