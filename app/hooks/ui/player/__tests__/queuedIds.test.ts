import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

vi.mock("@components/Player", () => ({
  closeMiniWindow: vi.fn(),
  openMiniWindow: vi.fn(() => Promise.resolve(true)),
  nextRepeat: (repeat: string) => (repeat === "off" ? "all" : repeat === "all" ? "one" : "off"),
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
    sources: [],
  };
}

async function freshModules() {
  vi.resetModules();
  const store = await import("../store");
  const { nowPlayingSnapshot, upcomingTrackIdsSnapshot } = await import("../usePlayer");
  return { store, nowPlayingSnapshot, upcomingTrackIdsSnapshot };
}

describe("upcomingTrackIdsSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("holds everything still ahead of the playing track, but not the playing track itself", async () => {
    const { store, upcomingTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);

    expect([...upcomingTrackIdsSnapshot()].sort()).toEqual(["b", "c"]);
  });

  it("drops a track once playback has reached it", async () => {
    const { store, upcomingTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.next();

    expect([...upcomingTrackIdsSnapshot()]).toEqual(["c"]);
  });

  it("counts the tracks repeat-all will bring round again, as soon as repeat-all is turned on", async () => {
    const { store, upcomingTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 2);
    expect(upcomingTrackIdsSnapshot().has("a")).toBe(false);

    store.actions.cycleRepeat();

    expect([...upcomingTrackIdsSnapshot()].sort()).toEqual(["a", "b"]);
  });

  it("returns the same reference across a republish that only moved the position", async () => {
    const { store, upcomingTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);

    const before = upcomingTrackIdsSnapshot();
    store.actions.seekTo(42);

    expect(upcomingTrackIdsSnapshot()).toBe(before);
  });

  it("returns a new reference once the queue itself changes", async () => {
    const { store, upcomingTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);

    const before = upcomingTrackIdsSnapshot();
    store.actions.addToQueue([track("c")]);

    const after = upcomingTrackIdsSnapshot();
    expect(after).not.toBe(before);
    expect(after.has("c")).toBe(true);
  });
});

describe("nowPlayingSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is empty before anything has played", async () => {
    const { nowPlayingSnapshot } = await freshModules();

    expect(nowPlayingSnapshot()).toBeNull();
  });

  it("names the playing track and whether it is sounding", async () => {
    const { store, nowPlayingSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.next();

    expect(nowPlayingSnapshot()?.trackId).toBe("b");
  });

  it("keeps its reference while only the position moves, so rows do not re-render every tick", async () => {
    const { store, nowPlayingSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);

    const before = nowPlayingSnapshot();
    store.actions.seekTo(42);

    expect(nowPlayingSnapshot()).toBe(before);
  });
});

describe("removeTrackFromQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes a track that is still ahead of the playing one", async () => {
    const { store, upcomingTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);

    store.actions.removeTrackFromQueue("b");

    expect([...upcomingTrackIdsSnapshot()]).toEqual(["c"]);
    expect(store.getSnapshot().queue.map((queued) => queued.id)).toEqual(["a", "c"]);
  });

  it("leaves the playing track alone", async () => {
    const { store, nowPlayingSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);

    store.actions.removeTrackFromQueue("a");

    expect(nowPlayingSnapshot()?.trackId).toBe("a");
    expect(store.getSnapshot().queue.map((queued) => queued.id)).toEqual(["a", "b"]);
  });

  it("does not reach back into tracks that already played", async () => {
    const { store } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.next();
    store.actions.next();

    store.actions.removeTrackFromQueue("a");

    expect(store.getSnapshot().queue.map((queued) => queued.id)).toEqual(["a", "b", "c"]);
    expect(store.getSnapshot().index).toBe(2);
  });
});
