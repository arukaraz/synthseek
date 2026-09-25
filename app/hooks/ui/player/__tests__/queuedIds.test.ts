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
    sources: [],
  };
}

async function freshModules() {
  vi.resetModules();
  const store = await import("../store");
  const { queuedTrackIdsSnapshot } = await import("../usePlayer");
  return { store, queuedTrackIdsSnapshot };
}

describe("queuedTrackIdsSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("holds the playing track and everything still ahead of it", async () => {
    const { store, queuedTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);

    expect([...queuedTrackIdsSnapshot()].sort()).toEqual(["a", "b", "c"]);
  });

  it("drops a track once playback has moved past it", async () => {
    const { store, queuedTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.next();

    const ids = queuedTrackIdsSnapshot();
    expect(ids.has("a")).toBe(false);
    expect([...ids].sort()).toEqual(["b", "c"]);
  });

  it("returns the same reference across a republish that only moved the position", async () => {
    const { store, queuedTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);

    const before = queuedTrackIdsSnapshot();
    store.actions.seekTo(42);

    expect(queuedTrackIdsSnapshot()).toBe(before);
  });

  it("returns a new reference once the queue itself changes", async () => {
    const { store, queuedTrackIdsSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);

    const before = queuedTrackIdsSnapshot();
    store.actions.addToQueue([track("c")]);

    const after = queuedTrackIdsSnapshot();
    expect(after).not.toBe(before);
    expect(after.has("c")).toBe(true);
  });
});
