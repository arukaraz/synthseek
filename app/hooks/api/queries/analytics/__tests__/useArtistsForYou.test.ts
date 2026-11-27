import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface Suggestion {
  artist: { id: string; name: string; images: never[] };
  latestAlbum: null;
  inLibrary: boolean;
}

interface Ask {
  exclude: string[];
  limit?: number;
}

const toasts = vi.hoisted(() => ({ error: vi.fn() }));
const api = vi.hoisted(() => {
  const first: Suggestion[] = [];
  return { first, fetch: vi.fn<(ask: Ask) => Promise<Suggestion[]>>() };
});

vi.mock("sonner", () => ({ toast: toasts }));
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ analytics: { discover: { artistsForYou: { fetch: api.fetch } } } }),
    analytics: {
      discover: {
        artistsForYou: { useQuery: () => ({ data: api.first, isLoading: false, isError: false }) },
      },
    },
  },
}));

import { useArtistsForYou } from "../useArtistsForYou";

function artist(id: string): Suggestion {
  return { artist: { id, name: id, images: [] }, latestAlbum: null, inLibrary: false };
}

function ids(items: readonly { artist: { id: string } }[] | undefined): string[] {
  return (items ?? []).map((item) => item.artist.id);
}

beforeEach(() => {
  vi.clearAllMocks();
  api.first = [artist("a"), artist("b"), artist("c"), artist("d")];
});

describe("swapping suggested artists", () => {
  it("puts the next unseen artist in the place of the one dismissed", async () => {
    api.fetch.mockResolvedValueOnce([artist("e")]);
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.replace("b"));

    expect(api.fetch).toHaveBeenCalledWith({ exclude: ["a", "b", "c", "d"], limit: 1 }, { staleTime: 0 });
    expect(ids(result.current.data)).toEqual(["a", "e", "c", "d"]);
  });

  it("drops the place when no other artist is left", async () => {
    api.fetch.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.replace("b"));

    expect(ids(result.current.data)).toEqual(["a", "c", "d"]);
  });

  it("changes every artist, never showing one already seen until none is left", async () => {
    api.fetch
      .mockResolvedValueOnce([artist("e"), artist("f")])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([artist("a")]);
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.reroll());
    expect(ids(result.current.data)).toEqual(["e", "f"]);

    await act(() => result.current.reroll());
    expect(api.fetch).toHaveBeenNthCalledWith(2, { exclude: ["a", "b", "c", "d", "e", "f"] }, { staleTime: 0 });
    expect(api.fetch).toHaveBeenNthCalledWith(3, { exclude: ["e", "f"] }, { staleTime: 0 });
    expect(ids(result.current.data)).toEqual(["a"]);
  });

  it("keeps the artists shown and says so when the catalog fails", async () => {
    api.fetch.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.reroll());

    expect(ids(result.current.data)).toEqual(["a", "b", "c", "d"]);
    expect(toasts.error).toHaveBeenCalledOnce();
    expect(result.current.pending).toEqual([]);
  });

  it("marks only the dismissed artist as loading, and every artist on a reroll", async () => {
    let settle: (value: Suggestion[]) => void = () => {};
    api.fetch.mockImplementation(
      () =>
        new Promise<Suggestion[]>((resolve) => {
          settle = resolve;
        })
    );
    const { result } = renderHook(() => useArtistsForYou());

    let swap: Promise<void> = Promise.resolve();
    act(() => {
      swap = result.current.replace("b");
    });
    expect(result.current.pending).toEqual(["b"]);
    await act(async () => {
      settle([artist("e")]);
      await swap;
    });
    expect(result.current.pending).toEqual([]);

    act(() => {
      swap = result.current.reroll();
    });
    expect(result.current.pending).toEqual(["a", "e", "c", "d"]);
    await act(async () => {
      settle([artist("f")]);
      await swap;
    });
    expect(result.current.pending).toEqual([]);
  });
});
