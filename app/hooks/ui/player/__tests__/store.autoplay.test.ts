import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

vi.mock("@components/Player", () => ({
  closeMiniWindow: vi.fn(),
  openMiniWindow: vi.fn(() => Promise.resolve(true)),
  nextRepeat: (repeat: string) => repeat,
  restorablePlayerMode: () => "normal",
  shouldRestart: () => false,
}));

vi.mock("@utils/artworkProxy", () => ({ artworkProxySrc: (value: string) => value }));

vi.mock("../announce", () => ({ announce: vi.fn() }));

vi.mock("../engine", () => ({
  applyVolume: vi.fn(),
  canPlayMime: () => true,
  connectEngine: vi.fn(),
  loadAndPlay: vi.fn(),
  loadAt: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  seek: vi.fn(),
  stop: vi.fn(),
  prime: vi.fn(),
  cancelPrime: vi.fn(),
  primedUrl: () => null,
  crossfadeTo: vi.fn(),
  setActiveTrackGain: vi.fn(),
}));

vi.mock("../media-session", () => ({
  clearMediaSession: vi.fn(),
  publishMediaSession: vi.fn(),
  publishPlaybackState: vi.fn(),
  publishPosition: vi.fn(),
}));

function track(id: string): PlayerTrack {
  return {
    id,
    title: `Title ${id}`,
    artist: "Daft Punk",
    album: "Homework",
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

async function freshStore(): Promise<typeof import("../store")> {
  vi.resetModules();
  return import("../store");
}

function ids(store: Awaited<ReturnType<typeof freshStore>>): string[] {
  return store.getSnapshot().queue.map((entry) => entry.id);
}

describe("the autoplay tail of the queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appends what the radio found after everything the listener chose and remembers it as autoplay", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    const outcome = store.actions.appendAutoplay([track("r1"), track("r2")]);

    expect(outcome.added).toBe(2);
    expect(ids(store)).toEqual(["a", "b", "r1", "r2"]);
    expect([...store.getSnapshot().autoplayIds].sort()).toEqual(["r1", "r2"]);
    expect(store.getSnapshot().index).toBe(0);
  });

  it("puts a track the listener adds before the autoplay tail, not after it", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.appendAutoplay([track("r1"), track("r2")]);

    store.actions.addToQueue([track("b")]);

    expect(ids(store)).toEqual(["a", "b", "r1", "r2"]);
    expect(store.getSnapshot().autoplayIds.has("b")).toBe(false);
  });

  it("keeps the autoplay tail last in the shuffle order too", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.toggleShuffle();
    store.actions.appendAutoplay([track("r1"), track("r2")]);

    store.actions.addToQueue([track("b"), track("c")]);

    const after = store.getSnapshot();
    const played = after.shuffleOrder.map((index) => after.queue[index]?.id);
    expect(played.slice(-2)).toEqual(["r1", "r2"]);
    expect(played.slice(0, 3).sort()).toEqual(["a", "b", "c"]);
    expect([...after.shuffleOrder].sort((left, right) => left - right)).toEqual([0, 1, 2, 3, 4]);
  });

  it("forgets a radio track the listener removes", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.appendAutoplay([track("r1"), track("r2")]);

    store.actions.removeFromQueue(1);

    expect(ids(store)).toEqual(["a", "r2"]);
    expect([...store.getSnapshot().autoplayIds]).toEqual(["r2"]);
  });

  it("starts over with no autoplay tail when the listener plays something new", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.appendAutoplay([track("r1")]);

    store.actions.playQueue([track("x"), track("y")], 1);

    expect(store.getSnapshot().autoplayIds.size).toBe(0);
  });

  it("saves the radio tail with the session and takes it back on restore", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    store.actions.appendAutoplay([track("r1")]);

    expect(store.sessionSnapshot()).toEqual({
      trackIds: ["a", "r1"],
      autoplayTrackIds: ["r1"],
      currentTrackId: "a",
      positionMs: 0,
    });

    const restored = await freshStore();
    restored.actions.restoreSession([track("a"), track("r1")], "a", 0, null, ["r1", "gone"]);

    expect([...restored.getSnapshot().autoplayIds]).toEqual(["r1"]);
  });

  it("plays a station with the seed first and everything after it marked as autoplay", async () => {
    const store = await freshStore();

    store.actions.playStation(track("seed"), [track("r1"), track("seed"), track("r2")]);

    expect(ids(store)).toEqual(["seed", "r1", "r2"]);
    expect([...store.getSnapshot().autoplayIds].sort()).toEqual(["r1", "r2"]);
    expect(store.getSnapshot().index).toBe(0);
  });

  it("plays a station without a seed from its first track, all of it autoplay", async () => {
    const store = await freshStore();

    store.actions.playStation(null, [track("r1"), track("r2")]);

    expect(ids(store)).toEqual(["r1", "r2"]);
    expect([...store.getSnapshot().autoplayIds].sort()).toEqual(["r1", "r2"]);
  });

  it("follows the account preference without touching the queue", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    store.setAutoplayPreference(true);

    expect(store.getSnapshot().autoplay).toBe(true);
    expect(ids(store)).toEqual(["a"]);
  });
});
