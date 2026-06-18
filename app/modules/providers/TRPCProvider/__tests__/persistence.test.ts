import { describe, it, expect } from "vitest";
import type { QueryKey, QueryStatus } from "@tanstack/react-query";

import { shouldDehydrateQuery } from "../persistence";

function buildCandidate(queryKey: QueryKey, status: QueryStatus) {
  return { queryKey, state: { status } };
}

describe("shouldDehydrateQuery", () => {
  it("persists a successful contentDetail query", () => {
    const candidate = buildCandidate(
      [["contentDetail", "resolveArtist"], { input: { name: "Boards of Canada" }, type: "query" }],
      "success"
    );
    expect(shouldDehydrateQuery(candidate)).toBe(true);
  });

  it("persists the music.getContents catalog query", () => {
    const candidate = buildCandidate(
      [["music", "getContents"], { input: { parentId: "1" }, type: "query" }],
      "success"
    );
    expect(shouldDehydrateQuery(candidate)).toBe(true);
  });

  it("excludes the volatile music.search query even when successful", () => {
    const candidate = buildCandidate([["music", "search"], { input: { query: "boards" }, type: "query" }], "success");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });

  it("excludes other music discover reads such as music.trendingTracks", () => {
    const candidate = buildCandidate([["music", "trendingTracks"], { type: "query" }], "success");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });

  it("excludes a requests query even when successful", () => {
    const candidate = buildCandidate([["requests", "getAll"], { type: "query" }], "success");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });

  it("excludes a library track-status query even when successful", () => {
    const candidate = buildCandidate([["library", "getArtists"], { type: "infinite" }], "success");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });

  it("excludes a contentDetail query that is not successful", () => {
    const candidate = buildCandidate([["contentDetail", "resolveArtist"], { type: "query" }], "error");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });

  it("excludes a pending contentDetail query", () => {
    const candidate = buildCandidate([["contentDetail", "albumDetail"], { type: "query" }], "pending");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });

  it("returns false for a non-array path", () => {
    const candidate = buildCandidate(["flat-key"], "success");
    expect(shouldDehydrateQuery(candidate)).toBe(false);
  });
});
