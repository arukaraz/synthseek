import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOAD_TIMEOUT_MS,
  OUTGOING_RELEASE_MARGIN_MS,
  PCM_FEED_TICK_MS,
  PCM_LEAD_SECONDS,
  PCM_PROGRESS_MS,
  PCM_START_LEAD_SECONDS,
  STALL_TIMEOUT_MS,
} from "../constants";
import type { EngineCallbacks, PcmBuffer, PcmSource } from "../types";

const energy = vi.hoisted(() => ({ followAudio: vi.fn(), followGraph: vi.fn(), stopFollowingAudio: vi.fn() }));
const keepalive = vi.hoisted(() => ({ keepAlive: vi.fn(), releaseKeepAlive: vi.fn() }));
const sources = vi.hoisted(() => ({
  specs: new Map<
    string,
    {
      duration: number;
      trim: number;
      chunk: number;
      fail: boolean;
      padding?: number;
      failAfter?: number;
      hangAfter?: number;
      firstAfterMs?: number;
      shortBy?: number;
    }
  >(),
  opened: [] as string[],
  disposed: [] as string[],
}));

vi.mock("../energy", () => energy);
vi.mock("../keepalive", () => keepalive);
vi.mock("../pcm-source", () => ({
  openPcmSource: async (url: string): Promise<PcmSource> => {
    const spec = sources.specs.get(url) ?? { duration: 30, trim: 0, chunk: 1, fail: false };
    sources.opened.push(url);
    if (spec.fail) throw new Error("cannot open");
    const rawEnd = spec.duration + spec.trim + (spec.padding ?? 0) - (spec.shortBy ?? 0);
    return {
      durationSeconds: spec.duration,
      sampleRate: 44100,
      trimStartSeconds: spec.trim,
      buffers: async function* (fromSeconds: number): AsyncGenerator<PcmBuffer, void, unknown> {
        let yielded = 0;
        if (spec.firstAfterMs !== undefined) {
          await new Promise((resolve) => setTimeout(resolve, spec.firstAfterMs));
        }
        for (let at = fromSeconds; at < rawEnd; at += spec.chunk) {
          if (spec.failAfter !== undefined && yielded >= spec.failAfter) throw new Error("decoder died");
          if (spec.hangAfter !== undefined && yielded >= spec.hangAfter) await new Promise(() => undefined);
          yielded += 1;
          const duration = Math.min(spec.chunk, rawEnd - at);
          const buffer = { duration, length: Math.round(duration * 44100), sampleRate: 44100 };
          yield { buffer: buffer as unknown as AudioBuffer, timestamp: at, duration };
        }
      },
      dispose: () => {
        sources.disposed.push(url);
      },
    };
  },
}));

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
  buffer: unknown = null;
  onended: (() => void) | null = null;
  readonly connect = vi.fn();
  readonly disconnect = vi.fn();
  readonly start = vi.fn();
  readonly stop = vi.fn();
}

class FakeContext {
  readonly sampleRate = 48_000;
  readonly destination = {};
  currentTime = 0;
  readonly gains: FakeNode[] = [];
  readonly sources: FakeNode[] = [];

  createAnalyser(): FakeNode {
    return new FakeNode();
  }

  createGain(): FakeNode {
    const gain = new FakeNode();
    this.gains.push(gain);
    return gain;
  }

  createBiquadFilter(): FakeNode {
    return new FakeNode();
  }

  createDynamicsCompressor(): FakeNode {
    return new FakeNode();
  }

  createMediaElementSource(): FakeNode {
    return new FakeNode();
  }

  createBufferSource(): FakeNode {
    const node = new FakeNode();
    this.sources.push(node);
    return node;
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }
}

let context: FakeContext;

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

async function freshEngine(): Promise<{ engine: typeof import("../pcm-engine"); heard: EngineCallbacks }> {
  vi.resetModules();
  const engine = await import("../pcm-engine");
  const heard = callbacks();
  engine.connectEngine(heard);
  return { engine, heard };
}

async function settle(ms = 0): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
}

function startsOf(): number[] {
  return context.sources.map((node) => Number(node.start.mock.calls[0]?.[0]));
}

function deckGainOf(index: number): FakeParam {
  const gain = context.gains[index];
  if (gain === undefined) throw new Error(`no gain at ${index}`);
  return gain.gain;
}

const A = "/stream/a";
const B = "/stream/b";

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  sources.specs.clear();
  sources.opened.length = 0;
  sources.disposed.length = 0;
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

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("feeding one track into the graph", () => {
  it("builds the graph inside the play call itself, before the stream has been opened", async () => {
    const { engine } = await freshEngine();

    engine.loadAndPlay(A, 1, false);

    expect(context.gains.length).toBeGreaterThan(0);
  });

  it("schedules each decoded buffer on the audio clock, sample-aligned, from a small lead", async () => {
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay(A, 0.8, false);
    await settle();

    expect(heard.onLoadingChange).toHaveBeenCalledWith(true);
    expect(heard.onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(heard.onPlayingChange).toHaveBeenCalledWith(true);
    expect(keepalive.keepAlive).toHaveBeenCalled();
    expect(energy.followGraph).toHaveBeenCalled();
    expect(startsOf().slice(0, 3)).toEqual([
      PCM_START_LEAD_SECONDS,
      PCM_START_LEAD_SECONDS + 1,
      PCM_START_LEAD_SECONDS + 2,
    ]);
    expect(context.sources[0]?.start).toHaveBeenCalledWith(PCM_START_LEAD_SECONDS, 0, 1);
  });

  it("stops decoding ahead once the lead is full, and continues as time passes", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    expect(context.sources).toHaveLength(PCM_LEAD_SECONDS);

    context.currentTime = 5;
    await settle(PCM_FEED_TICK_MS * 2);

    expect(context.sources).toHaveLength(PCM_LEAD_SECONDS + 5);
  });

  it("re-anchors the feed when the clock has run past what was scheduled, so playback carries on from there", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    context.currentTime = 12.3;
    await settle(PCM_FEED_TICK_MS);

    const next = context.sources[PCM_LEAD_SECONDS]?.start.mock.calls[0] ?? [];
    expect(Number(next[0])).toBeCloseTo(12.3 + PCM_START_LEAD_SECONDS, 9);
    expect(next[1]).toBe(0);
    await settle(250);
    const last = vi.mocked(heard.onProgress).mock.calls.at(-1) ?? [];
    expect(Number(last[0])).toBeCloseTo(PCM_LEAD_SECONDS - PCM_START_LEAD_SECONDS, 9);
  });

  it("skips the mp3 encoder delay: the first buffer starts inside itself and the tail is cut at the true end", async () => {
    sources.specs.set(A, { duration: 2, trim: 0.025, chunk: 0.5, fail: false, padding: 0.1 });
    const { engine } = await freshEngine();

    engine.loadAndPlay(A, 1, false);
    await settle();

    const first = context.sources[0]?.start.mock.calls[0] ?? [];
    expect(Number(first[0])).toBeCloseTo(PCM_START_LEAD_SECONDS, 9);
    expect(Number(first[1])).toBeCloseTo(0.025, 9);
    expect(Number(first[2])).toBeCloseTo(0.475, 9);
    const last = context.sources[context.sources.length - 1];
    expect(Number(last?.start.mock.calls[0]?.[2])).toBeCloseTo(0.025, 9);
    expect(context.sources).toHaveLength(5);
  });

  it("reports the position from the audio clock while playing", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    context.currentTime = 3.2;
    await settle(250);

    const last = vi.mocked(heard.onProgress).mock.calls.at(-1) ?? [];
    expect(Number(last[0])).toBeCloseTo(3.2 - PCM_START_LEAD_SECONDS, 9);
    expect(last[1]).toBe(30);
  });

  it("reports a track that could not be opened, and one that never scheduled a frame", async () => {
    sources.specs.set(A, { duration: 30, trim: 0, chunk: 1, fail: true });
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay(A, 1, false);
    await settle();
    expect(heard.onFailure).toHaveBeenCalledWith("load");

    heard.onFailure = vi.fn();
    engine.connectEngine(heard);
    sources.specs.set(B, { duration: 0, trim: 0, chunk: 1, fail: false });
    engine.loadAndPlay(B, 1, false);
    await settle(LOAD_TIMEOUT_MS);
    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });

  it("reports a decoder that dies mid-track, and lets a finished buffer's node go", async () => {
    sources.specs.set(A, { duration: 30, trim: 0, chunk: 1, fail: false, failAfter: 3 });
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay(A, 1, false);
    await settle();

    expect(context.sources).toHaveLength(3);
    expect(heard.onFailure).toHaveBeenCalledWith("load");

    context.sources[0]?.onended?.();
    engine.pause();
    expect(context.sources[0]?.stop).not.toHaveBeenCalled();
    expect(context.sources[1]?.stop).toHaveBeenCalled();
  });

  it("throws away a track that finished opening after another one was asked for", async () => {
    const { engine } = await freshEngine();

    engine.loadAndPlay(A, 1, false);
    engine.loadAndPlay(B, 1, false);
    await settle();

    expect(sources.disposed).toEqual([A]);
    expect(context.sources.every((node) => node.connect.mock.calls[0]?.[0] === context.gains.at(-1))).toBe(true);
  });

  it("gives the track its correction on its own deck, landing at once before it sounds", async () => {
    const { engine } = await freshEngine();
    engine.setActiveTrackGain(0.4);

    engine.loadAndPlay(A, 1, false);
    await settle();

    expect(deckGainOf(2).setValueAtTime).toHaveBeenCalledWith(0.4, 0);
  });
});

describe("pausing, resuming and seeking", () => {
  it("pauses by stopping every scheduled buffer and resumes from the same position", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    context.currentTime = 3.25;

    engine.pause();

    expect(context.sources.every((node) => node.stop.mock.calls.length === 1)).toBe(true);
    expect(heard.onPlayingChange).toHaveBeenLastCalledWith(false);
    expect(keepalive.releaseKeepAlive).toHaveBeenCalled();

    const before = context.sources.length;
    engine.resume();
    await settle();

    const first = context.sources[before]?.start.mock.calls[0] ?? [];
    expect(Number(first[0])).toBeCloseTo(3.25 + PCM_START_LEAD_SECONDS, 9);
    expect(first[1]).toBe(0);
    expect(first[2]).toBe(1);
    expect(heard.onPlayingChange).toHaveBeenLastCalledWith(true);
  });

  it("seeks by restarting the feed at the new position, and only moves the marker while paused", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    context.currentTime = 2;
    const before = context.sources.length;

    engine.seek(20);
    await settle();

    expect(context.sources[before]?.start).toHaveBeenCalledWith(2 + PCM_START_LEAD_SECONDS, 0, 1);
    expect(heard.onProgress).toHaveBeenCalledWith(20, 30);

    engine.pause();
    const paused = context.sources.length;
    engine.seek(25);
    await settle();
    expect(context.sources).toHaveLength(paused);
    expect(heard.onProgress).toHaveBeenLastCalledWith(25, 30);
  });

  it("arms a paused track without decoding anything", async () => {
    const { engine, heard } = await freshEngine();

    engine.loadAt(A, 12, 1, false);
    await settle();

    expect(context.sources).toHaveLength(0);
    expect(heard.onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(heard.onProgress).toHaveBeenLastCalledWith(12, 30);
    expect(keepalive.keepAlive).not.toHaveBeenCalled();
  });
});

describe("the seam between two tracks", () => {
  async function playToTheEnd(engine: typeof import("../pcm-engine")): Promise<void> {
    sources.specs.set(A, { duration: 10, trim: 0, chunk: 1, fail: false });
    engine.loadAndPlay(A, 1, false);
    await settle();
    context.currentTime = 4;
    await settle(PCM_FEED_TICK_MS * 3);
  }

  it("starts the readied track exactly where the current one ends, with its own correction", async () => {
    const { engine, heard } = await freshEngine();
    await playToTheEnd(engine);
    const scheduledA = context.sources.length;

    engine.prime({ url: B, gainFactor: 0.5, fadeSeconds: 0, curve: "equalPower" });
    await settle();

    const firstB = context.sources[scheduledA];
    expect(firstB?.start).toHaveBeenCalledWith(PCM_START_LEAD_SECONDS + 10, 0, 1);
    expect(deckGainOf(3).setValueAtTime).toHaveBeenCalledWith(0.5, 4);
    expect(heard.onHandoff).not.toHaveBeenCalled();

    context.currentTime = PCM_START_LEAD_SECONDS + 10;
    await settle(PCM_FEED_TICK_MS);

    expect(heard.onHandoff).toHaveBeenCalledWith(B);
    expect(heard.onEnded).not.toHaveBeenCalled();
    await settle(OUTGOING_RELEASE_MARGIN_MS);
    expect(sources.disposed).toContain(A);
  });

  it("seams on the last decoded sample when the container claims more than the decoder yields", async () => {
    sources.specs.set(A, { duration: 10, trim: 0, chunk: 1, fail: false, shortBy: 0.0065 });
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    context.currentTime = 4;
    await settle(PCM_FEED_TICK_MS * 3);
    const scheduledA = context.sources.length;

    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();

    const seam = PCM_START_LEAD_SECONDS + 10 - 0.0065;
    expect(Number(context.sources[scheduledA]?.start.mock.calls[0]?.[0])).toBeCloseTo(seam, 6);
    context.currentTime = seam + 0.001;
    await settle(PCM_FEED_TICK_MS);
    expect(heard.onHandoff).toHaveBeenCalledWith(B);
  });

  it("blends into the readied track over the fade, starting it that much earlier", async () => {
    const { engine } = await freshEngine();
    await playToTheEnd(engine);
    const scheduledA = context.sources.length;

    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 4, curve: "linear" });
    await settle();

    const seam = PCM_START_LEAD_SECONDS + 10;
    expect(Number(context.sources[scheduledA]?.start.mock.calls[0]?.[0])).toBeCloseTo(seam - 4, 9);
    expect(Number(deckGainOf(3).setValueCurveAtTime.mock.calls[0]?.[1])).toBeCloseTo(seam - 4, 9);
    expect(deckGainOf(3).setValueCurveAtTime.mock.calls[0]?.[2]).toBe(4);
    expect(Number(deckGainOf(2).setValueCurveAtTime.mock.calls[0]?.[1])).toBeCloseTo(seam - 4, 9);
  });

  it("schedules a readied track again when its blend or correction changes after it was scheduled", async () => {
    const { engine } = await freshEngine();
    await playToTheEnd(engine);
    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    const seam = PCM_START_LEAD_SECONDS + 10;
    const firstB = context.sources.length - 1;
    const before = context.sources.length;

    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    expect(context.sources).toHaveLength(before);

    engine.prime({ url: B, gainFactor: 0.5, fadeSeconds: 4, curve: "linear" });
    await settle();

    expect(sources.opened.filter((url) => url === B)).toHaveLength(1);
    expect(context.sources[firstB]?.stop).toHaveBeenCalled();
    expect(Number(context.sources[before]?.start.mock.calls[0]?.[0])).toBeCloseTo(seam - 4, 9);
    expect(deckGainOf(2).setTargetAtTime).toHaveBeenCalledWith(1, 4, expect.any(Number));
    expect(Number(deckGainOf(2).setValueCurveAtTime.mock.calls[0]?.[1])).toBeCloseTo(seam - 4, 9);

    engine.setActiveTrackGain(0.8);
    await settle();
    expect(deckGainOf(2).setValueCurveAtTime).toHaveBeenCalledTimes(2);
    expect(deckGainOf(2).setValueCurveAtTime.mock.calls[1]?.[0][0]).toBeCloseTo(0.8, 6);
  });

  it("keeps the current track at its level when a readied blend is paused, seeked away or cancelled", async () => {
    const { engine } = await freshEngine();
    await playToTheEnd(engine);
    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 4, curve: "linear" });
    await settle();
    expect(deckGainOf(2).setValueCurveAtTime).toHaveBeenCalledTimes(1);

    engine.pause();
    expect(deckGainOf(2).setValueAtTime).toHaveBeenLastCalledWith(1, 4);

    engine.resume();
    await settle(PCM_FEED_TICK_MS);
    expect(deckGainOf(2).setValueCurveAtTime).toHaveBeenCalledTimes(2);
    context.currentTime = 5;
    engine.seek(6);
    expect(deckGainOf(2).setValueAtTime).toHaveBeenLastCalledWith(1, 5);

    await settle(PCM_FEED_TICK_MS * 3);
    expect(deckGainOf(2).setValueCurveAtTime).toHaveBeenCalledTimes(3);
    engine.cancelPrime();
    expect(deckGainOf(2).setTargetAtTime).toHaveBeenLastCalledWith(1, 5, expect.any(Number));
  });

  it("reports loading when the seam arrives before the readied track has a frame, and clears it when one lands", async () => {
    const { engine, heard } = await freshEngine();
    await playToTheEnd(engine);
    sources.specs.set(B, { duration: 30, trim: 0, chunk: 1, fail: false, firstAfterMs: 1000 });
    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();

    context.currentTime = PCM_START_LEAD_SECONDS + 10;
    await settle(PCM_FEED_TICK_MS);
    expect(heard.onHandoff).toHaveBeenCalledWith(B);
    expect(heard.onLoadingChange).toHaveBeenLastCalledWith(true);

    await settle(1000);
    expect(heard.onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(heard.onPlayingChange).toHaveBeenLastCalledWith(true);
    await settle(LOAD_TIMEOUT_MS);
    expect(heard.onFailure).not.toHaveBeenCalled();
  });

  it("ends the queue when nothing was readied", async () => {
    const { engine, heard } = await freshEngine();
    await playToTheEnd(engine);

    context.currentTime = PCM_START_LEAD_SECONDS + 10;
    await settle(PCM_FEED_TICK_MS);

    expect(heard.onEnded).toHaveBeenCalled();
    expect(heard.onProgress).toHaveBeenLastCalledWith(10, 10);
    expect(keepalive.releaseKeepAlive).toHaveBeenCalled();
  });

  it("lets go of a readied track on request, and does not ask again for one that failed", async () => {
    const { engine } = await freshEngine();
    await playToTheEnd(engine);
    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();

    engine.cancelPrime();
    expect(sources.disposed).toContain(B);
    expect(engine.primedUrl()).toBeNull();

    sources.specs.set("/stream/c", { duration: 5, trim: 0, chunk: 1, fail: true });
    engine.prime({ url: "/stream/c", gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    engine.prime({ url: "/stream/c", gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    expect(sources.opened.filter((url) => url === "/stream/c")).toHaveLength(1);

    sources.specs.set("/stream/d", { duration: 5, trim: 0, chunk: 1, fail: false, failAfter: 1 });
    engine.prime({ url: "/stream/d", gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    expect(engine.primedUrl()).toBeNull();
    engine.prime({ url: "/stream/d", gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    expect(sources.opened.filter((url) => url === "/stream/d")).toHaveLength(1);
  });

  it("reuses a readied track when the listener jumps to it by hand", async () => {
    const { engine } = await freshEngine();
    await playToTheEnd(engine);
    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();
    sources.opened.length = 0;

    engine.loadAndPlay(B, 1, false);
    await settle();

    expect(sources.opened).toEqual([]);
    expect(sources.disposed).toContain(A);
  });
});

describe("blending a manual skip", () => {
  it("starts the new track on its own deck at once and fades both over the blend", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    context.currentTime = 2;
    const before = context.sources.length;
    deckGainOf(2).value = 0.4;

    engine.crossfadeTo(B, { seconds: 3, curve: "equalPower", gainFactor: 1 }, 1, false);
    await settle();

    expect(context.sources[before]?.start).toHaveBeenCalledWith(2 + PCM_START_LEAD_SECONDS, 0, 1);
    expect(deckGainOf(3).setValueCurveAtTime.mock.calls[0]?.[2]).toBe(3);
    expect(deckGainOf(2).setValueCurveAtTime.mock.calls[0]?.[2]).toBe(3);
    expect(deckGainOf(2).setValueCurveAtTime.mock.calls[0]?.[0][0]).toBeCloseTo(0.4, 6);
    expect(heard.onLoadingChange).toHaveBeenLastCalledWith(false);

    await settle(3000 + OUTGOING_RELEASE_MARGIN_MS);
    expect(sources.disposed).toContain(A);
  });

  it("falls back to a plain load while paused", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    engine.pause();
    const before = context.sources.length;

    engine.crossfadeTo(B, { seconds: 3, curve: "equalPower", gainFactor: 1 }, 1, false);
    await settle();

    expect(sources.disposed).toContain(A);
    expect(context.sources[before]?.start).toHaveBeenCalledWith(PCM_START_LEAD_SECONDS, 0, 1);
  });
});

describe("stopping", () => {
  it("releases every deck, the sources and the keep-alive", async () => {
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    engine.prime({ url: B, gainFactor: 1, fadeSeconds: 0, curve: "equalPower" });
    await settle();

    engine.stop();

    expect(sources.disposed).toEqual(expect.arrayContaining([A, B]));
    expect(context.sources.every((node) => node.stop.mock.calls.length === 1)).toBe(true);
    expect(keepalive.releaseKeepAlive).toHaveBeenCalled();
    expect(energy.stopFollowingAudio).toHaveBeenCalled();
    expect(engine.primedUrl()).toBeNull();
    expect(heard.onFailure).not.toHaveBeenCalled();
  });

  it("only claims the formats the browser's decoder answered for", async () => {
    vi.stubGlobal("AudioDecoder", {
      isConfigSupported: vi.fn(async (config: AudioDecoderConfig) => ({ supported: config.codec !== "vorbis" })),
    });
    const { engine } = await freshEngine();
    await (await import("../pcm-support")).probePcmBackend();

    expect(engine.canPlayMime("audio/flac")).toBe(true);
    expect(engine.canPlayMime("audio/mpeg")).toBe(true);
    expect(engine.canPlayMime("audio/ogg")).toBe(false);
    expect(engine.canPlayMime("audio/x-ms-wma")).toBe(false);
  });
});

describe("a stream that stops delivering while it plays", () => {
  const silentFrom = PCM_START_LEAD_SECONDS + 3;
  const stallSeconds = STALL_TIMEOUT_MS / 1000;

  it("reports it once, when what it had has been silent for the stall timeout and not a second sooner", async () => {
    sources.specs.set(A, { duration: 60, trim: 0, chunk: 1, fail: false, hangAfter: 3 });
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    context.currentTime = silentFrom + stallSeconds - 1;
    await settle(PCM_PROGRESS_MS);
    expect(heard.onFailure).not.toHaveBeenCalled();

    context.currentTime = silentFrom + stallSeconds;
    await settle(PCM_PROGRESS_MS * 4);
    expect(heard.onFailure).toHaveBeenCalledTimes(1);
    expect(heard.onFailure).toHaveBeenCalledWith("stall");
  });

  it("reports a stream that never delivered its first frame once, not once as stalled and again as unloaded", async () => {
    sources.specs.set(A, { duration: 60, trim: 0, chunk: 1, fail: false, hangAfter: 0 });
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    context.currentTime = PCM_START_LEAD_SECONDS + stallSeconds;
    await settle(PCM_PROGRESS_MS);
    await settle(LOAD_TIMEOUT_MS);

    expect(heard.onFailure).toHaveBeenCalledTimes(1);
    expect(heard.onFailure).toHaveBeenCalledWith("stall");
  });

  it("never calls a paused track stalled, however long it waits", async () => {
    sources.specs.set(A, { duration: 60, trim: 0, chunk: 1, fail: false, hangAfter: 3 });
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    engine.pause();
    context.currentTime = silentFrom + stallSeconds * 4;
    await settle(PCM_PROGRESS_MS * 4);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });

  it("never calls a track stalled once all of it has been decoded", async () => {
    sources.specs.set(A, { duration: 5, trim: 0, chunk: 1, fail: false });
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();

    context.currentTime = 4;
    await settle(PCM_PROGRESS_MS * 4);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });

  it("counts the silence from a seek, not from before it", async () => {
    sources.specs.set(A, { duration: 60, trim: 0, chunk: 1, fail: false, hangAfter: 3 });
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay(A, 1, false);
    await settle();
    context.currentTime = silentFrom + stallSeconds - 1;
    await settle(PCM_PROGRESS_MS);

    engine.seek(30);
    await settle();
    context.currentTime += 5;
    await settle(PCM_PROGRESS_MS * 4);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });
});
