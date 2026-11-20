import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface PendingSave {
  name: string;
  resolve: () => void;
  reject: (error: Error) => void;
}

interface PendingRefresh {
  resolve: () => void;
}

const pending = vi.hoisted((): { saves: PendingSave[]; refreshes: PendingRefresh[] } => ({ saves: [], refreshes: [] }));
const invalidatePlaylists = vi.hoisted(() => vi.fn(async () => undefined));
const invalidateDetail = vi.hoisted(() =>
  vi.fn(
    () =>
      new Promise<void>((resolve) => {
        pending.refreshes.push({ resolve });
      })
  )
);
const errorToast = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock("@modules/errors", () => ({ errorToast }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: vi.fn(), info: vi.fn() } }));
vi.mock("@utils/trpc", async () => {
  const { useMutation } = await import("@tanstack/react-query");
  return {
    trpc: {
      useUtils: () => ({
        library: { getPlaylists: { invalidate: invalidatePlaylists } },
        contentDetail: { playlistDetail: { invalidate: invalidateDetail } },
      }),
      playlists: {
        rename: {
          useMutation: (options: object) =>
            useMutation({
              mutationFn: (input: { playlistId: string; name: string }) =>
                new Promise<void>((resolve, reject) => {
                  pending.saves.push({ name: input.name, resolve, reject });
                }),
              ...options,
            }),
        },
      },
    },
  };
});

import { useSavePlaylistName } from "../useSavePlaylistName";

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
  pending.refreshes.length = 0;
});

describe("useSavePlaylistName", () => {
  it("answers only once the playlist has been read again, so the caller never sees the old name after a save", async () => {
    const { result } = renderHook(() => useSavePlaylistName(), { wrapper });
    const saved = vi.fn();

    act(() => {
      void result.current({ playlistId: "pl-1", name: "Night Drive" }).then(saved);
    });
    await flush();
    expect(pending.saves.map((save) => save.name)).toEqual(["Night Drive"]);

    pending.saves[0]?.resolve();
    await flush();

    expect(invalidateDetail).toHaveBeenCalledTimes(1);
    expect(invalidatePlaylists).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();

    pending.refreshes[0]?.resolve();
    await flush();

    expect(saved).toHaveBeenCalledTimes(1);
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("rejects a refused save after telling the user, and still reads the playlist again", async () => {
    const { result } = renderHook(() => useSavePlaylistName(), { wrapper });
    const saved = vi.fn();
    const refused = vi.fn();

    act(() => {
      void result.current({ playlistId: "pl-1", name: "Night Drive" }).then(saved, refused);
    });
    await flush();
    pending.saves[0]?.reject(new Error("taken"));
    await flush();
    pending.refreshes[0]?.resolve();
    await flush();

    expect(refused).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledTimes(1);
    expect(errorToast.mock.calls[0]?.[1]).toBe("playlists.renameFailed");
    expect(invalidateDetail).toHaveBeenCalledTimes(1);
  });
});
