import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EQUALIZER_BANDS_HZ, GAIN_RAMP_SECONDS } from "../constants";

let built: FakeContext | null = null;
let contextFails = false;

class FakeGain {
  readonly gain = { value: 1, setTargetAtTime: vi.fn() };
  readonly connect = vi.fn();
  readonly disconnect = vi.fn();
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
  readonly source = { connect: vi.fn() };

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

  createMediaElementSource(): { connect: (target: unknown) => void } {
    return this.source;
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
    expect(built?.source.connect).toHaveBeenCalledTimes(1);
  });

  it("hands the element's own level over to the gain, so one place decides how loud it plays", async () => {
    const graph = await freshGraph();
    const node = element();
    node.volume = 0.5;

    graph.attachGraph(node);

    expect(node.volume).toBe(1);
    expect(node.muted).toBe(false);
  });

  it("multiplies the listener's volume by the track's correction", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());

    graph.setListenerVolume(0.5, false);
    graph.setGainFactor(0.4);

    expect(lastLevel()).toBeCloseTo(0.2, 6);
  });

  it("goes silent when muted, whatever correction the track asked for", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    graph.setGainFactor(1.4);

    graph.setListenerVolume(0.8, true);

    expect(lastLevel()).toBe(0);
  });

  it("remembers a correction asked for before the graph existed, and lands on it WITHOUT a ramp", async () => {
    const graph = await freshGraph();

    graph.setGainFactor(0.25);
    graph.setListenerVolume(1, false);
    graph.attachGraph(element());

    expect(built?.gainNode?.gain.value).toBeCloseTo(0.25, 6);
    expect(built?.gainNode?.gain.setTargetAtTime).not.toHaveBeenCalled();
  });

  it("refuses a correction that is not a usable number rather than silencing the track", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    graph.setListenerVolume(1, false);

    graph.setGainFactor(Number.NaN);

    expect(lastLevel()).toBe(1);
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
  it("puts the preamp, then one peaking filter per ISO band, between the source and the gain, in order", async () => {
    const graph = await freshGraph();

    graph.attachGraph(element());

    const filters = built?.filters ?? [];
    expect(filters).toHaveLength(EQUALIZER_BANDS_HZ.length);
    expect(filters.map((filter) => filter.type)).toEqual(EQUALIZER_BANDS_HZ.map(() => "peaking"));
    expect(filters.map((filter) => filter.frequency.value)).toEqual([...EQUALIZER_BANDS_HZ]);
    expect(built?.source.connect).toHaveBeenCalledWith(built?.preamp);
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
    graph.setGainFactor(1);

    graph.setEqualizerGains(BOOST_SIX);

    expect(lastLevel()).toBeCloseTo(Math.pow(10, -6 / 20), 6);
  });

  it("leaves the output alone for a curve that only cuts", async () => {
    const graph = await freshGraph();
    graph.attachGraph(element());
    graph.setListenerVolume(1, false);
    graph.setGainFactor(1);

    graph.setEqualizerGains(CUT_SIX);

    expect(lastLevel()).toBe(1);
  });

  it("folds the headroom into a level decided before the graph existed", async () => {
    const graph = await freshGraph();

    graph.setEqualizerGains(BOOST_SIX);
    graph.setGainFactor(0.5);
    graph.setListenerVolume(1, false);
    graph.attachGraph(element());

    expect(built?.gainNode?.gain.value).toBeCloseTo(0.5 * Math.pow(10, -6 / 20), 6);
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
