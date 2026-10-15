import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionEventType } from "@api/__generated__/types";

const api = vi.hoisted(() => ({
  fetchPlayable: vi.fn(async (input: { trackIds: string[] }) => ({
    items: input.trackIds.map((id) => ({ id })),
    truncated: false,
  })),
}));

const store = vi.hoisted(() => ({
  actions: {
    addToQueue: vi.fn(),
    playNext: vi.fn(),
    removeTrackFromQueue: vi.fn(),
    clearQueue: vi.fn(),
    moveUpcoming: vi.fn(),
    playQueue: vi.fn(),
    playShuffled: vi.fn(),
  },
}));

const handlers = vi.hoisted(() => ({ current: null as ((command: unknown) => void) | null }));

vi.mock("@hooks/api", () => ({ usePlayableTracksFetcher: () => api.fetchPlayable }));
vi.mock("../store", () => store);
vi.mock("../helpers", () => ({
  playerTrackFrom: (item: { id: string }) => ({ id: item.id, title: `Title ${item.id}` }),
}));
vi.mock("../commands", () => ({
  setQueueCommandHandler: (handler: ((command: unknown) => void) | null) => {
    handlers.current = handler;
  },
}));

import { useRemoteQueueCommands } from "../useRemoteQueueCommands";

const base = { eventType: SubscriptionEventType.PlayerCommand, userId: "u1", deviceId: "mine", issuedAt: 1 };

function send(command: Record<string, unknown>): void {
  handlers.current?.({ ...base, ...command });
}

beforeEach(() => {
  vi.clearAllMocks();
  handlers.current = null;
});

describe("useRemoteQueueCommands", () => {
  it("fetches the added tracks and plays them next or adds them at the end, as asked", async () => {
    renderHook(() => useRemoteQueueCommands());

    send({ command: "queueAdd", trackIds: ["t1"], placement: "next" });
    send({ command: "queueAdd", trackIds: ["t2"], placement: "end" });

    await waitFor(() => expect(store.actions.addToQueue).toHaveBeenCalled());
    expect(api.fetchPlayable).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["t1"] });
    expect(store.actions.playNext).toHaveBeenCalledWith([{ id: "t1", title: "Title t1" }]);
    expect(store.actions.addToQueue).toHaveBeenCalledWith([{ id: "t2", title: "Title t2" }]);
  });

  it("removes, clears and moves without fetching anything", () => {
    renderHook(() => useRemoteQueueCommands());

    send({ command: "queueRemove", trackIds: ["a", "b"] });
    send({ command: "queueClear" });
    send({ command: "queueMove", trackId: "c", toPosition: 2 });

    expect(store.actions.removeTrackFromQueue.mock.calls).toEqual([["a"], ["b"]]);
    expect(store.actions.clearQueue).toHaveBeenCalledTimes(1);
    expect(store.actions.moveUpcoming).toHaveBeenCalledWith("c", 2);
    expect(api.fetchPlayable).not.toHaveBeenCalled();
  });

  it("plays shuffled when asked, and in order from the start it was given otherwise", async () => {
    renderHook(() => useRemoteQueueCommands());

    send({ command: "queuePlay", trackIds: ["a", "b", "c"], startIndex: 5, shuffle: false });
    send({ command: "queuePlay", trackIds: ["d"], startIndex: 0, shuffle: true });

    await waitFor(() => expect(store.actions.playShuffled).toHaveBeenCalled());
    expect(store.actions.playQueue).toHaveBeenCalledWith(
      [
        { id: "a", title: "Title a" },
        { id: "b", title: "Title b" },
        { id: "c", title: "Title c" },
      ],
      2
    );
    expect(store.actions.playShuffled).toHaveBeenCalledWith([{ id: "d", title: "Title d" }]);
  });

  it("lets go of the handler when it unmounts", () => {
    const { unmount } = renderHook(() => useRemoteQueueCommands());
    expect(handlers.current).not.toBeNull();

    unmount();

    expect(handlers.current).toBeNull();
  });
});
