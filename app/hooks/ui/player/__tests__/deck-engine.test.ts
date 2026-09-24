import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HANDOFF_POLL_MS,
  LOAD_TIMEOUT_MS,
  OUTGOING_RELEASE_MARGIN_MS,
  SEAM_FADE_SECONDS,
  STALL_TIMEOUT_MS,
} from "../constants";
import type { EngineCallbacks } from "../types";

const energy = vi.hoisted(() => ({ followAudio: vi.fn(), stopFollowingAudio: vi.fn() }));

vi.mock("../energy", () => energy);

class FakeAudio extends EventTarget {
  preload = "";
  crossOrigin: string | null = null;
  src = "";
  volume = 1;
  muted = false;
  currentTime = 0;
  duration = Number.NaN;
  ended = false;
  paused = true;
  readyState = 4;
  playable = "probably";
  playRejection: Error | null = null;
  readonly load = vi.fn();
  readonly pause = vi.fn(() => {
    this.paused = true;
  });
  readonly removeAttribute = vi.fn((name: string) => {
    if (name === "src") this.src = "";
  });
  readonly play = vi.fn(() => {
    if (this.playRejection !== null) return Promise.reject(this.playRejection);
    this.paused = false;
    return Promise.resolve();
  });
  readonly canPlayType = vi.fn(() => this.playable);
}

let node: FakeAudio;
let extras: FakeAudio[];

function standby(): FakeAudio {
  const found = extras[0];
  if (found === undefined) throw new Error("the engine never built a second deck");
  return found;
}

function callbacks(): EngineCallbacks {
  return {
    onProgress: vi.fn(),
    onEnded: vi.fn(),
    onHandoff: vi.fn(),
    onPlayingChange: vi.fn(),
    onLoadingChange: vi.fn(),
    onFailure: vi.fn(),
  };
}

async function freshEngine(): Promise<{ engine: typeof import("../deck-engine"); heard: EngineCallbacks }> {
  vi.resetModules();
  const engine = await import("../deck-engine");
  const heard = callbacks();
  engine.connectEngine(heard);
  return { engine, heard };
}

beforeEach(() => {
  vi.clearAllMocks();
  node = new FakeAudio();
  extras = [];
  let constructed = 0;
  vi.stubGlobal(
    "Audio",
    class {
      constructor() {
        constructed += 1;
        if (constructed === 1) return node;
        const extra = new FakeAudio();
        extras.push(extra);
        return extra;
      }
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("canPlayMime", () => {
  it("accepts a format the browser says it can decode", async () => {
    const { engine } = await freshEngine();

    expect(engine.canPlayMime("audio/mpeg")).toBe(true);
  });

  it("refuses a format the browser answers nothing about", async () => {
    node.playable = "";
    const { engine } = await freshEngine();

    expect(engine.canPlayMime("audio/flac")).toBe(false);
  });

  it("builds the probe element once and reuses it", async () => {
    const { engine } = await freshEngine();

    engine.canPlayMime("audio/mpeg");
    engine.canPlayMime("audio/flac");

    expect(node.preload).toBe("auto");
    expect(node.crossOrigin).toBe("use-credentials");
  });
});

describe("engine playback", () => {
  it("points the element at the stream and starts it", async () => {
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 0.4, true);

    expect(node.src).toBe("/stream/a");
    expect(node.volume).toBe(0.4);
    expect(node.muted).toBe(true);
    expect(node.load).toHaveBeenCalled();
    expect(node.play).toHaveBeenCalled();
    expect(heard.onLoadingChange).toHaveBeenCalledWith(true);
  });

  it("reports a stream that never produced a frame", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    vi.advanceTimersByTime(LOAD_TIMEOUT_MS);

    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });

  it("drops the timer of a stream that was replaced before it timed out", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    engine.loadAndPlay("/stream/b", 1, false);
    vi.advanceTimersByTime(LOAD_TIMEOUT_MS * 2);

    expect(heard.onFailure).toHaveBeenCalledTimes(1);
  });

  it("reports the browser refusing to start without a gesture", async () => {
    node.playRejection = new Error("NotAllowedError");
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    await vi.waitFor(() => expect(heard.onFailure).toHaveBeenCalledWith("autoplay"));
  });

  it("stays silent about a refusal that belongs to a stream already replaced", async () => {
    node.playRejection = new Error("NotAllowedError");
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    engine.loadAndPlay("/stream/b", 1, false);
    await vi.waitFor(() => expect(heard.onFailure).toHaveBeenCalledWith("autoplay"));

    expect(heard.onFailure).toHaveBeenCalledTimes(1);
  });

  it("seeks into the stream once the browser knows its length", async () => {
    const { engine } = await freshEngine();

    engine.loadAt("/stream/a", 42, 0.8, false);
    expect(node.currentTime).toBe(0);

    node.dispatchEvent(new Event("loadedmetadata"));

    expect(node.currentTime).toBe(42);
  });

  it("does not seek a stream asked to start at its beginning", async () => {
    const { engine } = await freshEngine();

    engine.loadAt("/stream/a", 0, 0.8, false);
    node.currentTime = 7;
    node.dispatchEvent(new Event("loadedmetadata"));

    expect(node.currentTime).toBe(7);
  });

  it("abandons a pending seek when another track was loaded first", async () => {
    const { engine } = await freshEngine();

    engine.loadAt("/stream/a", 42, 0.8, false);
    engine.loadAt("/stream/b", 0, 0.8, false);
    node.dispatchEvent(new Event("loadedmetadata"));

    expect(node.currentTime).toBe(0);
  });

  it("resumes without reloading", async () => {
    const { engine } = await freshEngine();

    engine.resume();

    expect(node.play).toHaveBeenCalled();
    expect(node.load).not.toHaveBeenCalled();
  });

  it("reports a refused resume", async () => {
    node.playRejection = new Error("NotAllowedError");
    const { engine, heard } = await freshEngine();

    engine.resume();
    await vi.waitFor(() => expect(heard.onFailure).toHaveBeenCalledWith("autoplay"));
  });

  it("pauses the element", async () => {
    const { engine } = await freshEngine();

    engine.pause();

    expect(node.pause).toHaveBeenCalled();
  });

  it("seeks to a position, never behind the start", async () => {
    const { engine } = await freshEngine();

    engine.seek(30);
    expect(node.currentTime).toBe(30);

    engine.seek(-5);
    expect(node.currentTime).toBe(0);
  });

  it("refuses a seek to a position that is not a number", async () => {
    const { engine } = await freshEngine();
    engine.seek(30);

    engine.seek(Number.NaN);

    expect(node.currentTime).toBe(30);
  });

  it("clamps the volume to the range the element accepts", async () => {
    const { engine } = await freshEngine();

    engine.applyVolume(1.7, false);
    expect(node.volume).toBe(1);

    engine.applyVolume(-1, true);
    expect(node.volume).toBe(0);
    expect(node.muted).toBe(true);
  });

  it("releases the stream when told to stop", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    engine.stop();

    expect(node.pause).toHaveBeenCalled();
    expect(node.removeAttribute).toHaveBeenCalledWith("src");
    expect(node.src).toBe("");
  });

  it("silences the timers of the stream it released", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    engine.stop();
    vi.advanceTimersByTime(LOAD_TIMEOUT_MS * 2);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });
});

describe("engine element events", () => {
  it("reports progress with the length the browser knows", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");
    node.currentTime = 12;
    node.duration = 210;

    node.dispatchEvent(new Event("timeupdate"));

    expect(heard.onProgress).toHaveBeenCalledWith(12, 210);
  });

  it("reports a length of zero while the browser is still guessing", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");
    node.currentTime = 3;

    node.dispatchEvent(new Event("durationchange"));

    expect(heard.onProgress).toHaveBeenCalledWith(3, 0);
  });

  it("clears the loading flag once the browser has the metadata", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("loadedmetadata"));

    expect(heard.onLoadingChange).toHaveBeenCalledWith(false);
    expect(heard.onProgress).toHaveBeenCalled();
  });

  it("starts watching the level as soon as sound comes out", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("playing"));

    expect(heard.onPlayingChange).toHaveBeenCalledWith(true);
    expect(heard.onLoadingChange).toHaveBeenCalledWith(false);
    expect(energy.followAudio).toHaveBeenCalledWith(node);
  });

  it("reports a pause and stops watching the level", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("pause"));

    expect(heard.onPlayingChange).toHaveBeenCalledWith(false);
    expect(energy.stopFollowingAudio).toHaveBeenCalled();
  });

  it("does not call the end of a track a pause", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");
    node.ended = true;

    node.dispatchEvent(new Event("pause"));

    expect(heard.onPlayingChange).not.toHaveBeenCalled();
  });

  it("announces the end of a track", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("ended"));

    expect(heard.onEnded).toHaveBeenCalled();
    expect(energy.stopFollowingAudio).toHaveBeenCalled();
  });

  it("reports a stream that went quiet for too long", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("waiting"));
    expect(heard.onLoadingChange).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(STALL_TIMEOUT_MS);
    expect(heard.onFailure).toHaveBeenCalledWith("stall");
  });

  it("reports a stall the browser announced itself", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("stalled"));
    vi.advanceTimersByTime(STALL_TIMEOUT_MS);

    expect(heard.onFailure).toHaveBeenCalledWith("stall");
  });

  it("calls off the stall watch as soon as the stream moves again", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("waiting"));
    node.dispatchEvent(new Event("timeupdate"));
    vi.advanceTimersByTime(STALL_TIMEOUT_MS * 2);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });

  it("reports a stream the browser rejected", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("error"));

    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });
});

const NEXT = { url: "/stream/b", gainFactor: 0.5, fadeSeconds: 0, curve: "equalPower" } as const;

describe("the deck that waits with the next track", () => {
  it("loads the next track on the standby deck, silent and unplayed, without touching the one that is sounding", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    engine.prime(NEXT);

    expect(node.src).toBe("/stream/a");
    expect(standby().src).toBe("/stream/b");
    expect(standby().load).toHaveBeenCalled();
    expect(standby().play).not.toHaveBeenCalled();
    expect(engine.primedUrl()).toBe("/stream/b");
  });

  it("loads the same next track only once, however often it is asked for", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    engine.prime(NEXT);
    engine.prime({ ...NEXT, fadeSeconds: 5 });

    expect(standby().load).toHaveBeenCalledTimes(1);
    expect(engine.primedUrl()).toBe("/stream/b");
  });

  it("lets the readied track go when what comes next changes", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);

    engine.cancelPrime();

    expect(standby().removeAttribute).toHaveBeenCalledWith("src");
    expect(engine.primedUrl()).toBeNull();
  });

  it("drops a readied track the browser could not load, without reporting a failure on the one playing", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);

    standby().dispatchEvent(new Event("error"));

    expect(heard.onFailure).not.toHaveBeenCalled();
    expect(engine.primedUrl()).toBeNull();
  });

  it("hands over to the readied deck a few milliseconds before the end and says which track took over", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);
    node.duration = 200;
    node.currentTime = 199;
    node.dispatchEvent(new Event("timeupdate"));

    node.currentTime = 199.5;
    vi.advanceTimersByTime(HANDOFF_POLL_MS);
    expect(standby().play).not.toHaveBeenCalled();

    node.currentTime = 199.995;
    vi.advanceTimersByTime(HANDOFF_POLL_MS);

    expect(standby().play).toHaveBeenCalled();
    expect(heard.onHandoff).toHaveBeenCalledWith("/stream/b");
    expect(heard.onEnded).not.toHaveBeenCalled();
    expect(engine.primedUrl()).toBeNull();
  });

  it("hands over at the end when the browser never said how long the track was", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);

    node.dispatchEvent(new Event("ended"));

    expect(standby().play).toHaveBeenCalled();
    expect(heard.onHandoff).toHaveBeenCalledWith("/stream/b");
    expect(heard.onEnded).not.toHaveBeenCalled();
  });

  it("listens to the deck that took over and no longer to the one it left, which is released at once without a graph", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);
    node.dispatchEvent(new Event("ended"));
    vi.mocked(heard.onProgress).mockClear();

    expect(node.removeAttribute).toHaveBeenCalledWith("src");

    standby().currentTime = 3;
    standby().duration = 100;
    standby().dispatchEvent(new Event("timeupdate"));
    node.currentTime = 200;
    node.dispatchEvent(new Event("timeupdate"));
    node.dispatchEvent(new Event("ended"));

    expect(heard.onProgress).toHaveBeenCalledTimes(1);
    expect(heard.onProgress).toHaveBeenCalledWith(3, 100);
    expect(heard.onEnded).not.toHaveBeenCalled();
  });

  it("does not ask again for a readied track the browser refused, until the next manual load", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);
    standby().dispatchEvent(new Event("error"));

    engine.prime(NEXT);
    expect(standby().load).toHaveBeenCalledTimes(1);
    expect(engine.primedUrl()).toBeNull();

    engine.loadAndPlay("/stream/c", 1, false);
    engine.prime(NEXT);
    expect(standby().load).toHaveBeenCalledTimes(2);
    expect(engine.primedUrl()).toBe("/stream/b");
  });

  it("stops watching the end once the listener has seeked away from it", async () => {
    vi.useFakeTimers();
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);
    node.duration = 200;
    node.currentTime = 199;
    node.dispatchEvent(new Event("timeupdate"));

    node.currentTime = 10;
    vi.advanceTimersByTime(HANDOFF_POLL_MS);
    node.currentTime = 199.995;
    vi.advanceTimersByTime(HANDOFF_POLL_MS * 10);
    expect(standby().play).not.toHaveBeenCalled();

    node.dispatchEvent(new Event("timeupdate"));
    vi.advanceTimersByTime(HANDOFF_POLL_MS);
    expect(standby().play).toHaveBeenCalled();
  });

  it("reports a handed-over deck that never produced a frame", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);
    node.dispatchEvent(new Event("ended"));

    vi.advanceTimersByTime(LOAD_TIMEOUT_MS);

    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });

  it("says it is loading when the deck that took over has nothing buffered yet", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);
    standby().readyState = 0;
    vi.mocked(heard.onLoadingChange).mockClear();

    node.dispatchEvent(new Event("ended"));

    expect(heard.onLoadingChange).toHaveBeenCalledWith(true);
  });

  it("ends the queue as before when nothing was readied", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    node.dispatchEvent(new Event("ended"));

    expect(heard.onEnded).toHaveBeenCalled();
    expect(heard.onHandoff).not.toHaveBeenCalled();
  });

  it("starts the next manual track on the deck that is sounding when it cannot blend, as it always did", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);

    engine.crossfadeTo("/stream/c", { seconds: 4, curve: "linear", gainFactor: 1 }, 1, false);

    expect(node.src).toBe("/stream/c");
    expect(node.play).toHaveBeenCalledTimes(2);
    expect(engine.primedUrl()).toBeNull();
  });
});

class FakeParam {
  value = 1;
  readonly setTargetAtTime = vi.fn();
  readonly setValueAtTime = vi.fn();
  readonly setValueCurveAtTime = vi.fn();
  readonly cancelScheduledValues = vi.fn();
}

class FakeNode {
  type = "";
  fftSize = 0;
  smoothingTimeConstant = 0;
  readonly frequencyBinCount = 1024;
  readonly gain = new FakeParam();
  readonly frequency = { value: 0 };
  readonly Q = { value: 0 };
  readonly threshold = { value: 0 };
  readonly ratio = { value: 1 };
  readonly attack = { value: 0 };
  readonly release = { value: 0 };
  readonly knee = { value: 0 };
  readonly connect = vi.fn();
  readonly disconnect = vi.fn();
}

class FakeContext {
  readonly sampleRate = 48_000;
  readonly destination = {};
  readonly currentTime = 0;
  readonly deckGains = new Map<unknown, FakeNode>();
  private taken: unknown = null;

  createAnalyser(): FakeNode {
    return new FakeNode();
  }

  createGain(): FakeNode {
    const gain = new FakeNode();
    if (this.taken !== null) {
      this.deckGains.set(this.taken, gain);
      this.taken = null;
    }
    return gain;
  }

  createBiquadFilter(): FakeNode {
    return new FakeNode();
  }

  createDynamicsCompressor(): FakeNode {
    return new FakeNode();
  }

  createMediaElementSource(element: unknown): FakeNode {
    this.taken = element;
    return new FakeNode();
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }
}

describe("blending two decks through the audio graph", () => {
  let context: FakeContext;

  beforeEach(() => {
    context = new FakeContext();
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          return context;
        }
      }
    );
  });

  function deckGain(element: FakeAudio): FakeParam {
    const found = context.deckGains.get(element);
    if (found === undefined) throw new Error("the graph never took that deck");
    return found.gain;
  }

  it("takes both decks into the graph the moment playback starts, so a later handover needs no new source", async () => {
    const { engine } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);

    expect(context.deckGains.size).toBe(2);
  });

  it("fades the leaving deck out and the readied deck in over the blend the plan asked for", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime({ ...NEXT, fadeSeconds: 5, curve: "linear" });
    expect(deckGain(standby()).setValueAtTime).toHaveBeenCalledWith(0, 0);

    node.dispatchEvent(new Event("ended"));

    const out = deckGain(node).setValueCurveAtTime.mock.calls[0];
    const into = deckGain(standby()).setValueCurveAtTime.mock.calls[0];
    expect(out?.[2]).toBe(5);
    expect(into?.[2]).toBe(5);
    expect(out?.[0]?.[0]).toBeCloseTo(1, 6);
    expect(out?.[0]?.at(-1)).toBeCloseTo(0, 6);
    expect(into?.[0]?.[0]).toBeCloseTo(0, 6);
    expect(into?.[0]?.at(-1)).toBeCloseTo(0.5, 6);
    expect(heard.onHandoff).toHaveBeenCalledWith("/stream/b");
  });

  it("blends a gapless handover over a seam of a few milliseconds rather than cutting", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime(NEXT);

    node.dispatchEvent(new Event("ended"));

    expect(deckGain(standby()).setValueCurveAtTime.mock.calls[0]?.[2]).toBe(SEAM_FADE_SECONDS);
  });

  it("starts a skipped-to track on the standby deck and blends once it is sounding", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    node.dispatchEvent(new Event("playing"));

    engine.crossfadeTo("/stream/c", { seconds: 4, curve: "equalPower", gainFactor: 1 }, 1, false);

    expect(standby().src).toBe("/stream/c");
    expect(standby().play).toHaveBeenCalled();
    expect(deckGain(standby()).setValueCurveAtTime).not.toHaveBeenCalled();

    standby().dispatchEvent(new Event("playing"));

    expect(deckGain(node).setValueCurveAtTime.mock.calls[0]?.[2]).toBe(4);
    expect(deckGain(standby()).setValueCurveAtTime.mock.calls[0]?.[2]).toBe(4);
    expect(heard.onPlayingChange).toHaveBeenLastCalledWith(true);

    standby().currentTime = 2;
    standby().duration = 90;
    standby().dispatchEvent(new Event("timeupdate"));
    expect(heard.onProgress).toHaveBeenLastCalledWith(2, 90);
  });

  it("cuts the blend short when the listener pauses or seeks, leaving only the deck that took over", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime({ ...NEXT, fadeSeconds: 5 });
    node.dispatchEvent(new Event("ended"));

    engine.pause();

    expect(node.removeAttribute).toHaveBeenCalledWith("src");
    expect(standby().pause).toHaveBeenCalled();
  });

  it("reports a skipped-to track the browser could not load, so the store can move on", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    node.dispatchEvent(new Event("playing"));
    engine.crossfadeTo("/stream/c", { seconds: 4, curve: "equalPower", gainFactor: 1 }, 1, false);

    standby().dispatchEvent(new Event("error"));

    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });

  it("keeps the leaving deck sounding through the blend and releases it once the blend is over", async () => {
    vi.useFakeTimers();
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    engine.prime({ ...NEXT, fadeSeconds: 5 });
    node.dispatchEvent(new Event("ended"));

    vi.advanceTimersByTime(5000 + OUTGOING_RELEASE_MARGIN_MS - 1);
    expect(node.removeAttribute).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(node.removeAttribute).toHaveBeenCalledWith("src");
  });

  it("keeps a blended skip paused when the listener pauses before it sounds, landing on the new track", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    node.dispatchEvent(new Event("playing"));
    engine.crossfadeTo("/stream/c", { seconds: 4, curve: "equalPower", gainFactor: 1 }, 1, false);
    vi.mocked(heard.onPlayingChange).mockClear();

    engine.pause();

    expect(standby().pause).toHaveBeenCalled();
    expect(node.removeAttribute).toHaveBeenCalledWith("src");
    expect(heard.onPlayingChange).not.toHaveBeenCalledWith(true);

    standby().currentTime = 4;
    standby().duration = 90;
    standby().dispatchEvent(new Event("timeupdate"));
    expect(heard.onProgress).toHaveBeenLastCalledWith(4, 90);
  });

  it("silences a deck still loading a blended skip when a manual load replaces it", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    node.dispatchEvent(new Event("playing"));
    engine.crossfadeTo("/stream/c", { seconds: 4, curve: "equalPower", gainFactor: 1 }, 1, false);
    vi.mocked(heard.onPlayingChange).mockClear();

    engine.loadAndPlay("/stream/d", 1, false);

    expect(standby().removeAttribute).toHaveBeenCalledWith("src");
    expect(node.src).toBe("/stream/d");
    standby().dispatchEvent(new Event("playing"));
    expect(heard.onPlayingChange).not.toHaveBeenCalled();
  });

  it("seeks the track that is arriving rather than the one leaving, during a blended skip", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);
    node.dispatchEvent(new Event("playing"));
    node.currentTime = 50;
    engine.crossfadeTo("/stream/c", { seconds: 4, curve: "equalPower", gainFactor: 1 }, 1, false);

    engine.seek(30);

    expect(standby().currentTime).toBe(30);
    expect(node.currentTime).toBe(50);
  });
});
