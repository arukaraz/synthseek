import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WAVE_ANALYSER_SMOOTHING, WAVE_ENERGY_FLOOR, WAVE_ENERGY_INTERVAL_MS, WAVE_FFT_SIZE } from "../constants";

let level = 0;
let contextFails = false;
let resumed = 0;
let built: FakeContext | null = null;

class FakeAnalyser {
  fftSize = 0;
  smoothingTimeConstant = 0;
  readonly connect = vi.fn();

  get frequencyBinCount(): number {
    return this.fftSize / 2;
  }

  getByteFrequencyData(bins: Uint8Array): void {
    bins.fill(Math.round(level * 255));
  }
}

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
  readonly analyser = new FakeAnalyser();
  readonly gains: FakeGain[] = [];
  readonly filters: FakeFilter[] = [];
  readonly source = { connect: vi.fn() };

  get gainNode(): FakeGain | undefined {
    return this.gains[0];
  }

  get preamp(): FakeGain | undefined {
    return this.gains[1];
  }

  static record(context: FakeContext): void {
    built = context;
  }

  constructor() {
    if (contextFails) throw new Error("AudioContext is unavailable");
    FakeContext.record(this);
  }

  createAnalyser(): FakeAnalyser {
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
    return new FakeCompressor();
  }

  createMediaElementSource(): { connect: (target: unknown) => void } {
    return this.source;
  }

  resume(): Promise<void> {
    resumed += 1;
    return Promise.resolve();
  }
}

async function freshEnergy(): Promise<typeof import("../energy")> {
  vi.resetModules();
  return import("../energy");
}

function element(): HTMLAudioElement {
  return document.createElement("audio");
}

beforeEach(() => {
  vi.useFakeTimers();
  level = 0;
  contextFails = false;
  resumed = 0;
  built = null;
  vi.stubGlobal("AudioContext", FakeContext);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("audioEnergy", () => {
  it("reads full before any audio has been heard, so the wave starts at its normal height", async () => {
    const energy = await freshEnergy();

    expect(energy.audioEnergy()).toBe(1);
  });

  it("settles towards the floor while the track holds one flat level", async () => {
    const energy = await freshEnergy();
    level = 0.5;

    energy.followAudio(element());
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS * 20);

    expect(energy.audioEnergy()).toBeGreaterThan(WAVE_ENERGY_FLOOR);
    expect(energy.audioEnergy()).toBeLessThan(1);
  });

  it("rises above the floor when the level jumps against the recent quiet", async () => {
    const energy = await freshEnergy();
    level = 0;

    energy.followAudio(element());
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS);
    const quiet = energy.audioEnergy();

    level = 1;
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS * 10);

    expect(energy.audioEnergy()).toBeGreaterThan(quiet);
  });

  it("asks the browser to let the context out of its suspended state", async () => {
    const energy = await freshEnergy();

    energy.followAudio(element());

    expect(resumed).toBe(1);
  });

  it("configures the analyser once and reuses it for the next track", async () => {
    const energy = await freshEnergy();
    const first = element();

    energy.followAudio(first);
    energy.followAudio(element());
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS);

    expect(resumed).toBe(2);
    expect(energy.audioEnergy()).toBeLessThan(1);
  });

  it("goes back to full height when the audio stops", async () => {
    const energy = await freshEnergy();
    level = 0.5;
    energy.followAudio(element());
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS * 10);

    energy.stopFollowingAudio();

    expect(energy.audioEnergy()).toBe(1);
  });

  it("stops reading the level once the audio stops", async () => {
    const energy = await freshEnergy();
    level = 0.5;
    energy.followAudio(element());

    energy.stopFollowingAudio();
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS * 40);

    expect(energy.audioEnergy()).toBe(1);
  });

  it("leaves the wave at its normal height on a browser without an audio context", async () => {
    contextFails = true;
    const energy = await freshEnergy();
    level = 0.5;

    energy.followAudio(element());
    vi.advanceTimersByTime(WAVE_ENERGY_INTERVAL_MS * 20);

    expect(energy.audioEnergy()).toBe(1);
  });

  it("stops asking a browser that already refused once", async () => {
    contextFails = true;
    const energy = await freshEnergy();
    energy.followAudio(element());

    energy.followAudio(element());

    expect(resumed).toBe(0);
  });
});

describe("analyser setup", () => {
  it("asks the browser for the resolution the bass window is measured at", async () => {
    const energy = await freshEnergy();

    energy.followAudio(element());

    expect(built?.analyser.fftSize).toBe(WAVE_FFT_SIZE);
    expect(built?.analyser.smoothingTimeConstant).toBe(WAVE_ANALYSER_SMOOTHING);
  });

  it("hears the audio through the same graph the gain is applied in, not a second one of its own", async () => {
    const energy = await freshEnergy();

    energy.followAudio(element());

    expect(built?.source.connect).toHaveBeenCalledWith(built?.preamp);
    expect(built?.preamp?.connect).toHaveBeenCalledWith(built?.filters[0]);
    expect(built?.filters.at(-1)?.connect).toHaveBeenCalledWith(built?.gainNode);
    expect(built?.gainNode?.connect).toHaveBeenCalledWith(built?.analyser);
    expect(built?.analyser.connect).toHaveBeenCalledWith(built?.destination);
  });
});
