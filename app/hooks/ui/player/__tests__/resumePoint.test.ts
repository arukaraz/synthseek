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
  const { resumePointSnapshot } = await import("../useResumePoint");
  return { store, resumePointSnapshot };
}

describe("resumePointSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is empty before anything is loaded", async () => {
    const { resumePointSnapshot } = await freshModules();

    expect(resumePointSnapshot()).toBeNull();
  });

  it("points at the restored track, paused where the saved queue left it", async () => {
    const { store, resumePointSnapshot } = await freshModules();
    store.actions.restoreSession([track("a"), track("b"), track("c")], "b", 42.7, null, [], null);

    expect(resumePointSnapshot()).toMatchObject({
      track: { id: "b" },
      index: 1,
      total: 3,
      positionSeconds: 42,
      playing: false,
    });
  });

  it("keeps the same snapshot until something it shows changes", async () => {
    const { store, resumePointSnapshot } = await freshModules();
    store.actions.restoreSession([track("a"), track("b")], "a", 10, null, [], null);

    const first = resumePointSnapshot();
    expect(resumePointSnapshot()).toBe(first);

    store.actions.jumpTo(1);
    const moved = resumePointSnapshot();
    expect(moved).not.toBe(first);
    expect(moved?.index).toBe(1);
  });

  it("follows the queue to the next track", async () => {
    const { store, resumePointSnapshot } = await freshModules();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.next();

    expect(resumePointSnapshot()).toMatchObject({ track: { id: "b" }, index: 1 });
  });
});
