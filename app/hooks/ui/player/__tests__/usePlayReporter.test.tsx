import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const recordPlay = vi.hoisted(() => vi.fn());
vi.mock("@hooks/api", () => ({ useRecordPlay: () => ({ mutate: recordPlay }) }));

import { usePlayReporter } from "../usePlayReporter";
import type { PlayerSessionState, PlayerTrack } from "../types";

const listeners = new Set<() => void>();
let session: PlayerSessionState;

vi.mock("../store", () => ({
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => session,
}));

const TRACK: PlayerTrack = {
  id: "t1",
  title: "Song",
  artist: "Band",
  album: "Record",
  durationSeconds: 200,
  format: "mp3",
  bitrateKbps: 320,
  lossless: false,
  tone: "primary",
  artworkUrl: null,
};

function sessionAt(overrides: Partial<PlayerSessionState>): PlayerSessionState {
  return {
    queue: [TRACK],
    index: 0,
    playing: true,
    loading: false,
    positionSeconds: 0,
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
    moreOpen: false,
    devicesOpen: false,
    fullscreen: false,
    notice: null,
    consecutiveFailures: 0,
    started: true,
    ...overrides,
  };
}

function advanceTo(positionSeconds: number): void {
  session = sessionAt({ positionSeconds });
  listeners.forEach((listener) => listener());
}

function playThrough(to: number, step = 1): void {
  for (let at = step; at <= to; at += step) advanceTo(at);
}

beforeEach(() => {
  listeners.clear();
  recordPlay.mockReset();
  session = sessionAt({});
});

describe("usePlayReporter", () => {
  it("announces the track as soon as it starts sounding here", () => {
    renderHook(() => usePlayReporter());
    advanceTo(0);

    expect(recordPlay).toHaveBeenCalledWith({ trackId: "t1", startedSecondsAgo: 0, submission: false });
  });

  it("says nothing while another device holds the audio", () => {
    renderHook(() => usePlayReporter());
    session = sessionAt({ playing: false, remote: { deviceId: "d2" } as PlayerSessionState["remote"] });
    listeners.forEach((listener) => listener());

    expect(recordPlay).not.toHaveBeenCalled();
  });

  it("records the listen once the track has been heard for half of it", () => {
    renderHook(() => usePlayReporter());
    advanceTo(0);
    recordPlay.mockClear();

    playThrough(99);
    expect(recordPlay).not.toHaveBeenCalled();

    advanceTo(100);
    expect(recordPlay).toHaveBeenCalledWith({
      trackId: "t1",
      startedSecondsAgo: expect.any(Number),
      submission: true,
    });
  });

  it("records a listen only once, however long the track keeps playing", () => {
    renderHook(() => usePlayReporter());
    advanceTo(0);
    playThrough(150);

    expect(recordPlay.mock.calls.filter(([input]) => input.submission)).toHaveLength(1);
  });

  it("does not count a seek towards the listen", () => {
    renderHook(() => usePlayReporter());
    advanceTo(0);
    recordPlay.mockClear();

    advanceTo(1);
    advanceTo(150);
    advanceTo(151);

    expect(recordPlay).not.toHaveBeenCalled();
  });

  it("announces the next track when the queue moves on", () => {
    renderHook(() => usePlayReporter());
    advanceTo(0);
    recordPlay.mockClear();

    const second = { ...TRACK, id: "t2" };
    session = sessionAt({ queue: [TRACK, second], index: 1, positionSeconds: 0 });
    listeners.forEach((listener) => listener());

    expect(recordPlay).toHaveBeenCalledWith({ trackId: "t2", startedSecondsAgo: 0, submission: false });
  });

  it("treats a loop back to the top as a new play once the first one counted", () => {
    renderHook(() => usePlayReporter());
    advanceTo(0);
    playThrough(100);
    recordPlay.mockClear();

    advanceTo(0);

    expect(recordPlay).toHaveBeenCalledWith({ trackId: "t1", startedSecondsAgo: 0, submission: false });
  });
});
