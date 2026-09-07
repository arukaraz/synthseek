import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_QUEUE_TRACKS } from "../constants";
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

const engine = vi.hoisted(() => ({ handlers: null as { onFailure?: (reason: string) => void } | null }));

vi.mock("../engine", () => ({
  applyVolume: vi.fn(),
  canPlayMime: () => true,
  connectEngine: vi.fn((h: { onFailure?: (reason: string) => void }) => {
    engine.handlers = h;
  }),
  loadAndPlay: vi.fn(),
  loadAt: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  seek: vi.fn(),
  stop: vi.fn(),
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
  };
}

async function freshStore(): Promise<typeof import("../store")> {
  vi.resetModules();
  return import("../store");
}

describe("player store addToQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appends to the end of a running queue without moving what is playing", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    const outcome = store.actions.addToQueue([track("c")]);

    expect(outcome.added).toBe(1);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
    expect(store.getSnapshot().index).toBe(0);
  });

  it("skips a track the queue already holds, because the queue is keyed by track id", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    const outcome = store.actions.addToQueue([track("b"), track("c")]);

    expect(outcome.added).toBe(1);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
  });

  it("collapses a repeat inside ONE batch, which is the shape another protocol can build", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    const outcome = store.actions.addToQueue([track("x"), track("y"), track("x")]);

    expect(outcome.added).toBe(2);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "x", "y"]);
  });

  it("refuses a repeat on the play path too, so a saved playlist cannot seed duplicate keys", async () => {
    const store = await freshStore();

    store.actions.playQueue([track("x"), track("y"), track("x")], 0);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["x", "y"]);
  });

  it("starts the caller's chosen track even when an earlier repeat was dropped", async () => {
    const store = await freshStore();

    store.actions.playQueue([track("x"), track("y"), track("x"), track("z")], 3);

    expect(store.getSnapshot().queue[store.getSnapshot().index]?.id).toBe("z");
  });

  it("does not rewind to the first track when the player merely gave up on three failures", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 2);
    for (let attempt = 0; attempt < 3; attempt += 1) engine.handlers?.onFailure?.("load");

    expect(store.getSnapshot().started).toBe(false);
    expect(store.getSnapshot().index).toBe(2);

    store.actions.addToQueue([track("d")]);

    expect(store.getSnapshot().index).toBe(2);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("shows the player on the first add rather than queueing into an invisible dock", async () => {
    const store = await freshStore();

    expect(store.getSnapshot().started).toBe(false);

    store.actions.addToQueue([track("a"), track("b")]);

    expect(store.getSnapshot().started).toBe(true);
    expect(store.getSnapshot().playing).toBe(false);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b"]);
  });

  it("reaches the appended tracks while shuffle is on, instead of stranding them", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.toggleShuffle();

    store.actions.addToQueue([track("c")]);

    const { queue, shuffleOrder } = store.getSnapshot();
    expect([...shuffleOrder].sort((left, right) => left - right)).toEqual([0, 1, 2]);
    expect(queue).toHaveLength(3);
  });

  it("stops at the queue size a saved session accepts", async () => {
    const store = await freshStore();
    const full = Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => track(`t${at}`));
    store.actions.playQueue(full, 0);

    const outcome = store.actions.addToQueue([track("one-too-many")]);

    expect(outcome.added).toBe(0);
    expect(outcome.full).toBe(true);
    expect(store.getSnapshot().queue).toHaveLength(MAX_QUEUE_TRACKS);
  });
});
