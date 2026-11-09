import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLibraryUrlState } from "../useLibraryUrlState";

let currentSearch = "";
const replaceMock = vi.fn((url: string) => {
  const queryIndex = url.indexOf("?");
  currentSearch = queryIndex >= 0 ? url.slice(queryIndex + 1) : "";
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/library",
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function lastReplacedParams(): URLSearchParams {
  if (replaceMock.mock.calls.length === 0) return new URLSearchParams();
  const url: string = replaceMock.mock.calls[replaceMock.mock.calls.length - 1][0];
  const queryIndex = url.indexOf("?");
  return new URLSearchParams(queryIndex >= 0 ? url.slice(queryIndex + 1) : "");
}

describe("useLibraryUrlState", () => {
  beforeEach(() => {
    currentSearch = "";
    replaceMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("persists the FULL search string", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setSearch("rock"));
    rerender();

    expect(lastReplacedParams().get("q")).toBe("rock");
  });

  it("persists the FULL facet-search value, not just the last character", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setFacetSearch("genre", "Ro"));
    rerender();
    act(() => result.current.setFacetSearch("genre", "Rock"));
    rerender();

    expect(lastReplacedParams().get("fs_genre")).toBe("Rock");
  });

  it("toggles a facet value into the URL and keeps an existing search param", () => {
    currentSearch = "q=rock";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setFilterValues("status", ["failed"]));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("status")).toBe("failed");
    expect(params.get("q")).toBe("rock");
  });

  it("writes the sort param", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setSort("title"));
    rerender();

    expect(lastReplacedParams().get("sort")).toBe("title");
  });

  it("composes cumulative params across successive control changes", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setFilterValues("status", ["failed"]));
    rerender();
    act(() => result.current.setSearch("rock"));
    rerender();
    act(() => result.current.setSort("title"));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("status")).toBe("failed");
    expect(params.get("q")).toBe("rock");
    expect(params.get("sort")).toBe("title");
  });

  it("reflects the active sort's default direction when dir is unset", () => {
    const { result } = renderHook(() => useLibraryUrlState());

    expect(result.current.direction).toBeUndefined();
    expect(result.current.effectiveDirection).toBe("desc");
  });

  it("writes dir to the URL only when it differs from the sort default", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setDir("asc"));
    rerender();

    expect(lastReplacedParams().get("dir")).toBe("asc");
    expect(result.current.direction).toBe("asc");
    expect(result.current.effectiveDirection).toBe("asc");
  });

  it("drops the dir param when toggled back to the sort default", () => {
    currentSearch = "dir=asc";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    expect(result.current.direction).toBe("asc");

    act(() => result.current.setDir("desc"));
    rerender();

    expect(lastReplacedParams().get("dir")).toBeNull();
  });

  it("clears dir when the sort changes", () => {
    currentSearch = "sort=title&dir=desc";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setSort("artist"));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("sort")).toBe("artist");
    expect(params.get("dir")).toBeNull();
  });

  it("clears sort and dir when the view changes", () => {
    currentSearch = "tab=albums&sort=name&dir=asc";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setTab("artists"));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("tab")).toBe("artists");
    expect(params.get("sort")).toBeNull();
    expect(params.get("dir")).toBeNull();
  });

  it("round-trips an ignored dir value back to undefined", () => {
    currentSearch = "dir=sideways";
    const { result } = renderHook(() => useLibraryUrlState());

    expect(result.current.direction).toBeUndefined();
  });

  it.each(["tracks", "albums"])("reads the library path filter from the URL on the %s view", (tab) => {
    currentSearch = `tab=${tab}&libraryPath=music,archive`;
    const { result } = renderHook(() => useLibraryUrlState());

    expect(result.current.filters.libraryPath).toEqual(["music", "archive"]);
  });

  it("writes a library path choice to the URL", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setFilterValues("libraryPath", ["archive"]));
    rerender();

    expect(lastReplacedParams().get("libraryPath")).toBe("archive");
  });

  it("drops the library path filter with the rest when the filters are cleared", () => {
    currentSearch = "libraryPath=archive&status=failed";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.clearFilters());
    rerender();

    expect(lastReplacedParams().get("libraryPath")).toBeNull();
  });

  it("reads the play-count sort from the URL", () => {
    currentSearch = "sort=allPlays";
    const { result } = renderHook(() => useLibraryUrlState());

    expect(result.current.sort).toBe("allPlays");
  });
});
