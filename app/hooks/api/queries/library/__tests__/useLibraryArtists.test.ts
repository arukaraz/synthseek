import { beforeEach, describe, expect, it, vi } from "vitest";

import { act, createTestQueryClient, renderHookWithProviders, waitFor } from "@test/test-utils";

import { LIBRARY_BATCH_LIMIT } from "../constants";
import type { LibraryArtistsInput, LibraryArtistsResult } from "../types";
import { useLibraryArtists } from "../useLibraryArtists";

const TOTAL = 130;

const fetchArtists = vi.hoisted(() => vi.fn());

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ library: { getArtists: { fetch: fetchArtists } } }),
    library: { getArtists: {} },
  },
}));

vi.mock("@trpc/react-query", () => ({
  getQueryKey: (_procedure: unknown, input: unknown, type: string) => [["library", "getArtists"], { input, type }],
}));

function pageOf(input: LibraryArtistsInput): LibraryArtistsResult {
  const offset = input.offset ?? 0;
  const end = Math.min(TOTAL, offset + (input.limit ?? LIBRARY_BATCH_LIMIT));
  return {
    items: Array.from({ length: end - offset }, (_, index) => ({
      id: null,
      artist: `Artist ${offset + index}`,
      trackCount: 1,
      albumCount: 1,
      albumArt: null,
      genre: null,
    })),
    total: TOTAL,
    facets: { genre: [{ value: "pop", label: "Pop", count: 3 }] },
    letterIndex: [{ letter: "A", offset: 0 }],
  };
}

const INPUT: LibraryArtistsInput = { sort: "name" };

describe("useLibraryArtists", () => {
  beforeEach(() => {
    fetchArtists.mockReset();
    fetchArtists.mockImplementation(async (input: LibraryArtistsInput) => pageOf(input));
  });

  it("loads the first batch and exposes its total, facets and letter index", async () => {
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, true));

    await waitFor(() => expect(result.current.items).toHaveLength(LIBRARY_BATCH_LIMIT));
    expect(fetchArtists).toHaveBeenCalledWith({ sort: "name", offset: 0, limit: LIBRARY_BATCH_LIMIT });
    expect(result.current.total).toBe(TOTAL);
    expect(result.current.facets).toEqual({ genre: [{ value: "pop", label: "Pop", count: 3 }] });
    expect(result.current.letterIndex).toEqual([{ letter: "A", offset: 0 }]);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("reports nothing while disabled", () => {
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, false));

    expect(fetchArtists).not.toHaveBeenCalled();
    expect(result.current.items).toBeUndefined();
    expect(result.current.total).toBe(0);
    expect(result.current.facets).toEqual({});
    expect(result.current.letterIndex).toEqual([]);
  });

  it("loads through a far offset in one stretched batch, then goes back to normal batches", async () => {
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, true));
    await waitFor(() => expect(result.current.items).toHaveLength(LIBRARY_BATCH_LIMIT));

    await act(() => result.current.loadThrough(110));

    expect(fetchArtists).toHaveBeenCalledTimes(2);
    expect(fetchArtists).toHaveBeenLastCalledWith({ sort: "name", offset: 50, limit: 110 });
    await waitFor(() => expect(result.current.items).toHaveLength(TOTAL));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("keeps every jumped-to row when the list refetches", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, true), { queryClient });
    await waitFor(() => expect(result.current.items).toHaveLength(LIBRARY_BATCH_LIMIT));
    await act(() => result.current.loadThrough(110));
    await waitFor(() => expect(result.current.items).toHaveLength(TOTAL));
    fetchArtists.mockClear();

    await act(() => queryClient.refetchQueries());

    expect(fetchArtists.mock.calls.map(([call]) => call)).toEqual([
      { sort: "name", offset: 0, limit: LIBRARY_BATCH_LIMIT },
      { sort: "name", offset: 50, limit: 110 },
    ]);
    expect(result.current.items).toHaveLength(TOTAL);
  });

  it("does not let a cancelled batch that resolves late shrink the jumped-to page on refetch", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, true), { queryClient });
    await waitFor(() => expect(result.current.items).toHaveLength(LIBRARY_BATCH_LIMIT));
    let releaseStale: () => void = () => undefined;
    fetchArtists.mockImplementationOnce(
      (input: LibraryArtistsInput) =>
        new Promise<LibraryArtistsResult>((resolve) => {
          releaseStale = () => resolve(pageOf(input));
        })
    );

    const stalePage = result.current.fetchNextPage();
    await waitFor(() => expect(fetchArtists).toHaveBeenCalledTimes(2));
    await act(() => result.current.loadThrough(110));
    releaseStale();
    await act(async () => {
      await stalePage;
    });
    await waitFor(() => expect(result.current.items).toHaveLength(TOTAL));
    fetchArtists.mockClear();

    await act(() => queryClient.refetchQueries());

    expect(fetchArtists.mock.calls.map(([call]) => call)).toEqual([
      { sort: "name", offset: 0, limit: LIBRARY_BATCH_LIMIT },
      { sort: "name", offset: 50, limit: 110 },
    ]);
  });

  it("does not fetch for an offset that is already loaded", async () => {
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, true));
    await waitFor(() => expect(result.current.items).toHaveLength(LIBRARY_BATCH_LIMIT));

    await act(() => result.current.loadThrough(10));

    expect(fetchArtists).toHaveBeenCalledTimes(1);
  });

  it("stops loading through when a batch fails, and asks for a normal batch next time", async () => {
    const { result } = renderHookWithProviders(() => useLibraryArtists(INPUT, true));
    await waitFor(() => expect(result.current.items).toHaveLength(LIBRARY_BATCH_LIMIT));
    fetchArtists.mockRejectedValueOnce(new Error("offline"));

    await act(() => result.current.loadThrough(120));

    expect(fetchArtists).toHaveBeenCalledTimes(2);
    expect(fetchArtists).toHaveBeenLastCalledWith({ sort: "name", offset: 50, limit: 120 });

    await act(() => result.current.fetchNextPage());

    expect(fetchArtists).toHaveBeenLastCalledWith({ sort: "name", offset: 50, limit: LIBRARY_BATCH_LIMIT });
  });
});
