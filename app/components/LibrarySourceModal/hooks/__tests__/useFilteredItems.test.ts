import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";

import { useFilteredItems } from "../useFilteredItems";

describe("useFilteredItems", () => {
  const playlist = createMockLibraryItem({ id: "p1", type: "playlist", name: "Alpha", totalTracks: 5 });
  const album = createMockLibraryItem({ id: "a1", type: "album", name: "Beta", totalTracks: 12 });
  const liked = createMockLibraryItem({ id: "l1", type: "liked", name: "Liked Songs", totalTracks: 30 });

  it("returns only items matching the filter", () => {
    const { result } = renderHook(() =>
      useFilteredItems({
        items: [playlist, album, liked],
        filter: "albums",
        sort: "name",
        direction: "asc",
        search: "",
      })
    );

    expect(result.current.map((i) => i.id)).toEqual(["a1"]);
  });

  it("narrows by search across name", () => {
    const { result } = renderHook(() =>
      useFilteredItems({
        items: [playlist, album, liked],
        filter: "all",
        sort: "name",
        direction: "asc",
        search: "alpha",
      })
    );

    expect(result.current.map((i) => i.id)).toEqual(["p1"]);
  });

  it("sorts by track count descending", () => {
    const { result } = renderHook(() =>
      useFilteredItems({
        items: [playlist, album, liked],
        filter: "all",
        sort: "tracks",
        direction: "desc",
        search: "",
      })
    );

    expect(result.current.map((i) => i.id)).toEqual(["l1", "a1", "p1"]);
  });
});
