import { describe, expect, it } from "vitest";

import { coverInitials, libraryCopyId, newSuggestionSeed, visibleSuggestions } from "../helpers";
import type { SuggestedTrack } from "../types";

function suggestion(externalId: string, overrides?: Partial<SuggestedTrack>): SuggestedTrack {
  return {
    externalId,
    title: `Song ${externalId}`,
    artist: "Artist",
    inLibrary: false,
    requestId: null,
    ...overrides,
  } as SuggestedTrack;
}

describe("newSuggestionSeed", () => {
  it("stays inside the unsigned 32-bit range the server accepts", () => {
    expect(newSuggestionSeed(() => 0)).toBe(0);
    expect(newSuggestionSeed(() => 0.5)).toBe(0x80000000);
    expect(newSuggestionSeed(() => 1)).toBe(0xffffffff);
  });
});

describe("libraryCopyId", () => {
  it("is the request id only when the track is in the library", () => {
    expect(libraryCopyId(suggestion("a", { inLibrary: true, requestId: "req-1" }))).toBe("req-1");
    expect(libraryCopyId(suggestion("a", { inLibrary: false, requestId: "req-1" }))).toBeNull();
    expect(libraryCopyId(suggestion("a"))).toBeNull();
  });
});

describe("visibleSuggestions", () => {
  const tracks = ["a", "b", "c", "d"].map((id) => suggestion(id));

  it("drops hidden rows before it cuts the page, so a hidden row is replaced by the next one", () => {
    const result = visibleSuggestions(tracks, new Set(["a"]), 2);
    expect(result.rows.map((track) => track.externalId)).toEqual(["b", "c"]);
    expect(result.more).toBe(true);
    expect(result.total).toBe(3);
  });

  it("reports no more once every kept row is shown", () => {
    const result = visibleSuggestions(tracks, new Set(["a", "b"]), 2);
    expect(result.rows.map((track) => track.externalId)).toEqual(["c", "d"]);
    expect(result.more).toBe(false);
  });

  it("reports an empty total when everything was hidden", () => {
    expect(visibleSuggestions(tracks, new Set(["a", "b", "c", "d"]), 8)).toEqual({ rows: [], more: false, total: 0 });
  });
});

describe("coverInitials", () => {
  it("takes the first two characters of the trimmed title in upper case", () => {
    expect(coverInitials("  night drive")).toBe("NI");
  });
});
