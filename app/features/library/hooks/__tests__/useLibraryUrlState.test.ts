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

  it("persists the FULL search string and resets the page in one write", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setSearch("rock"));
    rerender();

    expect(lastReplacedParams().get("q")).toBe("rock");
    expect(lastReplacedParams().get("page")).toBeNull();
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
    expect(params.get("page")).toBeNull();
  });

  it("writes the sort param and resets the page together", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setSort("title"));
    rerender();

    expect(lastReplacedParams().get("sort")).toBe("title");
    expect(lastReplacedParams().get("page")).toBeNull();
  });

  it("round-trips the page numerically through Next and Previous arithmetic", () => {
    currentSearch = "status=failed";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(result.current.page + 1));
    rerender();
    expect(result.current.page).toBe(2);
    expect(lastReplacedParams().get("page")).toBe("2");
    expect(lastReplacedParams().get("status")).toBe("failed");

    act(() => result.current.setPage(result.current.page + 1));
    rerender();
    expect(result.current.page).toBe(3);
    expect(lastReplacedParams().get("page")).toBe("3");
    expect(lastReplacedParams().get("status")).toBe("failed");

    act(() => result.current.setPage(result.current.page - 1));
    rerender();
    expect(result.current.page).toBe(2);
    expect(lastReplacedParams().get("page")).toBe("2");

    act(() => result.current.setPage(result.current.page - 1));
    rerender();
    expect(result.current.page).toBe(1);
    expect(lastReplacedParams().get("page")).toBeNull();
    expect(lastReplacedParams().get("status")).toBe("failed");
  });

  it("advances the page without dropping active filters and search", () => {
    currentSearch = "q=rock&status=failed";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setPage(2));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("page")).toBe("2");
    expect(params.get("q")).toBe("rock");
    expect(params.get("status")).toBe("failed");
  });

  it("composes cumulative params across successive control changes", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setFilterValues("status", ["failed"]));
    rerender();
    act(() => result.current.setSearch("rock"));
    rerender();
    act(() => result.current.setSort("title"));
    rerender();
    act(() => result.current.setPage(2));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("status")).toBe("failed");
    expect(params.get("q")).toBe("rock");
    expect(params.get("sort")).toBe("title");
    expect(params.get("page")).toBe("2");
  });

  it("changes rows-per-page and resets the page in one write", () => {
    currentSearch = "page=3";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setPageSize(100));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("rows")).toBe("100");
    expect(params.get("page")).toBeNull();
  });

  it("reflects the active sort's default direction when dir is unset", () => {
    const { result } = renderHook(() => useLibraryUrlState());

    expect(result.current.direction).toBeUndefined();
    expect(result.current.effectiveDirection).toBe("desc");
  });

  it("writes dir to the URL only when it differs from the sort default, and resets the page", () => {
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setDir("asc"));
    rerender();

    expect(lastReplacedParams().get("dir")).toBe("asc");
    expect(lastReplacedParams().get("page")).toBeNull();
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

  it("clears dir and sort when the sort changes", () => {
    currentSearch = "sort=title&dir=desc";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setSort("artist"));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("sort")).toBe("artist");
    expect(params.get("dir")).toBeNull();
    expect(params.get("page")).toBeNull();
  });

  it("clears sort, dir and page when the view changes", () => {
    currentSearch = "tab=albums&sort=name&dir=asc&page=2";
    const { result, rerender } = renderHook(() => useLibraryUrlState());

    act(() => result.current.setTab("artists"));
    rerender();

    const params = lastReplacedParams();
    expect(params.get("tab")).toBe("artists");
    expect(params.get("sort")).toBeNull();
    expect(params.get("dir")).toBeNull();
    expect(params.get("page")).toBeNull();
  });

  it("round-trips an ignored dir value back to undefined", () => {
    currentSearch = "dir=sideways";
    const { result } = renderHook(() => useLibraryUrlState());

    expect(result.current.direction).toBeUndefined();
  });
});
