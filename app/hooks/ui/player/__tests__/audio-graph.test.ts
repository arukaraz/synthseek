import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EQUALIZER_BANDS_HZ, GAIN_RAMP_SECONDS } from "../constants";

let built: FakeContext | null = null;
let contextFails = false;

class FakeGain {
  readonly gain = {
    value: 1,
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    setValueCurveAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
  readonly connect = vi.fn();
  readonly disconnect = vi.fn();
}

interface FakeSource {
  connect: ReturnType<typeof vi.fn>;
}

class FakeFilter {
  type = "";
  readonly frequency = { value: 0 };
  readonly Q = { value: 0 };
  readonly gain = { value: 0, setTargetAtTime: vi.fn() };
  readonly connect = vi.fn();
  readonly disconnect = vi.fn();
}

class FakeCompressor {
  readonly threshold = { value: -24 };
  readonly ratio = { value: 12 };
  readonly attack = { value: 0.003 };
  readonly release = { value: 0.25 };
  readonly knee = { value: 30 };
  readonly connect = vi.fn();
  readonly disconnect = vi.fn();
}

class FakeContext {
  readonly sampleRate = 48_000;
  readonly destination = {};
  readonly currentTime = 7;
  readonly analyser = { fftSize: 0, smoothingTimeConstant: 0, frequencyBinCount: 1024, connect: vi.fn() };
  readonly gains: FakeGain[] = [];
  readonly filters: FakeFilter[] = [];
  readonly compressor = new FakeCompressor();
  readonly sources: FakeSource[] = [];

  static record(context: FakeContext): void {
    built = context;
  }

  constructor() {
    if (contextFails) throw new Error("AudioContext is unavailable");
    FakeContext.record(this);
  }

  get gainNode(): FakeGain | undefined {
    return this.gains[0];
  }

  get preamp(): FakeGain | undefined {
    return this.gains[1];
  }

  get deckGain(): FakeGain | undefined {
    return this.gains[2];
  }

  get source(): FakeSource | undefined {
    return this.sources[0];
  }

  createAnalyser(): FakeContext["analyser"] {
    return this.analyser;
  }

  createGain(): FakeGain {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }

  createBiquadFilter(): FakeFilter {
    const filter = new FakeFilter();
    this.filters.push(filter);
    return filter;
  }

  createDynamicsCompressor(): FakeCompressor {
    return this.compressor;
  }

  createMediaElementSource(): FakeSource {
    const source: FakeSource = { connect: vi.fn() };
    this.sources.push(source);
    return source;
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }
}

async function freshGraph(): Promise<typeof import("../audio-graph")> {
  vi.resetModules();
  return import("../audio-graph");
}

function element(): HTMLAudioElement {
  return document.createElement("audio");
}

function lastLevel(): number {
  const calls = built?.gainNode?.gain.setTargetAtTime.mock.calls ?? [];
  return Number(calls[calls.length - 1]?.[0]);
}

function lastDeckLevel(): number {
  const calls = built?.deckGain?.gain.setTargetAtTime.mock.calls ?? [];
  return Number(calls[calls.length - 1]?.[0]);
}

function lastFilter(): FakeFilter | undefined {
  return built?.filters[built.filters.length - 1];
}

const MODERATE = { enabled: true, thresholdDb: -24, ratio: 4, attackMs: 20, releaseMs: 300, kneeDb: 3 };

beforeEach(() => {
  built = null;
  contextFails = false;
  vi.stubGlobal("AudioContext", FakeContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the one audio graph the player owns", () => {
  it("builds the chain once, because a media element can only be taken by one graph", async () => {
    const graph = await freshGraph();
    const node = element();

    const first = graph.attachGraph(node);
    const second = graph.attachGraph(node);

    expect(first).toBe(second);
    expect(built?.sources).toHaveLength(1);
  });

  it("gives a second element its own source and gain on the same chain, so two decks can sound at once", async () => {
    const graph = await freshGraph();
    const first = element();
    const second = element();

    const one = graph.attachGraph(first);
    const two = graph.attachGraph(second);

    expect(one).toBe(two);
    expect(built?.sources).toHaveLength(2);
    expect(built?.sources[1]?.connect).toHaveBeenCalledWith(built?.gains[3]);
    expect(built?.gains[3]?.connect).toHaveBeenCalledWith(built?.preamp);
  });

  it("hands the element's own level over to the gain, so one place decides how loud it plays", async () => {
    const graph = await freshGraph();
    const node = element();
    node.volume = 0.5;

    graph.attachGraph(node);

    expect(node.volume).toBe(1);
    expect(node.muted).toBe(false);
  });

  it("keeps the listener's volume on the shared gain and the track's correction on the track's own deck", async () => {
    const graph = await freshGraph();
    const node = element();
    graph.attachGraph(node);

    graph.setListenerVolume(0.5, false);
    graph.setTrackGain(node, 0.4);

    expect(lastLevel()).toBeCloseTo(0.5, 6);
    expect(lastDeckLevel()).toBeCloseTo(0.4, 6);
  });

  it("goes silent when muted, whatever correction the track asked for", async () => {
    const graph = await freshGraph();
    const node = element();
    graph.attachGraph(node);
    graph.setTrackGain(node, 1.4);

    graph.setListenerVolume(0.8, true);

    expect(lastLevel()).toBe(0);
  });

  it("remembers a correction asked for before the graph existed, and lands on it WITHOUT a ramp", async () => {
    const graph = await freshGraph();
    const node = element();

    graph.setTrackGain(node, 0.25);
    graph.setListenerVolume(1, false);
    graph.attachGraph(node);

    expect(built?.deckGain?.gain.value).toBeCloseTo(0.25, 6);
    expect(built?.deckGain?.gain.setTargetAtTime).not.toHaveBeenCalled();
    expect(built?.gainNode?.gain.value).toBe(1);
  });

  it("lands a correction without a ramp when asked to, which is how a deck starts silent before a fade", async () => {
    const graph = await freshGraph();
    const node = element();
    graph.attachGraph(node);

    graph.setTrackGain(node, 0, true);

    expect(built?.deckGain?.gain.setValueAtTime).toHaveBeenCalledWith(0, 7);
    expect(built?.deckGain?.gain.setTargetAtTime).not.toHaveBeenCalled();
    expect(graph.trackGainOf(node)).toBe(0);
  });

  it("refuses a correction that is not a usable number rather than silencing the track", async () => {
    const graph = await freshGraph();
    const node = element();
    graph.attachGraph(node);

    graph.setTrackGain(node, Number.NaN);

    expect(lastDeckLevel()).toBe(1);
  });

  it("fades a deck along the curve it was given, on the audio clock, and remembers where it lands", async () => {
    const graph = await freshGraph();
    const node = element();
    graph.attachGraph(node);
    const values = new Float32Array([1, 0.5, 0]);

    expect(graph.fadeTrackGain(node, values, 4)).toBe(true);

    expect(built?.deckGain?.gain.cancelScheduledValues).toHaveBeenCalledWith(7);
    expect(built?.deckGain?.gain.setValueCurveAtTime).toHaveBeenCalledWith(values, 7, 4);
    expect(graph.trackGainOf(node)).toBe(0);
  });

  it("cannot fade a deck the graph never took", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());

    expect(graph.fadeTrackGain(element(), new Float32Array([1, 0]), 2)).toBe(false);
  });

  it("schedules a fade in the future on the audio clock when asked, never in the past", async () => {
    const graph = await freshGraph();
    const node = element();
    graph.attachGraph(node);

    graph.fadeTrackGain(node, new Float32Array([1, 0]), 2, 30);
    expect(built?.deckGain?.gain.setValueCurveAtTime).toHaveBeenLastCalledWith(expect.any(Float32Array), 30, 2);

    graph.fadeTrackGain(node, new Float32Array([1, 0]), 2, 1);
    expect(built?.deckGain?.gain.setValueCurveAtTime).toHaveBeenLastCalledWith(expect.any(Float32Array), 7, 2);
  });

  it("opens a bus with its own gain for a voice that brings no element, on the same chain", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    const key = { voice: 1 };

    const bus = graph.attachBus(key);
    const again = graph.attachBus(key);

    expect(bus?.context).toBe(built);
    expect(bus?.gain).toBe(built?.gains[3]);
    expect(again?.gain).toBe(bus?.gain);
    expect(built?.gains[3]?.connect).toHaveBeenCalledWith(built?.preamp);
    expect(built?.sources).toHaveLength(1);
  });

  it("remembers a correction asked for a voice before its bus existed", async () => {
    const graph = await freshGraph();
    const key = { voice: 2 };

    graph.setTrackGain(key, 0.3);
    graph.attachBus(key);

    expect(built?.gains[2]?.gain.value).toBeCloseTo(0.3, 6);
  });

  it("releases a deck by disconnecting its nodes and forgetting its correction", async () => {
    const graph = await freshGraph();
    const key = { voice: 3 };
    const bus = graph.attachBus(key);
    graph.setTrackGain(key, 0.5);

    graph.releaseDeck(key);

    expect(bus?.gain.disconnect).toHaveBeenCalled();
    expect(graph.trackGainOf(key)).toBe(1);
    expect(graph.attachBus(key)?.gain).not.toBe(bus?.gain);
  });

  it("reads the level a deck is actually at, and the remembered one where there is no deck", async () => {
    const graph = await freshGraph();
    const key = { voice: 4 };
    graph.setTrackGain(key, 0.5);
    expect(graph.liveTrackGain(key)).toBe(0.5);

    const bus = graph.attachBus(key);
    if (bus !== null) bus.gain.gain.value = 0.2;

    expect(graph.liveTrackGain(key)).toBe(0.2);
  });

  it("tells the caller the volume did not land when the browser gave no graph", async () => {
    contextFails = true;
    const graph = await freshGraph();
    graph.attachGraph(element());

    expect(graph.setListenerVolume(0.5, false)).toBe(false);
  });

  it("stops asking a browser that already refused once", async () => {
    contextFails = true;
    const graph = await freshGraph();

    expect(graph.attachGraph(element())).toBeNull();
    expect(graph.attachGraph(element())).toBeNull();
    expect(built).toBeNull();
  });
});

const ROCK = [5, 4, 3, 1, -1, 1, 3, 4, 5, 5];
const BOOST_SIX = [0, 0, 0, 0, 0, 6, 0, 0, 0, 0];
const CUT_SIX = [-6, 0, 0, 0, 0, 0, 0, 0, 0, 0];

describe("the equaliser filters in the chain", () => {
  it("puts the deck gain, the preamp, then one peaking filter per ISO band, between the source and the gain, in order", async () => {
    const graph = await freshGraph();

    graph.attachGraph(element());

    const filters = built?.filters ?? [];
    expect(filters).toHaveLength(EQUALIZER_BANDS_HZ.length);
    expect(filters.map((filter) => filter.type)).toEqual(EQUALIZER_BANDS_HZ.map(() => "peaking"));
    expect(filters.map((filter) => filter.frequency.value)).toEqual([...EQUALIZER_BANDS_HZ]);
    expect(built?.source?.connect).toHaveBeenCalledWith(built?.deckGain);
    expect(built?.deckGain?.connect).toHaveBeenCalledWith(built?.preamp);
    expect(built?.preamp?.connect).toHaveBeenCalledWith(filters[0]);
    filters.slice(0, -1).forEach((filter, band) => expect(filter.connect).toHaveBeenCalledWith(filters[band + 1]));
    expect(lastFilter()?.connect).toHaveBeenCalledWith(built?.gainNode);
    expect(built?.compressor.connect).not.toHaveBeenCalled();
  });

  it("starts each filter on the curve asked for before the graph existed, without a ramp", async () => {
    const graph = await freshGraph();

    graph.setEqualizerGains(ROCK);
    graph.attachGraph(element());

    expect(built?.filters.map((filter) => filter.gain.value)).toEqual(ROCK);
    for (const filter of built?.filters ?? []) expect(filter.gain.setTargetAtTime).not.toHaveBeenCalled();
  });

  it("ramps a new curve onto a graph that already exists", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());

    graph.setEqualizerGains(ROCK);

    built?.filters.forEach((filter, band) =>
      expect(filter.gain.setTargetAtTime).toHaveBeenCalledWith(ROCK[band], 7, GAIN_RAMP_SECONDS)
    );
  });

  it("lowers the output by the loudest point of the curve, which for a lone band is its own gain", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    graph.setListenerVolume(1, false);

    graph.setEqualizerGains(BOOST_SIX);

    expect(lastLevel()).toBeCloseTo(Math.pow(10, -6 / 20), 6);
  });

  it("leaves the output alone for a curve that only cuts", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    graph.setListenerVolume(1, false);

    graph.setEqualizerGains(CUT_SIX);

    expect(lastLevel()).toBe(1);
  });

  it("folds the headroom into a level decided before the graph existed, leaving the track's correction to its deck", async () => {
    const graph = await freshGraph();
    const node = element();

    graph.setEqualizerGains(BOOST_SIX);
    graph.setTrackGain(node, 0.5);
    graph.setListenerVolume(1, false);
    graph.attachGraph(node);

    expect(built?.gainNode?.gain.value).toBeCloseTo(Math.pow(10, -6 / 20), 6);
    expect(built?.deckGain?.gain.value).toBeCloseTo(0.5, 6);
  });
});

describe("the preamp ahead of the filters", () => {
  it("starts on the gain asked for before the graph existed", async () => {
    const graph = await freshGraph();

    graph.setEqualizerPreamp(6);
    graph.attachGraph(element());

    expect(built?.preamp?.gain.value).toBeCloseTo(Math.pow(10, 6 / 20), 6);
  });

  it("ramps a new gain onto a graph that already exists", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());

    graph.setEqualizerPreamp(-3);

    expect(built?.preamp?.gain.setTargetAtTime).toHaveBeenCalledWith(Math.pow(10, -3 / 20), 7, GAIN_RAMP_SECONDS);
  });
});

describe("the compressor after the filters", () => {
  it("is wired in with its settings when the graph is built while it is on", async () => {
    const graph = await freshGraph();

    graph.setCompressor(MODERATE);
    graph.attachGraph(element());

    expect(lastFilter()?.connect).toHaveBeenCalledWith(built?.compressor);
    expect(built?.compressor.connect).toHaveBeenCalledWith(built?.gainNode);
    expect(built?.compressor.threshold.value).toBe(-24);
    expect(built?.compressor.ratio.value).toBe(4);
    expect(built?.compressor.attack.value).toBeCloseTo(0.02, 6);
    expect(built?.compressor.release.value).toBeCloseTo(0.3, 6);
    expect(built?.compressor.knee.value).toBe(3);
  });

  it("is spliced in when switched on later, and spliced out again when switched off", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    const tail = lastFilter();

    graph.setCompressor(MODERATE);

    expect(tail?.disconnect).toHaveBeenCalled();
    expect(tail?.connect).toHaveBeenLastCalledWith(built?.compressor);
    expect(built?.compressor.connect).toHaveBeenLastCalledWith(built?.gainNode);

    graph.setCompressor({ ...MODERATE, enabled: false });

    expect(built?.compressor.disconnect).toHaveBeenCalled();
    expect(tail?.connect).toHaveBeenLastCalledWith(built?.gainNode);
  });

  it("updates its settings in place without rewiring while it stays on", async () => {
    const graph = await freshGraph();
    graph.setCompressor(MODERATE);
    graph.attachGraph(element());
    const tail = lastFilter();
    tail?.disconnect.mockClear();

    graph.setCompressor({ ...MODERATE, ratio: 8 });

    expect(built?.compressor.ratio.value).toBe(8);
    expect(tail?.disconnect).not.toHaveBeenCalled();
  });
});
