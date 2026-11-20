import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface PendingSave {
  trackIds: string[];
  resolve: () => void;
  reject: (error: Error) => void;
}

const pending = vi.hoisted((): { saves: PendingSave[] } => ({ saves: [] }));
const invalidatePlaylists = vi.hoisted(() => vi.fn(async () => undefined));
const invalidateDetail = vi.hoisted(() => vi.fn(async () => undefined));
const errorToast = vi.hoisted(() => vi.fn());

vi.mock("@modules/errors", () => ({ errorToast }));
vi.mock("@utils/trpc", async () => {
  const { useMutation } = await import("@tanstack/react-query");
  return {
    trpc: {
      useUtils: () => ({
        library: { getPlaylists: { invalidate: invalidatePlaylists } },
        contentDetail: { playlistDetail: { invalidate: invalidateDetail } },
      }),
      playlists: {
        reorderTracks: {
          useMutation: (options: object) =>
            useMutation({
              mutationFn: (input: { playlistId: string; trackIds: string[] }) =>
                new Promise<void>((resolve, reject) => {
                  pending.saves.push({ trackIds: input.trackIds, resolve, reject });
                }),
              ...options,
            }),
        },
      },
    },
  };
});

import { useReorderPlaylistTracks } from "../useReorderPlaylistTracks";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  pending.saves.length = 0;
});

describe("useReorderPlaylistTracks", () => {
  it("tells each caller when its own save has settled, even when a newer save started meanwhile", async () => {
    const { result } = renderHook(() => useReorderPlaylistTracks(), { wrapper });
    const settled: string[] = [];

    act(() => {
      void result.current({ playlistId: "pl-1", trackIds: ["b", "a"] }).then(() => settled.push("first"));
    });
    await flush();
    act(() => {
      void result.current({ playlistId: "pl-1", trackIds: ["a", "b"] }).then(() => settled.push("second"));
    });
    await flush();
    expect(pending.saves).toHaveLength(2);

    pending.saves[0]?.resolve();
    await flush();
    expect(settled).toEqual(["first"]);

    pending.saves[1]?.resolve();
    await flush();
    expect(settled).toEqual(["first", "second"]);
  });

  it("settles a refused save too, after telling the user", async () => {
    const { result } = renderHook(() => useReorderPlaylistTracks(), { wrapper });
    const settled = vi.fn();

    act(() => {
      void result.current({ playlistId: "pl-1", trackIds: ["b", "a"] }).then(settled);
    });
    await flush();
    pending.saves[0]?.reject(new Error("stale"));
    await flush();

    expect(settled).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledTimes(1);
  });

  it("refreshes the playlist and the library's playlist cards once a save settles", async () => {
    const { result } = renderHook(() => useReorderPlaylistTracks(), { wrapper });

    act(() => {
      void result.current({ playlistId: "pl-1", trackIds: ["b", "a"] });
    });
    await flush();
    pending.saves[0]?.resolve();
    await flush();

    expect(invalidateDetail).toHaveBeenCalledTimes(1);
    expect(invalidatePlaylists).toHaveBeenCalledTimes(1);
  });
});
