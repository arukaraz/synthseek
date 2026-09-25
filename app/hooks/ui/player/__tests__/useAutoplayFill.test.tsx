import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { AUTOPLAY_BATCH } from "../constants";
import type { PlayerSessionState } from "../types";

const api = vi.hoisted(() => ({ fetchRadio: vi.fn() }));
vi.mock("@hooks/api", () => ({ useRadioTracksFetcher: () => api.fetchRadio }));

const store = vi.hoisted(() => ({
  listeners: new Set<() => void>(),
  snapshot: null as PlayerSessionState | null,
  appendAutoplay: vi.fn((tracks: PlayerTrack[]) => ({ added: tracks.length, skipped: 0, full: false })),
}));

vi.mock("../store", () => ({
  actions: { appendAutoplay: store.appendAutoplay },
  getSnapshot: () => store.snapshot,
  subscribe: (listener: () => void) => {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },
}));

import { useAutoplayFill } from "../useAutoplayFill";

function track(id: string): PlayerTrack {
  return {
    id,
    title: `Title ${id}`,
    artist: "Band",
    album: "Record",
    durationSeconds: 200,
    format: "mp3",
    bitrateKbps: 320,
    lossless: false,
    tone: "primary",
    artworkUrl: null,
    albumId: "album-1",
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    sources: [],
  };
}

function libraryItem(id: string) {
  return {
    id,
    title: `Title ${id}`,
    artist: "Band",
    albumName: "Record",
    album_id: "album-1",
    albumArt: null,
    duration_ms: 200_000,
    format: "mp3",
    file_format: null,
    bitrate: 320,
    file_bitrate: null,
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    sources: [],
  };
}

function sessionState(overrides: Partial<PlayerSessionState> = {}): PlayerSessionState {
  return {
    queue: [track("a")],
    index: 0,
    playing: true,
    loading: false,
    positionSeconds: 10,
    durationSeconds: 200,
    scrubSeconds: null,
    volume: 0.8,
    muted: false,
    shuffle: false,
    shuffleOrder: [],
    repeat: "off",
    transcoding: false,
    armed: true,
    remote: null,
    offsetSeconds: 0,
    chainVisible: false,
    devicesOpen: false,
    settingsOpen: false,
    autoplay: true,
    autoplayIds: new Set<string>(),
    equalizer: { enabled: false, gainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preampDb: 0 },
    equalizerPresets: [],
    compressor: { enabled: false, thresholdDb: -24, ratio: 4, attackMs: 20, releaseMs: 300, kneeDb: 3 },
    conversion: { enabled: false, bitrateKbps: 192 },
    transition: { mode: "gapless", seconds: 5, curve: "equalPower" },
    modesOpen: false,
    queueOpen: false,
    mode: "normal",
    lyricsOpen: false,
    fullscreen: false,
    consecutiveFailures: 0,
    started: true,
    sourceChoice: null,
    failedSources: null,
    ...overrides,
  };
}

function publish(overrides: Partial<PlayerSessionState> = {}): void {
  store.snapshot = sessionState(overrides);
  store.listeners.forEach((listener) => listener());
}

function settled(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  vi.clearAllMocks();
  store.listeners.clear();
  store.snapshot = sessionState();
  api.fetchRadio.mockResolvedValue({ items: [libraryItem("r1"), libraryItem("r2")] });
  store.appendAutoplay.mockReturnValue({ added: 2, skipped: 0, full: false });
});

describe("useAutoplayFill", () => {
  it("asks the radio for a batch seeded from the queue, excluding everything already in it", async () => {
    renderHook(() => useAutoplayFill());

    publish({ queue: [track("a"), track("b")], index: 1 });

    await vi.waitFor(() => expect(store.appendAutoplay).toHaveBeenCalledTimes(1));
    expect(api.fetchRadio).toHaveBeenCalledWith({
      seed: { kind: "tracks", trackIds: ["b", "a"] },
      excludeTrackIds: ["a", "b"],
      count: AUTOPLAY_BATCH,
    });
    expect(store.appendAutoplay.mock.calls[0]?.[0]?.map((entry) => entry.id)).toEqual(["r1", "r2"]);
  });

  it("stays quiet while autoplay is off, another device has the sound, or repeat is on", async () => {
    renderHook(() => useAutoplayFill());

    publish({ autoplay: false });
    publish({ repeat: "all" });
    publish({
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

    await Promise.resolve();
    expect(api.fetchRadio).not.toHaveBeenCalled();
  });

  it("waits while enough tracks are still queued", async () => {
    renderHook(() => useAutoplayFill());

    publish({ queue: [track("a"), track("b"), track("c"), track("d")], index: 0 });

    await Promise.resolve();
    expect(api.fetchRadio).not.toHaveBeenCalled();
  });

  it("keeps a single request in flight however many ticks arrive", async () => {
    let settle: (value: { items: ReturnType<typeof libraryItem>[] }) => void = () => undefined;
    api.fetchRadio.mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      })
    );
    renderHook(() => useAutoplayFill());

    publish();
    publish({ positionSeconds: 20 });
    publish({ positionSeconds: 30 });

    expect(api.fetchRadio).toHaveBeenCalledTimes(1);
    settle({ items: [libraryItem("r1")] });
    await vi.waitFor(() => expect(store.appendAutoplay).toHaveBeenCalledTimes(1));
  });

  it("does not ask again for the same spot after an empty answer, and asks once the queue moves on", async () => {
    api.fetchRadio.mockResolvedValue({ items: [] });
    renderHook(() => useAutoplayFill());

    publish();
    await settled();
    publish({ positionSeconds: 50 });
    await settled();
    expect(api.fetchRadio).toHaveBeenCalledTimes(1);

    publish({ queue: [track("a"), track("b")], index: 1 });

    await vi.waitFor(() => expect(api.fetchRadio).toHaveBeenCalledTimes(2));
  });

  it("gives up on the spot when the request fails, rather than retrying every tick", async () => {
    api.fetchRadio.mockRejectedValue(new Error("offline"));
    renderHook(() => useAutoplayFill());

    publish();
    await settled();
    publish({ positionSeconds: 50 });
    await settled();

    expect(api.fetchRadio).toHaveBeenCalledTimes(1);
    expect(store.appendAutoplay).not.toHaveBeenCalled();
  });
});
