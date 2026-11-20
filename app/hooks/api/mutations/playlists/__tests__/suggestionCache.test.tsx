import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SUGGESTION_SEED_KEY } from "@hooks/api/queries/playlist-suggestions/constants";
import { usePlaylistSuggestionGone } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionGone";
import { usePlaylistSuggestionSeed } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionSeed";

interface PendingCall {
  procedure: string;
  input: unknown;
  resolve: (value?: unknown) => void;
  reject: (error: Error) => void;
}

const pending = vi.hoisted((): { calls: PendingCall[] } => ({ calls: [] }));
const errorToast = vi.hoisted(() => vi.fn());
const invalidate = vi.hoisted(() => vi.fn(async () => undefined));
const requestTrack = vi.hoisted(() => vi.fn());

vi.mock("@modules/errors", () => ({ errorToast }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("../../requests/useRequest", () => ({ useRequest: () => ({ mutateAsync: requestTrack }) }));
vi.mock("@utils/trpc", async () => {
  const { useMutation } = await import("@tanstack/react-query");
  const held = (procedure: string) => ({
    useMutation: (options: object) =>
      useMutation({
        mutationFn: (input: unknown) =>
          new Promise((resolve, reject) => {
            pending.calls.push({ procedure, input, resolve, reject });
          }),
        ...options,
      }),
  });
  return {
    trpc: {
      useUtils: () => ({
        contentDetail: { playlistDetail: { invalidate } },
        library: { getPlaylists: { invalidate } },
      }),
      playlists: {
        hideSuggestion: held("hide"),
        setSuggestionYears: held("years"),
        addTracks: held("link"),
      },
    },
  };
});

import { useAddSuggestedTrack } from "../useAddSuggestedTrack";
import { useHidePlaylistSuggestion } from "../useHidePlaylistSuggestion";
import { useSetPlaylistSuggestionYears } from "../useSetPlaylistSuggestionYears";

const KEY = { playlistId: "pl-1", seed: 7 };

function harness() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, wrapper };
}

function call(procedure: string, position = 0): PendingCall {
  const found = pending.calls.filter((entry) => entry.procedure === procedure)[position];
  if (found === undefined) throw new Error(`no ${procedure} call at ${position}`);
  return found;
}

const SETTLE_TICKS = 4;

async function settle() {
  await act(async () => {
    for (let tick = 0; tick < SETTLE_TICKS; tick += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });
}

function suggestion(externalId: string, requestId: string | null) {
  return {
    externalId,
    title: `Song ${externalId}`,
    artist: "Artist",
    durationMs: 1000,
    trackNumber: 1,
    isrc: null,
    album: { externalId: "album-1" },
    requestId,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  pending.calls.length = 0;
});

describe("hiding a suggestion", () => {
  it("takes the row out at once and, when hiding fails, gives back that row only", async () => {
    const { wrapper } = harness();
    const { result } = renderHook(
      () => ({ hide: useHidePlaylistSuggestion(KEY), gone: usePlaylistSuggestionGone(KEY).gone }),
      { wrapper }
    );

    act(() => result.current.hide.mutate({ playlistId: "pl-1", externalId: "a" }));
    await settle();
    act(() => result.current.hide.mutate({ playlistId: "pl-1", externalId: "b" }));
    await settle();
    expect([...result.current.gone]).toEqual(["a", "b"]);

    call("hide", 1).resolve();
    call("hide", 0).reject(new Error("down"));
    await settle();

    expect(errorToast).toHaveBeenCalledWith(expect.any(Error), "playlists.suggestionHideFailed");
    expect([...result.current.gone]).toEqual(["b"]);
  });

  it("keeps the rows taken out of one batch out of another batch's list", async () => {
    const { wrapper } = harness();
    const { result } = renderHook(
      () => ({
        hide: useHidePlaylistSuggestion(KEY),
        other: usePlaylistSuggestionGone({ playlistId: "pl-1", seed: 8 }).gone,
      }),
      { wrapper }
    );

    act(() => result.current.hide.mutate({ playlistId: "pl-1", externalId: "a" }));
    await settle();

    expect([...result.current.other]).toEqual([]);
  });
});

describe("adding a suggestion", () => {
  it("takes the row out of the list once the track is linked", async () => {
    const { wrapper } = harness();
    const { result } = renderHook(
      () => ({ adding: useAddSuggestedTrack(KEY), gone: usePlaylistSuggestionGone(KEY).gone }),
      { wrapper }
    );

    let added: Promise<boolean> | null = null;
    act(() => {
      added = result.current.adding.add(suggestion("a", "req-a"));
    });
    await settle();
    expect([...result.current.gone]).toEqual([]);

    call("link").resolve();
    await settle();

    await expect(added).resolves.toBe(true);
    expect(call("link").input).toEqual({ playlistId: "pl-1", trackIds: ["req-a"] });
    expect([...result.current.gone]).toEqual(["a"]);
  });

  it("leaves the row in the list when linking fails", async () => {
    const { wrapper } = harness();
    const { result } = renderHook(
      () => ({ adding: useAddSuggestedTrack(KEY), gone: usePlaylistSuggestionGone(KEY).gone }),
      { wrapper }
    );

    let added: Promise<boolean> | null = null;
    act(() => {
      added = result.current.adding.add(suggestion("a", "req-a"));
    });
    await settle();
    call("link").reject(new Error("down"));
    await settle();

    await expect(added).resolves.toBe(false);
    expect([...result.current.gone]).toEqual([]);
  });
});

describe("saving the years of a playlist's suggestions", () => {
  it("asks for a new batch once the years are saved, even after the screen that asked is gone", async () => {
    const { client, wrapper } = harness();
    const watcher = renderHook(() => usePlaylistSuggestionSeed("pl-1"), { wrapper });
    const before = watcher.result.current.seed;
    const asking = renderHook(() => useSetPlaylistSuggestionYears("pl-1"), { wrapper });

    act(() => asking.result.current.mutate({ playlistId: "pl-1", from: 1990, to: null }));
    await settle();
    asking.unmount();
    expect(client.getQueryData([SUGGESTION_SEED_KEY, "pl-1"])).toBe(before);

    call("years").resolve();
    await settle();

    expect(client.getQueryData([SUGGESTION_SEED_KEY, "pl-1"])).not.toBe(before);
    expect(watcher.result.current.seed).not.toBe(before);
  });

  it("keeps the batch and says so when the years could not be saved", async () => {
    const { client, wrapper } = harness();
    const watcher = renderHook(() => usePlaylistSuggestionSeed("pl-1"), { wrapper });
    const before = watcher.result.current.seed;
    const asking = renderHook(() => useSetPlaylistSuggestionYears("pl-1"), { wrapper });

    act(() => asking.result.current.mutate({ playlistId: "pl-1", from: 1990, to: null }));
    await settle();
    call("years").reject(new Error("down"));
    await settle();

    expect(client.getQueryData([SUGGESTION_SEED_KEY, "pl-1"])).toBe(before);
    expect(errorToast).toHaveBeenCalledWith(expect.any(Error), "playlists.suggestionYearsFailed");
  });

  it("asks for a new batch of that playlist only", async () => {
    const { client, wrapper } = harness();
    const other = renderHook(() => usePlaylistSuggestionSeed("pl-2"), { wrapper });
    const otherBefore = other.result.current.seed;
    const asking = renderHook(() => useSetPlaylistSuggestionYears("pl-1"), { wrapper });

    act(() => asking.result.current.mutate({ playlistId: "pl-1", from: null, to: 2005 }));
    await settle();
    call("years").resolve();
    await settle();

    expect(client.getQueryData([SUGGESTION_SEED_KEY, "pl-2"])).toBe(otherBefore);
  });
});
