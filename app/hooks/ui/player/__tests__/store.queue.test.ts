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

  it("still relocates a played track when a new one in the same batch does not fit", async () => {
    const store = await freshStore();
    const full = Array.from({ length: MAX_QUEUE_TRACKS }, (_, at) => track(`t${at}`));
    store.actions.playQueue(full, 0);
    store.actions.jumpTo(2);

    const outcome = store.actions.addToQueue([track("one-too-many"), track("t0")]);

    expect(outcome.added).toBe(1);
    expect(store.getSnapshot().queue).toHaveLength(MAX_QUEUE_TRACKS);
    expect(store.getSnapshot().queue[MAX_QUEUE_TRACKS - 1]?.id).toBe("t0");
  });
});

describe("player store playNext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("puts the track straight after the one playing rather than at the end", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);

    store.actions.playNext([track("z")]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "z", "b", "c"]);
    expect(store.getSnapshot().index).toBe(0);
  });

  it("keeps a batch in the order it was handed over", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    store.actions.playNext([track("y"), track("z")]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "y", "z", "b"]);
  });

  it("inserts after the track playing when that is not the first one", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.jumpTo(1);

    store.actions.playNext([track("z")]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b", "z", "c"]);
    expect(store.getSnapshot().queue[store.getSnapshot().index]?.id).toBe("b");
  });

  it("starts playing when the queue was empty", async () => {
    const store = await freshStore();

    store.actions.playNext([track("a")]);

    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a"]);
  });

  it("skips a track that is already coming up, exactly as adding to the end does", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b")], 0);

    const outcome = store.actions.playNext([track("b")]);

    expect(outcome.added).toBe(0);
    expect(store.getSnapshot().queue.map((entry) => entry.id)).toEqual(["a", "b"]);
  });

  it("moves an already played track up to next rather than leaving it behind", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.jumpTo(2);

    store.actions.playNext([track("a")]);

    const snapshot = store.getSnapshot();
    expect(snapshot.queue.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
    expect(snapshot.queue[snapshot.index]?.id).toBe("c");
  });

  it("leaves a track that shuffle has not reached yet where it is, even though it sits earlier in the array", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c"), track("d")], 0);
    store.actions.jumpTo(2);
    store.actions.toggleShuffle();
    const before = store.getSnapshot();

    const outcome = store.actions.playNext([track("a")]);

    const after = store.getSnapshot();
    expect(outcome.added).toBe(0);
    expect(after.queue.map((entry) => entry.id)).toEqual(before.queue.map((entry) => entry.id));
    expect(after.queue[after.index]?.id).toBe(before.queue[before.index]?.id);
  });

  it("takes the next shuffle position rather than the next array slot", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a"), track("b"), track("c")], 0);
    store.actions.toggleShuffle();

    store.actions.playNext([track("z")]);

    const snapshot = store.getSnapshot();
    const playingAt = snapshot.shuffleOrder.indexOf(snapshot.index);
    const nextIndex = snapshot.shuffleOrder[playingAt + 1];
    expect(snapshot.queue[nextIndex ?? -1]?.id).toBe("z");
  });
});
