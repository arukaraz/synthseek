import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { MIRROR_STALE_MS, MIRROR_TICK_MS } from "../constants";
import type { EngineCallbacks, RemotePlayback } from "../types";

vi.mock("@components/Player", async () => {
  const helpers = await vi.importActual<typeof import("@components/Player/helpers")>("@components/Player/helpers");
  return {
    nextRepeat: helpers.nextRepeat,
    restorablePlayerMode: helpers.restorablePlayerMode,
    shouldRestart: helpers.shouldRestart,
    closeMiniWindow: vi.fn(),
    openMiniWindow: vi.fn(async () => true),
  };
});

vi.mock("@utils/artworkProxy", () => ({ artworkProxySrc: (value: string) => value }));

const notices = vi.hoisted(() => ({ announce: vi.fn() }));

vi.mock("../announce", () => ({ announce: notices.announce }));

const engine = vi.hoisted(() => ({
  handlers: null as EngineCallbacks | null,
  applyVolume: vi.fn(),
  loadAndPlay: vi.fn(),
  loadAt: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  seek: vi.fn(),
  stop: vi.fn(),
  prime: vi.fn(),
  cancelPrime: vi.fn(),
  primedUrl: vi.fn((): string | null => null),
  crossfadeTo: vi.fn(),
  setActiveTrackGain: vi.fn(),
}));

vi.mock("../engine", () => ({
  applyVolume: engine.applyVolume,
  canPlayMime: () => true,
  connectEngine: (handlers: EngineCallbacks) => {
    engine.handlers = handlers;
  },
  loadAndPlay: engine.loadAndPlay,
  loadAt: engine.loadAt,
  pause: engine.pause,
  resume: engine.resume,
  seek: engine.seek,
  stop: engine.stop,
  prime: engine.prime,
  cancelPrime: engine.cancelPrime,
  primedUrl: engine.primedUrl,
  crossfadeTo: engine.crossfadeTo,
  setActiveTrackGain: engine.setActiveTrackGain,
}));

const media = vi.hoisted(() => ({
  clearMediaSession: vi.fn(),
  publishMediaSession: vi.fn(),
  publishPlaybackState: vi.fn(),
  publishPosition: vi.fn(),
}));

vi.mock("../media-session", () => media);

function track(id: string): PlayerTrack {
  return {
    id,
    title: `Title ${id}`,
    artist: "Air",
    album: "Moon Safari",
    durationSeconds: 200,
    format: "mp3",
    bitrateKbps: 320,
    lossless: false,
    tone: "primary",
    artworkUrl: null,
    albumId: "album-1",
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
  };
}

function remotePlayback(overrides: Partial<RemotePlayback> = {}): RemotePlayback {
  return {
    deviceId: "kitchen",
    deviceName: "Kitchen",
    confirmed: true,
    playing: true,
    track: track("a"),
    positionSeconds: 10,
    shuffle: false,
    repeat: "off",
    volume: 0.5,
    muted: false,
    transcoding: false,
    updatedAt: Date.now(),
    ...overrides,
  };
}

async function freshStore(): Promise<typeof import("../store")> {
  vi.resetModules();
  const store = await import("../store");
  store.setMessages({
    skipping: (title) => `skipping ${title}`,
    resumedFrom: (client) => `resumed from ${client}`,
    handOverFailed: (device) => `hand over to ${device} failed`,
    deviceGone: "device gone",
    queueEnd: "queue end",
    autoplayBlocked: "autoplay blocked",
    tooManyFailures: "too many failures",
  });
  return store;
}

beforeEach(() => {
  vi.clearAllMocks();
  engine.handlers = null;
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("player store remote handover", () => {
  it("goes quiet here as soon as another device starts sounding", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    store.actions.applyRemoteState(remotePlayback());

    expect(engine.pause).toHaveBeenCalled();
    expect(media.clearMediaSession).toHaveBeenCalled();
    expect(store.getSnapshot().playing).toBe(false);
    expect(store.getSnapshot().started).toBe(true);
    expect(store.getSnapshot().remote?.deviceId).toBe("kitchen");
  });

  it("ignores a paused report from a device that was never mirroring here", async () => {
    const store = await freshStore();

    store.actions.applyRemoteState(remotePlayback({ playing: false }));

    expect(store.getSnapshot().remote).toBeNull();
  });

  it("ignores a paused report from a device other than the one being mirrored", async () => {
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback());

    store.actions.applyRemoteState(remotePlayback({ deviceId: "study", playing: false }));

    expect(store.getSnapshot().remote?.deviceId).toBe("kitchen");
    expect(store.getSnapshot().remote?.playing).toBe(true);
  });

  it("records the pause of the device it is mirroring", async () => {
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback());

    store.actions.applyRemoteState(remotePlayback({ playing: false, positionSeconds: 55 }));

    expect(store.getSnapshot().remote?.playing).toBe(false);
    expect(store.getSnapshot().remote?.positionSeconds).toBe(55);
  });

  it("keeps the mirrored clock moving while the other device plays", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.actions.applyRemoteState(remotePlayback({ updatedAt: Date.now() }));
    listener.mockClear();

    vi.advanceTimersByTime(MIRROR_TICK_MS * 3);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(store.getSnapshot().remote).not.toBeNull();
  });

  it("lets go of a device that has stopped reporting", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ updatedAt: Date.now() }));

    vi.advanceTimersByTime(MIRROR_STALE_MS + MIRROR_TICK_MS);

    expect(store.getSnapshot().remote).toBeNull();
  });

  it("forgets a device only once it is actually being mirrored", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.forgetRemote();

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("player store playHere", () => {
  it("refuses to pull the sound back when no device holds it", async () => {
    const store = await freshStore();

    expect(store.actions.playHere()).toBe(false);
  });

  it("refuses when the other device is not on a track", async () => {
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ track: null }));

    expect(store.actions.playHere()).toBe(false);
  });

  it("refuses when the remote track is missing from this queue", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("b")], 0);
    store.actions.applyRemoteState(remotePlayback());

    expect(store.actions.playHere()).toBe(false);
  });

  it("adopts the other device's settings and resumes where it had reached", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("z"), track("a")], 0);
    const updatedAt = Date.now() - 4000;
    store.actions.applyRemoteState(
      remotePlayback({ updatedAt, positionSeconds: 30, volume: 0.25, muted: true, shuffle: true, repeat: "all" })
    );
    engine.loadAndPlay.mockClear();

    expect(store.actions.playHere()).toBe(true);

    expect(store.getSnapshot().volume).toBe(0.25);
    expect(store.getSnapshot().muted).toBe(true);
    expect(store.getSnapshot().repeat).toBe("all");
    expect(store.getSnapshot().shuffle).toBe(true);
    expect(engine.applyVolume).toHaveBeenCalledWith(0.25, true);
    expect(store.getSnapshot().index).toBe(1);
    expect(store.getSnapshot().positionSeconds).toBeGreaterThanOrEqual(34);
  });

  it("resumes a paused device from the position it reported, not a projected one", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.applyRemoteState(remotePlayback());
    store.actions.applyRemoteState(
      remotePlayback({ playing: false, positionSeconds: 12, updatedAt: Date.now() - 9000 })
    );

    expect(store.actions.playHere()).toBe(true);
    expect(store.getSnapshot().positionSeconds).toBe(12);
  });
});

describe("player store optimistic remote updates", () => {
  it("ignores an expectation when nothing is being mirrored", async () => {
    const store = await freshStore();

    store.actions.expectRemote({ volume: 0.1 });

    expect(store.getSnapshot().remote).toBeNull();
  });

  it("shows the change straight away rather than waiting for the device to confirm", async () => {
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback());

    store.actions.expectRemote({ volume: 0.2, muted: true });

    expect(store.getSnapshot().remote?.volume).toBe(0.2);
    expect(store.getSnapshot().remote?.muted).toBe(true);
  });

  it("freezes the mirrored clock where it had reached when the device is paused", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ positionSeconds: 10, updatedAt: Date.now() }));
    vi.advanceTimersByTime(5000);

    store.actions.expectRemote({ playing: false });

    expect(store.getSnapshot().remote?.positionSeconds).toBe(15);
  });

  it("restarts the mirrored clock when the device is told to play again", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ playing: false }));
    store.actions.applyRemoteState(remotePlayback());
    store.actions.applyRemoteState(remotePlayback({ playing: false }));
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.expectRemote({ playing: true });
    listener.mockClear();
    vi.advanceTimersByTime(MIRROR_TICK_MS * 2);

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("leaves the reported position alone when the expectation is not about playing", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ positionSeconds: 10, updatedAt: Date.now() }));
    vi.advanceTimersByTime(5000);

    store.actions.expectRemote({ volume: 0.9 });

    expect(store.getSnapshot().remote?.positionSeconds).toBe(10);
  });
});

describe("player store resync", () => {
  it("does nothing when no device is being mirrored", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.resync();

    expect(listener).not.toHaveBeenCalled();
  });

  it("puts the mirrored clock back on after the tab was asleep", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ updatedAt: Date.now() }));
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.resync();
    listener.mockClear();
    vi.advanceTimersByTime(MIRROR_TICK_MS * 2);

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("leaves the clock off for a device that is paused", async () => {
    vi.useFakeTimers();
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback());
    store.actions.applyRemoteState(remotePlayback({ playing: false }));
    const listener = vi.fn();
    store.subscribe(listener);

    store.actions.resync();
    listener.mockClear();
    vi.advanceTimersByTime(MIRROR_TICK_MS * 3);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("player store unconfirmed hand-over", () => {
  it("takes the sound back when the other device never acknowledged", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.applyRemoteState(remotePlayback({ confirmed: false, positionSeconds: 21 }));
    engine.loadAndPlay.mockClear();

    store.actions.recoverUnconfirmedHandOver("kitchen");

    expect(store.getSnapshot().remote).toBeNull();
    expect(notices.announce).toHaveBeenCalledWith({ text: "hand over to Kitchen failed", tone: "warning" });
    expect(engine.loadAndPlay).toHaveBeenCalledWith("/api/v1/library/tracks/a/stream", 0.8, false, 21);
  });

  it("stays put when the device did acknowledge", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.applyRemoteState(remotePlayback({ confirmed: true }));

    store.actions.recoverUnconfirmedHandOver("kitchen");

    expect(store.getSnapshot().remote).not.toBeNull();
  });

  it("ignores a recovery aimed at a different device", async () => {
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ confirmed: false }));

    store.actions.recoverUnconfirmedHandOver("study");

    expect(store.getSnapshot().remote).not.toBeNull();
  });

  it("ignores a recovery when nothing was handed over", async () => {
    const store = await freshStore();

    store.actions.recoverUnconfirmedHandOver("kitchen");

    expect(notices.announce).not.toHaveBeenCalled();
  });

  it("gives up silently when the track it was on is not in this queue", async () => {
    const store = await freshStore();
    store.actions.applyRemoteState(remotePlayback({ confirmed: false }));
    engine.loadAndPlay.mockClear();

    store.actions.recoverUnconfirmedHandOver("kitchen");

    expect(store.getSnapshot().remote).toBeNull();
    expect(engine.loadAndPlay).not.toHaveBeenCalled();
  });
});

describe("player store shared queue", () => {
  it("adopts the queue another device is playing so the listener can see it", async () => {
    const store = await freshStore();

    store.actions.adoptQueue([track("a"), track("b")], "b");

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b"]);
    expect(store.getSnapshot().index).toBe(1);
    expect(store.getSnapshot().started).toBe(true);
  });

  it("points at the top when the named track is not in the shared queue", async () => {
    const store = await freshStore();

    store.actions.adoptQueue([track("a")], "elsewhere");

    expect(store.getSnapshot().index).toBe(0);
  });

  it("refuses to overwrite a queue that is sounding here", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("mine")], 0);
    engine.handlers?.onPlayingChange(true);

    store.actions.adoptQueue([track("theirs")], "theirs");

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["mine"]);
  });

  it("ignores an empty shared queue", async () => {
    const store = await freshStore();

    store.actions.adoptQueue([], null);

    expect(store.getSnapshot().started).toBe(false);
  });
});

describe("player store remote commands", () => {
  it("takes the sound back here when another device tells it to play", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.applyRemoteState(remotePlayback());

    store.actions.resumeHere();

    expect(store.getSnapshot().remote).toBeNull();
    expect(engine.resume).toHaveBeenCalled();
  });

  it("does nothing when told to play while already sounding", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.handlers?.onPlayingChange(true);
    engine.resume.mockClear();

    store.actions.resumeHere();

    expect(engine.resume).not.toHaveBeenCalled();
  });

  it("pauses when told to, and stays quiet when there is nothing to pause", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    store.actions.pauseHere();
    expect(engine.pause).not.toHaveBeenCalled();

    engine.handlers?.onPlayingChange(true);
    store.actions.pauseHere();
    expect(engine.pause).toHaveBeenCalled();
  });

  it("tells the listener when the device it was mirroring disappeared", async () => {
    const store = await freshStore();

    store.actions.announceDeviceGone();

    expect(notices.announce).toHaveBeenCalledWith({ text: "device gone", tone: "warning" });
  });
});
