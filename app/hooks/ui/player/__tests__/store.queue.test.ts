import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_QUEUE_TRACKS } from "../constants";
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

  it("requeues a track that already played, because the list the operator can see no longer holds it", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.jumpTo(2);

    const outcome = store.actions.addToQueue([track("a")]);

    expect(outcome.added).toBe(1);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
    expect(store.getSnapshot().queue[store.getSnapshot().index]?.id).toBe("c");
  });

  it("relocates a track shuffle already played, leaving every shuffle position on a real track", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.toggleShuffle();

    const order = store.getSnapshot().shuffleOrder;
    store.actions.jumpTo(order[order.length - 1] ?? 0);
    const playingId = store.getSnapshot().queue[store.getSnapshot().index]?.id;

    const outcome = store.actions.addToQueue([track("a")]);

    const after = store.getSnapshot();
    expect(outcome.added).toBe(1);
    expect(after.queue.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
    expect(after.queue[after.index]?.id).toBe(playingId);
    expect([...after.shuffleOrder].sort((left, right) => left - right)).toEqual([0, 1, 2]);
    expect(after.queue[after.shuffleOrder[2] ?? -1]?.id).toBe("a");
  });

  it("never relocates the track that is playing, which would leave the index on a different song", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.jumpTo(1);

    const outcome = store.actions.addToQueue([track("b")]);

    const after = store.getSnapshot();
    expect(outcome.added).toBe(0);
    expect(after.queue.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
    expect(after.queue[after.index]?.id).toBe("b");
  });

  it("relocates two played tracks at once without disturbing the order of the rest", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c"), track("d"), track("e")], 0);
    store.actions.jumpTo(4);

    const outcome = store.actions.addToQueue([track("a"), track("b")]);

    const after = store.getSnapshot();
    expect(outcome.added).toBe(2);
    expect(after.queue.map((entry) => entry.id)).toEqual(["c", "d", "e", "a", "b"]);
    expect(after.queue[after.index]?.id).toBe("e");
  });

  it("leaves the shuffle order a permutation of the queue when two played tracks are relocated at once", async () => {
    const store = await freshStore();
    vi.spyOn(Math, "random").mockReturnValue(0);
    store.actions.playQueue([track("a"), track("b"), track("c"), track("d"), track("e")], 0);
    store.actions.toggleShuffle();

    const order = store.getSnapshot().shuffleOrder;
    store.actions.jumpTo(order[order.length - 1] ?? 0);

    const before = store.getSnapshot();
    const movedIds = [before.queue[order[1] ?? 0]?.id, before.queue[order[3] ?? 0]?.id];
    const survivingBefore = before.shuffleOrder
      .map((at) => before.queue[at]?.id)
      .filter((id) => id !== undefined && !movedIds.includes(id));

    const outcome = store.actions.addToQueue(movedIds.map((id) => track(id ?? "")));

    const after = store.getSnapshot();
    const survivingAfter = after.shuffleOrder
      .map((at) => after.queue[at]?.id)
      .filter((id) => id !== undefined && !movedIds.includes(id));

    expect(outcome.added).toBe(2);
    expect([...after.shuffleOrder].sort((left, right) => left - right)).toEqual([0, 1, 2, 3, 4]);
    expect(survivingAfter).toEqual(survivingBefore);
  });

  it("still skips a track shuffle has scheduled ahead, even though it sits behind the index", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.jumpTo(2);
    store.actions.toggleShuffle();

    const outcome = store.actions.addToQueue([track("a")]);

    expect(outcome.added).toBe(0);
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

  it("takes more once the listener has heard the whole queue, forgetting the oldest plays to make room", async () => {
    const store = await freshStore();
    const full = Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => track(`t${at}`));
    store.actions.playQueue(full, 0);
    store.actions.jumpTo(MAX_QUEUE_TRACKS - 1);

    const outcome = store.actions.addToQueue([track("fresh")]);

    const after = store.getSnapshot();
    expect(outcome).toEqual({ added: 1, full: false, skipped: 0 });
    expect(after.queue).toHaveLength(MAX_QUEUE_TRACKS);
    expect(after.queue[0]?.id).toBe("t1");
    expect(after.queue[after.index]?.id).toBe(`t${MAX_QUEUE_TRACKS - 1}`);
    expect(after.queue[after.index + 1]?.id).toBe("fresh");
  });

  it("forgets the oldest plays in the order shuffle played them", async () => {
    const store = await freshStore();
    const full = Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => track(`t${at}`));
    store.actions.playQueue(full, 5);
    store.actions.toggleShuffle();
    const order = store.getSnapshot().shuffleOrder;
    const firstPlayed = store.getSnapshot().queue[order[0] ?? 0]?.id;
    const secondPlayed = store.getSnapshot().queue[order[1] ?? 0]?.id;
    store.actions.jumpTo(order[order.length - 1] ?? 0);

    store.actions.addToQueue([track("fresh")]);

    const after = store.getSnapshot();
    const ids = after.queue.map((entry) => entry.id);
    expect(ids).not.toContain(firstPlayed);
    expect(ids).toContain(secondPlayed);
    expect([...after.shuffleOrder].sort((left, right) => left - right)).toEqual(
      Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => at)
    );
    expect(after.queue[after.shuffleOrder[after.shuffleOrder.indexOf(after.index) + 1] ?? -1]?.id).toBe("fresh");
  });

  it("counts a relocated play against the visible queue, so a batch stops where the listener's list is full", async () => {
    const store = await freshStore();
    const full = Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => track(`t${at}`));
    store.actions.playQueue(full, 0);
    store.actions.jumpTo(1);

    const outcome = store.actions.addToQueue([track("fresh"), track("t0")]);

    const after = store.getSnapshot();
    expect(outcome).toEqual({ added: 1, full: true, skipped: 1 });
    expect(after.queue).toHaveLength(MAX_QUEUE_TRACKS);
    expect(after.queue.map((entry) => entry.id)).not.toContain("t0");
    expect(after.queue[MAX_QUEUE_TRACKS - 1]?.id).toBe("fresh");
  });

  it("keeps a full queue full under repeat-all, since every played track will come round again", async () => {
    const store = await freshStore();
    const full = Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => track(`t${at}`));
    store.actions.playQueue(full, 0);
    store.actions.jumpTo(MAX_QUEUE_TRACKS - 1);
    store.actions.cycleRepeat();

    const outcome = store.actions.addToQueue([track("fresh")]);

    expect(store.getSnapshot().repeat).toBe("all");
    expect(outcome).toEqual({ added: 0, full: true, skipped: 1 });
    expect(store.getSnapshot().queue[0]?.id).toBe("t0");
  });

  it("takes a track out of the loop when the listener removes it under repeat-all", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 2);
    store.actions.cycleRepeat();

    store.actions.removeTrackFromQueue("a");

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["b", "c"]);
    expect(store.getSnapshot().queue[store.getSnapshot().index]?.id).toBe("c");
  });

  it("plays a list longer than the queue holds from the chosen track, within the cap", async () => {
    const store = await freshStore();
    const long = Array.from({ length: MAX_QUEUE_TRACKS + 10 }, (_, at) => track(`t${at}`));

    store.actions.playQueue(long, MAX_QUEUE_TRACKS + 5);

    const after = store.getSnapshot();
    expect(after.queue).toHaveLength(MAX_QUEUE_TRACKS);
    expect(after.queue[after.index]?.id).toBe(`t${MAX_QUEUE_TRACKS + 5}`);
    expect(after.queue.at(-1)?.id).toBe(`t${MAX_QUEUE_TRACKS + 9}`);
  });

  it("keeps a shuffle order for a queue adopted from another device while shuffle is on", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);
    store.actions.toggleShuffle();

    store.actions.adoptQueue([track("x"), track("y"), track("z")], "x", []);

    const after = store.getSnapshot();
    expect([...after.shuffleOrder].sort((left, right) => left - right)).toEqual([0, 1, 2]);
    expect(after.shuffleOrder[0]).toBe(0);
  });
});
