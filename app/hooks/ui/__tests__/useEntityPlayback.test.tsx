import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enPlayer from "@modules/i18n/messages/en/player.json";

interface PlayableResult {
  items: { id: string }[];
  truncated: boolean;
}

const api = vi.hoisted(() => ({
  fetchPlayable: vi.fn(async (): Promise<PlayableResult> => ({ items: [], truncated: false })),
}));

vi.mock("@hooks/api", () => ({ usePlayableTracksFetcher: () => api.fetchPlayable }));

const player = vi.hoisted(() => ({
  playQueue: vi.fn(),
  addToQueue: vi.fn(() => ({ added: 1, skipped: 0, full: false })),
  startStation: vi.fn(async () => undefined),
}));

vi.mock("@hooks/ui/player", () => ({
  playerActions: { playQueue: player.playQueue, addToQueue: player.addToQueue },
  playerTrackFrom: (item: { id: string }) => ({ id: item.id, title: `Title ${item.id}` }),
  useStartRadio: () => player.startStation,
}));

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn(), success: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

import { useEntityPlayback } from "../useEntityPlayback";

const TARGET = { kind: "album", albumExternalId: "album-1" } as const;

beforeEach(() => {
  vi.clearAllMocks();
  api.fetchPlayable.mockResolvedValue({ items: [{ id: "t1" }, { id: "t2" }], truncated: false });
  player.addToQueue.mockReturnValue({ added: 1, skipped: 0, full: false });
});

describe("playing a whole album or playlist", () => {
  it("fetches its tracks and plays them from the top", async () => {
    const { result } = renderHook(() => useEntityPlayback());

    await result.current.playEntity(TARGET);

    expect(api.fetchPlayable).toHaveBeenCalledWith(TARGET);
    expect(player.playQueue).toHaveBeenCalledWith(
      [expect.objectContaining({ id: "t1" }), expect.objectContaining({ id: "t2" })],
      0
    );
  });

  it("says so rather than starting an empty queue when nothing in it can be played", async () => {
    api.fetchPlayable.mockResolvedValue({ items: [], truncated: false });
    const { result } = renderHook(() => useEntityPlayback());

    await result.current.playEntity(TARGET);

    expect(toast.info).toHaveBeenCalledWith(enPlayer.queue.nothingPlayable);
    expect(player.playQueue).not.toHaveBeenCalled();
  });

  it("warns that only part of it fitted", async () => {
    api.fetchPlayable.mockResolvedValue({ items: [{ id: "t1" }], truncated: true });
    const { result } = renderHook(() => useEntityPlayback());

    await result.current.playEntity(TARGET);

    expect(toast.info).toHaveBeenCalledWith(enPlayer.queue.truncated.replace("{{count}}", "1"));
    expect(player.playQueue).toHaveBeenCalled();
  });

  it("reports a fetch that failed rather than leaving the press silent", async () => {
    api.fetchPlayable.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useEntityPlayback());

    await result.current.playEntity(TARGET);

    expect(toast.error).toHaveBeenCalledWith(enPlayer.queue.loadFailed);
    expect(player.playQueue).not.toHaveBeenCalled();
  });

  it("ignores a second press while the first is still fetching", async () => {
    const waiting: ((value: PlayableResult) => void)[] = [];
    api.fetchPlayable.mockImplementation(
      () =>
        new Promise<PlayableResult>((resolve) => {
          waiting.push(resolve);
        })
    );
    const { result } = renderHook(() => useEntityPlayback());

    const first = result.current.playEntity(TARGET);
    const second = result.current.playEntity(TARGET);
    waiting.forEach((resolve) => resolve({ items: [{ id: "t1" }], truncated: false }));
    await Promise.all([first, second]);

    expect(api.fetchPlayable).toHaveBeenCalledTimes(1);
  });

  it("still takes a press for a different album while one is in flight", async () => {
    const waiting: ((value: PlayableResult) => void)[] = [];
    api.fetchPlayable.mockImplementation(
      () =>
        new Promise<PlayableResult>((resolve) => {
          waiting.push(resolve);
        })
    );
    const { result } = renderHook(() => useEntityPlayback());

    const first = result.current.playEntity(TARGET);
    const other = result.current.playEntity({ kind: "album", albumExternalId: "album-2" });
    waiting.forEach((resolve) => resolve({ items: [{ id: "t1" }], truncated: false }));
    await Promise.all([first, other]);

    expect(api.fetchPlayable).toHaveBeenCalledTimes(2);
  });
});

describe("adding a whole album or playlist to the queue", () => {
  it("adds its tracks and says how many went in", async () => {
    player.addToQueue.mockReturnValue({ added: 2, skipped: 0, full: false });
    const { result } = renderHook(() => useEntityPlayback());

    await expect(result.current.enqueueEntity(TARGET)).resolves.toBe(true);

    expect(toast.success).toHaveBeenCalledWith(enPlayer.queue.added_other.replace("{{count}}", "2"));
  });

  it("says the queue is full rather than silently dropping the tracks", async () => {
    player.addToQueue.mockReturnValue({ added: 0, skipped: 2, full: true });
    const { result } = renderHook(() => useEntityPlayback());

    await expect(result.current.enqueueEntity(TARGET)).resolves.toBe(false);

    expect(toast.info).toHaveBeenCalledWith(enPlayer.queue.full);
  });

  it("says nothing was added when the queue already held every track", async () => {
    player.addToQueue.mockReturnValue({ added: 0, skipped: 2, full: false });
    const { result } = renderHook(() => useEntityPlayback());

    await expect(result.current.enqueueEntity(TARGET)).resolves.toBe(false);

    expect(toast.info).toHaveBeenCalledWith(enPlayer.queue.nothingAdded);
  });

  it("adds nothing when the album holds nothing playable", async () => {
    api.fetchPlayable.mockResolvedValue({ items: [], truncated: false });
    const { result } = renderHook(() => useEntityPlayback());

    await expect(result.current.enqueueEntity(TARGET)).resolves.toBe(false);

    expect(player.addToQueue).not.toHaveBeenCalled();
  });
});

describe("starting a radio from an album, artist or playlist", () => {
  it("hands the target to the station starter with no seed track, since the station itself leads", async () => {
    const { result } = renderHook(() => useEntityPlayback());

    await result.current.startRadio(TARGET);

    expect(player.startStation).toHaveBeenCalledWith(TARGET, null);
    expect(api.fetchPlayable).not.toHaveBeenCalled();
  });
});
