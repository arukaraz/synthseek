import { act, renderHook } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface Suggestion {
  artist: { id: string; name: string; images: never[] };
  latestAlbum: null;
  inLibrary: boolean;
}

interface Ask {
  ids: string[];
}

const toasts = vi.hoisted(() => ({ error: vi.fn() }));
const api = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  const cache = {
    data: [] as Suggestion[],
    read: () => cache.data,
    write: (next: Suggestion[]) => {
      cache.data = next;
      listeners.forEach((notify) => notify());
    },
    subscribe: (notify: () => void) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
  };
  const pass = vi.fn<(ask: Ask) => Promise<Suggestion[]>>();
  return { cache, pass, mutation: { mutateAsync: pass } };
});

vi.mock("sonner", () => ({ toast: toasts }));
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      analytics: {
        discover: { artistsForYou: { setData: (_input: undefined, next: Suggestion[]) => api.cache.write(next) } },
      },
    }),
    analytics: {
      discover: {
        artistsForYou: {
          useQuery: () => ({
            data: useSyncExternalStore(api.cache.subscribe, api.cache.read),
            isLoading: false,
            isError: false,
          }),
        },
        passOverArtists: { useMutation: () => api.mutation },
      },
    },
  },
}));

import { useArtistsForYou } from "../useArtistsForYou";

function artist(id: string): Suggestion {
  return { artist: { id, name: id, images: [] }, latestAlbum: null, inLibrary: false };
}

function artists(...ids: string[]): Suggestion[] {
  return ids.map(artist);
}

function ids(items: readonly { artist: { id: string } }[] | undefined): string[] {
  return (items ?? []).map((item) => item.artist.id);
}

beforeEach(() => {
  vi.clearAllMocks();
  api.cache.data = artists("a", "b", "c", "d");
});

describe("swapping suggested artists", () => {
  it("tells the server which artist was dismissed and puts its answer's new artist in that place", async () => {
    api.pass.mockResolvedValueOnce(artists("a", "c", "d", "e"));
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.replace("b"));

    expect(api.pass).toHaveBeenCalledWith({ ids: ["b"] });
    expect(ids(result.current.data)).toEqual(["a", "e", "c", "d"]);
  });

  it("shows after a reload what the server keeps, since nothing is remembered in the browser", async () => {
    api.pass.mockResolvedValueOnce(artists("a", "c", "d", "e"));
    const first = renderHook(() => useArtistsForYou());
    await act(() => first.result.current.replace("b"));
    first.unmount();

    const reloaded = renderHook(() => useArtistsForYou());

    expect(ids(reloaded.result.current.data)).toEqual(["a", "c", "d", "e"]);
  });

  it("drops the place when the server has no other artist", async () => {
    api.pass.mockResolvedValueOnce(artists("a", "c", "d"));
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.replace("b"));

    expect(ids(result.current.data)).toEqual(["a", "c", "d"]);
  });

  it("passes over every artist shown on a reroll and shows the server's next ones", async () => {
    api.pass.mockResolvedValueOnce(artists("e", "f"));
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.reroll());

    expect(api.pass).toHaveBeenCalledWith({ ids: ["a", "b", "c", "d"] });
    expect(ids(result.current.data)).toEqual(["e", "f"]);
  });

  it("keeps each artist in its place when the server answers the same artists in another order", async () => {
    api.pass.mockResolvedValueOnce(artists("a", "c", "d", "e"));
    const { result } = renderHook(() => useArtistsForYou());
    await act(() => result.current.replace("b"));

    act(() => api.cache.write(artists("e", "d", "c", "a")));

    expect(ids(result.current.data)).toEqual(["a", "e", "c", "d"]);
  });

  it("keeps the artists shown when a reroll finds none", async () => {
    api.pass.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.reroll());

    expect(ids(result.current.data)).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps the artists shown and says so when the server fails", async () => {
    api.pass.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useArtistsForYou());

    await act(() => result.current.reroll());

    expect(ids(result.current.data)).toEqual(["a", "b", "c", "d"]);
    expect(toasts.error).toHaveBeenCalledOnce();
    expect(result.current.pending).toEqual([]);
  });

  it("marks only the dismissed artist as loading, and every artist on a reroll", async () => {
    let settle: (value: Suggestion[]) => void = () => {};
    api.pass.mockImplementation(
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
      settle(artists("a", "c", "d", "e"));
      await swap;
    });
    expect(result.current.pending).toEqual([]);

    act(() => {
      swap = result.current.reroll();
    });
    expect(result.current.pending).toEqual(["a", "e", "c", "d"]);
    await act(async () => {
      settle(artists("f"));
      await swap;
    });
    expect(result.current.pending).toEqual([]);
  });

  it("starts no second swap while one is running", async () => {
    let settle: (value: Suggestion[]) => void = () => {};
    api.pass.mockImplementation(
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
    await act(() => result.current.replace("c"));
    await act(async () => {
      settle(artists("a", "c", "d", "e"));
      await swap;
    });

    expect(api.pass).toHaveBeenCalledTimes(1);
  });
});
