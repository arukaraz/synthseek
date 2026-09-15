import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_SAVE_INTERVAL_MS } from "../constants";
import type { PlayerSessionState, SessionSnapshot } from "../types";

interface SavedTrack {
  id: string;
  title: string;
  artist: string;
  albumName: string;
  album_id: string;
  albumArt: string | null;
  duration_ms: number;
  format: string;
  file_format: string | null;
  bitrate: number;
  file_bitrate: number | null;
  playable: boolean;
}

interface SavedSession {
  tracks: SavedTrack[];
  currentTrackId: string | null;
  positionMs: number;
  resumedFrom: string | null;
}

const api = vi.hoisted(() => ({
  session: null as SavedSession | null | undefined,
  refetch: vi.fn(async () => ({ data: null as SavedSession | null })),
  save: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  usePlaybackSession: () => ({ data: api.session, refetch: api.refetch }),
  useSavePlaybackSession: () => ({ mutate: api.save }),
}));

const commands = vi.hoisted(() => ({
  takeOver: null as (() => void) | null,
  unknownTrack: null as ((trackId: string) => void) | null,
}));

vi.mock("../commands", () => ({
  setTakeOverHandler: (handler: (() => void) | null) => {
    commands.takeOver = handler;
  },
  setUnknownTrackHandler: (handler: ((trackId: string) => void) | null) => {
    commands.unknownTrack = handler;
  },
}));

const store = vi.hoisted(() => ({
  listeners: new Set<() => void>(),
  snapshot: sessionState(),
  snapshotOf: { trackIds: [] as string[], currentTrackId: null as string | null, positionMs: 0 },
  restoreSession: vi.fn(),
  takeOver: vi.fn(),
  adoptQueue: vi.fn(),
  playHere: vi.fn(() => false),
}));

vi.mock("../store", () => ({
  actions: {
    restoreSession: store.restoreSession,
    takeOver: store.takeOver,
    adoptQueue: store.adoptQueue,
    playHere: store.playHere,
  },
  getSnapshot: () => store.snapshot,
  sessionSnapshot: (): SessionSnapshot => ({ ...store.snapshotOf, trackIds: [...store.snapshotOf.trackIds] }),
  subscribe: (listener: () => void) => {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },
}));

import { usePlayerSessionSync } from "../useSessionSync";

function savedTrack(id: string, overrides: Partial<SavedTrack> = {}): SavedTrack {
  return {
    id,
    title: `Title ${id}`,
    artist: "Air",
    albumName: "Moon Safari",
    album_id: `album-${id}`,
    albumArt: null,
    duration_ms: 200_000,
    format: "mp3",
    file_format: null,
    bitrate: 320,
    file_bitrate: null,
    playable: true,
    ...overrides,
  };
}

function sessionState(overrides: Partial<PlayerSessionState> = {}): PlayerSessionState {
  return {
    queue: [],
    index: 0,
    playing: false,
    loading: false,
    positionSeconds: 0,
    durationSeconds: 0,
    scrubSeconds: null,
    volume: 0.8,
    muted: false,
    shuffle: false,
    shuffleOrder: [],
    repeat: "off",
    transcoding: false,
    armed: false,
    remote: null,
    offsetSeconds: 0,
    chainVisible: false,
    moreOpen: false,
    devicesOpen: false,
    modesOpen: false,
    queueOpen: false,
    mode: "normal",
    lyricsOpen: false,
    fullscreen: false,
    consecutiveFailures: 0,
    started: true,
    ...overrides,
  };
}

function publish(): void {
  store.listeners.forEach((listener) => listener());
}

beforeEach(() => {
  vi.clearAllMocks();
  store.listeners.clear();
  store.snapshot = sessionState();
  store.snapshotOf = { trackIds: [], currentTrackId: null, positionMs: 0 };
  store.playHere.mockReturnValue(false);
  api.session = null;
  api.refetch.mockResolvedValue({ data: null });
  commands.takeOver = null;
  commands.unknownTrack = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("restoring the saved session", () => {
  it("arms the queue the listener left behind", () => {
    api.session = {
      tracks: [savedTrack("a"), savedTrack("b")],
      currentTrackId: "b",
      positionMs: 45_000,
      resumedFrom: null,
    };

    renderHook(() => usePlayerSessionSync());

    expect(store.restoreSession).toHaveBeenCalledWith(
      [expect.objectContaining({ id: "a" }), expect.objectContaining({ id: "b" })],
      "b",
      45,
      null
    );
  });

  it("leaves out a track the library can no longer play", () => {
    api.session = {
      tracks: [savedTrack("a"), savedTrack("gone", { playable: false })],
      currentTrackId: "a",
      positionMs: 0,
      resumedFrom: null,
    };

    renderHook(() => usePlayerSessionSync());

    expect(store.restoreSession.mock.calls[0]?.[0]).toHaveLength(1);
  });

  it("names the device the session was handed on from", () => {
    api.session = { tracks: [savedTrack("a")], currentTrackId: "a", positionMs: 0, resumedFrom: "Kitchen" };

    renderHook(() => usePlayerSessionSync());

    expect(store.restoreSession).toHaveBeenCalledWith(expect.anything(), "a", 0, "Kitchen");
  });

  it("does nothing while the saved session is still being fetched", () => {
    api.session = undefined;

    renderHook(() => usePlayerSessionSync());

    expect(store.restoreSession).not.toHaveBeenCalled();
  });

  it("does nothing when there is no saved session", () => {
    api.session = null;

    renderHook(() => usePlayerSessionSync());

    expect(store.restoreSession).not.toHaveBeenCalled();
  });

  it("restores once, however often the query re-reports the same data", () => {
    api.session = { tracks: [savedTrack("a")], currentTrackId: "a", positionMs: 0, resumedFrom: null };

    const { rerender } = renderHook(() => usePlayerSessionSync());
    api.session = { tracks: [savedTrack("b")], currentTrackId: "b", positionMs: 0, resumedFrom: null };
    rerender();

    expect(store.restoreSession).toHaveBeenCalledTimes(1);
  });
});

describe("taking the sound over from another device", () => {
  it("plays what is already in this queue rather than fetching it again", async () => {
    renderHook(() => usePlayerSessionSync());
    store.playHere.mockReturnValue(true);

    commands.takeOver?.();

    expect(api.refetch).not.toHaveBeenCalled();
    expect(store.takeOver).not.toHaveBeenCalled();
  });

  it("fetches the handed-over queue when this player does not hold it", async () => {
    api.refetch.mockResolvedValue({
      data: { tracks: [savedTrack("a"), savedTrack("b")], currentTrackId: "b", positionMs: 30_000, resumedFrom: null },
    });
    renderHook(() => usePlayerSessionSync());

    commands.takeOver?.();

    await vi.waitFor(() =>
      expect(store.takeOver).toHaveBeenCalledWith(
        [expect.objectContaining({ id: "a" }), expect.objectContaining({ id: "b" })],
        "b",
        30
      )
    );
  });

  it("stays put when the hand-over fetch comes back empty", async () => {
    api.refetch.mockResolvedValue({ data: null });
    renderHook(() => usePlayerSessionSync());

    commands.takeOver?.();

    await vi.waitFor(() => expect(api.refetch).toHaveBeenCalled());
    expect(store.takeOver).not.toHaveBeenCalled();
  });

  it("lets go of the handler when the player unmounts", () => {
    const { unmount } = renderHook(() => usePlayerSessionSync());

    unmount();

    expect(commands.takeOver).toBeNull();
  });
});

describe("adopting a queue another device announced", () => {
  it("says nothing when the track is already in this queue", () => {
    store.snapshot = sessionState({
      queue: [
        {
          id: "a",
          title: "a",
          artist: "Air",
          album: "Moon Safari",
          durationSeconds: 200,
          format: "mp3",
          bitrateKbps: 320,
          lossless: false,
          tone: "primary",
          artworkUrl: null,
        },
      ],
    });
    renderHook(() => usePlayerSessionSync());

    commands.unknownTrack?.("a");

    expect(api.refetch).not.toHaveBeenCalled();
  });

  it("fetches and adopts the shared queue for a track it has never seen", async () => {
    api.refetch.mockResolvedValue({
      data: { tracks: [savedTrack("x")], currentTrackId: "x", positionMs: 0, resumedFrom: null },
    });
    renderHook(() => usePlayerSessionSync());

    commands.unknownTrack?.("x");

    await vi.waitFor(() => expect(store.adoptQueue).toHaveBeenCalledWith([expect.objectContaining({ id: "x" })], "x"));
  });

  it("stays put when the shared queue comes back empty", async () => {
    api.refetch.mockResolvedValue({ data: null });
    renderHook(() => usePlayerSessionSync());

    commands.unknownTrack?.("x");

    await vi.waitFor(() => expect(api.refetch).toHaveBeenCalled());
    expect(store.adoptQueue).not.toHaveBeenCalled();
  });

  it("lets go of the handler when the player unmounts", () => {
    const { unmount } = renderHook(() => usePlayerSessionSync());

    unmount();

    expect(commands.unknownTrack).toBeNull();
  });
});

describe("saving the session as it moves", () => {
  it("saves the queue the first time it holds anything", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a", "b"], currentTrackId: "a", positionMs: 0 };

    publish();

    expect(api.save).toHaveBeenCalledWith({ trackIds: ["a", "b"], currentTrackId: "a", positionMs: 0 });
  });

  it("saves nothing before the player has started", () => {
    store.snapshot = sessionState({ started: false });
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };

    publish();

    expect(api.save).not.toHaveBeenCalled();
  });

  it("saves nothing while another device holds the sound, whose session is the one that counts", () => {
    store.snapshot = sessionState({
      remote: {
        deviceId: "kitchen",
        deviceName: "Kitchen",
        confirmed: true,
        playing: true,
        track: null,
        positionSeconds: 0,
        shuffle: false,
        repeat: "off",
        volume: 1,
        muted: false,
        transcoding: false,
        updatedAt: Date.now(),
      },
    });
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };

    publish();

    expect(api.save).not.toHaveBeenCalled();
  });

  it("never saves an empty queue over a good one", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: [], currentTrackId: null, positionMs: 0 };

    publish();

    expect(api.save).not.toHaveBeenCalled();
  });

  it("saves nothing when neither the queue nor the position has moved", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();

    publish();

    expect(api.save).not.toHaveBeenCalled();
  });

  it("holds back a position that merely drifted on, so playing a track is not a stream of writes", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();

    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 60_000 };
    publish();

    expect(api.save).not.toHaveBeenCalled();
  });

  it("saves a changed queue straight away rather than waiting out the interval", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();

    store.snapshotOf = { trackIds: ["a", "b"], currentTrackId: "a", positionMs: 0 };
    publish();

    expect(api.save).toHaveBeenCalledWith({ trackIds: ["a", "b"], currentTrackId: "a", positionMs: 0 });
  });

  it("saves the drifted position again once the interval has passed", () => {
    vi.useFakeTimers();
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();

    vi.advanceTimersByTime(SESSION_SAVE_INTERVAL_MS + 1);
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 60_000 };
    publish();

    expect(api.save).toHaveBeenCalled();
  });

  it("saves on the way out, whatever the interval says", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 60_000 };

    window.dispatchEvent(new Event("pagehide"));

    expect(api.save).toHaveBeenCalled();
  });

  it("saves when the tab is hidden, which on a phone is the last moment it gets", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 60_000 };
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(api.save).toHaveBeenCalled();
  });

  it("does not save merely because the tab came back into view", () => {
    renderHook(() => usePlayerSessionSync());
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    api.save.mockClear();
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 60_000 };
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(api.save).not.toHaveBeenCalled();
  });

  it("stops listening once the player unmounts", () => {
    const { unmount } = renderHook(() => usePlayerSessionSync());

    unmount();
    store.snapshotOf = { trackIds: ["a"], currentTrackId: "a", positionMs: 0 };
    publish();
    window.dispatchEvent(new Event("pagehide"));

    expect(api.save).not.toHaveBeenCalled();
    expect(store.listeners.size).toBe(0);
  });
});
