import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let built: FakeContext | null = null;
let contextFails = false;

class FakeGain {
  readonly gain = { value: 1, setTargetAtTime: vi.fn() };
  readonly connect = vi.fn();
}

class FakeContext {
  readonly sampleRate = 48_000;
  readonly destination = {};
  readonly currentTime = 7;
  readonly analyser = { fftSize: 0, smoothingTimeConstant: 0, frequencyBinCount: 1024, connect: vi.fn() };
  readonly gainNode = new FakeGain();
  readonly source = { connect: vi.fn() };

  static record(context: FakeContext): void {
    built = context;
  }

  constructor() {
    if (contextFails) throw new Error("AudioContext is unavailable");
    FakeContext.record(this);
  }

  createAnalyser(): FakeContext["analyser"] {
    return this.analyser;
  }

  createGain(): FakeGain {
    return this.gainNode;
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
  const calls = built?.gainNode.gain.setTargetAtTime.mock.calls ?? [];
  return Number(calls[calls.length - 1]?.[0]);
}

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

    expect(built?.gainNode.gain.value).toBeCloseTo(0.25, 6);
    expect(built?.gainNode.gain.setTargetAtTime).not.toHaveBeenCalled();
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
