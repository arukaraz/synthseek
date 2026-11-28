import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface FakeNode {
  readonly name: string;
  channelCount: number;
  channelCountMode: string;
  channelInterpretation: string;
  readonly gain: {
    value: number;
    setTargetAtTime: ReturnType<typeof vi.fn>;
    setValueAtTime: ReturnType<typeof vi.fn>;
    cancelScheduledValues: ReturnType<typeof vi.fn>;
  };
  readonly connect: (target: FakeNode) => void;
  readonly disconnect: () => void;
}

let edges: Array<[FakeNode, FakeNode]> = [];
let created: FakeNode[] = [];

function node(name: string): FakeNode {
  const self: FakeNode = {
    name,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    gain: { value: 1, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() },
    connect: (target) => {
      edges.push([self, target]);
    },
    disconnect: () => {
      edges = edges.filter(([from]) => from !== self);
    },
  };
  created.push(self);
  return self;
}

class FakeContext {
  readonly sampleRate = 48_000;
  readonly currentTime = 0;
  readonly destination = node("destination");
  readonly analyser = Object.assign(node("analyser"), {
    fftSize: 0,
    smoothingTimeConstant: 0,
    frequencyBinCount: 1024,
  });

  createAnalyser(): FakeContext["analyser"] {
    return this.analyser;
  }

  createGain(): FakeNode {
    return node("gain");
  }

  createBiquadFilter(): FakeNode & { type: string; frequency: { value: number }; Q: { value: number } } {
    return Object.assign(node("filter"), { type: "", frequency: { value: 0 }, Q: { value: 0 } });
  }

  createDynamicsCompressor(): FakeNode &
    Record<"threshold" | "ratio" | "attack" | "release" | "knee", { value: number }> {
    const value = () => ({ value: 0 });
    return Object.assign(node("compressor"), {
      threshold: value(),
      ratio: value(),
      attack: value(),
      release: value(),
      knee: value(),
    });
  }

  createMediaElementSource(): FakeNode {
    return node("source");
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }
}

async function freshGraph(): Promise<typeof import("../audio-graph")> {
  vi.resetModules();
  return import("../audio-graph");
}

function reaching(target: string): FakeNode[] {
  return edges.filter(([, to]) => to.name === target).map(([from]) => from);
}

function monoNodes(): FakeNode[] {
  return created.filter((candidate) => candidate.channelCount === 1);
}

beforeEach(() => {
  edges = [];
  created = [];
  vi.stubGlobal("AudioContext", FakeContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mono audio routing", () => {
  it("leaves the graph exactly as it was while mono is off", async () => {
    const graph = await freshGraph();

    const built = graph.attachGraph(document.createElement("audio"));

    expect(built).not.toBeNull();
    expect(monoNodes()).toHaveLength(0);
    expect(created.filter((candidate) => candidate.name === "gain")).toHaveLength(3);
    expect(reaching("destination")).toEqual([built?.analyser]);
  });

  it("does not touch the graph when mono is switched off while it is already off", async () => {
    const graph = await freshGraph();
    graph.attachGraph(document.createElement("audio"));
    const before = edges.length;

    graph.setMonoAudio(false);

    expect(edges).toHaveLength(before);
    expect(monoNodes()).toHaveLength(0);
  });

  it("downmixes through one explicit single-channel node between the analyser and the speakers", async () => {
    const graph = await freshGraph();
    const built = graph.attachGraph(document.createElement("audio"));

    graph.setMonoAudio(true);

    const [mono] = monoNodes();
    expect(monoNodes()).toHaveLength(1);
    expect(mono?.channelCountMode).toBe("explicit");
    expect(mono?.channelInterpretation).toBe("speakers");
    expect(reaching("destination")).toEqual([mono]);
    expect(built).not.toBeNull();
    expect(edges.some(([from, to]) => from.name === "analyser" && to === mono)).toBe(true);
  });

  it("wires the downmix when the graph is created after mono was asked for", async () => {
    const graph = await freshGraph();
    graph.setMonoAudio(true);
    expect(created).toHaveLength(0);

    graph.attachGraph(document.createElement("audio"));

    const [mono] = monoNodes();
    expect(mono).toBeDefined();
    expect(reaching("destination")).toEqual([mono]);
    expect(edges.some(([from, to]) => from.name === "analyser" && to === mono)).toBe(true);
  });

  it("puts the analyser straight back on the speakers when mono is switched off", async () => {
    const graph = await freshGraph();
    const built = graph.attachGraph(document.createElement("audio"));
    graph.setMonoAudio(true);

    graph.setMonoAudio(false);

    expect(reaching("destination")).toEqual([built?.analyser]);
    expect(edges.some(([from]) => from.channelCount === 1)).toBe(false);
  });

  it("builds one downmix node however often mono is asked for", async () => {
    const graph = await freshGraph();
    graph.attachGraph(document.createElement("audio"));

    graph.setMonoAudio(true);
    graph.setMonoAudio(true);

    expect(monoNodes()).toHaveLength(1);
    expect(reaching("destination")).toHaveLength(1);
  });

  it("keeps every later deck on the same downmix, which is what track changes and crossfades add", async () => {
    const graph = await freshGraph();
    graph.attachGraph(document.createElement("audio"));
    graph.setMonoAudio(true);
    const [mono] = monoNodes();

    graph.attachGraph(document.createElement("audio"));
    graph.attachBus({ voice: 1 });

    expect(monoNodes()).toEqual([mono]);
    expect(reaching("destination")).toEqual([mono]);
  });
});
