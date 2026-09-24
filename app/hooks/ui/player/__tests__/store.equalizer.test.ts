import { beforeEach, describe, expect, it, vi } from "vitest";

import { EQUALIZER_STORAGE_KEY } from "../constants";

vi.mock("@components/Player", async () => {
  const helpers = await vi.importActual<typeof import("@components/Player/helpers")>("@components/Player/helpers");
  return {
    nextRepeat: helpers.nextRepeat,
    restorablePlayerMode: helpers.restorablePlayerMode,
    shouldRestart: helpers.shouldRestart,
    closeMiniWindow: vi.fn(),
    openMiniWindow: vi.fn(async () => true),
  };
});

vi.mock("@utils/artworkProxy", () => ({ artworkProxySrc: (value: string) => value }));

vi.mock("../announce", () => ({ announce: vi.fn() }));

vi.mock("../engine", () => ({
  applyVolume: vi.fn(),
  canPlayMime: () => true,
  connectEngine: vi.fn(),
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

const graph = vi.hoisted(() => ({
  setEqualizerGains: vi.fn(),
  setEqualizerPreamp: vi.fn(),
  setCompressor: vi.fn(),
  setGainFactor: vi.fn(),
}));

vi.mock("../audio-graph", () => graph);

const FLAT = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const ROCK = [5, 4, 3, 1, -1, 1, 3, 4, 5, 5];

async function freshStore(): Promise<typeof import("../store")> {
  vi.resetModules();
  return import("../store");
}

function saved(): unknown {
  return JSON.parse(window.localStorage.getItem(EQUALIZER_STORAGE_KEY) ?? "null");
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("the playback settings panel", () => {
  it("starts closed, with the equaliser off and flat", async () => {
    const store = await freshStore();

    expect(store.getSnapshot().settingsOpen).toBe(false);
    expect(store.getSnapshot().equalizer).toEqual({ enabled: false, gainsDb: FLAT, preampDb: 0 });
  });

  it("opens and closes from the same action, and from nothing else", async () => {
    const store = await freshStore();

    store.actions.toggleSettings();
    expect(store.getSnapshot().settingsOpen).toBe(true);
    store.actions.toggleQueue();
    store.actions.toggleDevices();
    expect(store.getSnapshot().settingsOpen).toBe(true);
    store.actions.toggleSettings();
    expect(store.getSnapshot().settingsOpen).toBe(false);
  });

  it("takes the place of the devices panel when it opens", async () => {
    const store = await freshStore();

    store.actions.toggleDevices();
    store.actions.toggleSettings();

    expect(store.getSnapshot().devicesOpen).toBe(false);
    expect(store.getSnapshot().settingsOpen).toBe(true);
  });
});

describe("shaping the sound", () => {
  it("sends the curve and the preamp to the graph once switched on, and remembers them for the next visit", async () => {
    const store = await freshStore();

    store.actions.applyEqualizerPreset({ kind: "builtIn", id: "rock" });
    store.actions.setEqualizerPreamp(-3);
    store.actions.setEqualizerEnabled(true);

    expect(graph.setEqualizerGains).toHaveBeenLastCalledWith(ROCK);
    expect(graph.setEqualizerPreamp).toHaveBeenLastCalledWith(-3);
    expect(saved()).toEqual({ enabled: true, gainsDb: ROCK, preampDb: -3 });
  });

  it("flattens what the graph hears when switched off, preamp included, but keeps the curve for later", async () => {
    const store = await freshStore();
    store.actions.applyEqualizerPreset({ kind: "builtIn", id: "rock" });
    store.actions.setEqualizerPreamp(-3);
    store.actions.setEqualizerEnabled(true);

    store.actions.setEqualizerEnabled(false);

    expect(graph.setEqualizerGains).toHaveBeenLastCalledWith(FLAT);
    expect(graph.setEqualizerPreamp).toHaveBeenLastCalledWith(0);
    expect(store.getSnapshot().equalizer).toEqual({ enabled: false, gainsDb: ROCK, preampDb: -3 });
  });

  it("moves one band to the nearest half decibel and no further than the slider reaches", async () => {
    const store = await freshStore();
    store.actions.setEqualizerEnabled(true);

    store.actions.setEqualizerBand(2, 3.3);
    expect(store.getSnapshot().equalizer.gainsDb).toEqual([0, 0, 3.5, 0, 0, 0, 0, 0, 0, 0]);

    store.actions.setEqualizerBand(2, 40);
    expect(store.getSnapshot().equalizer.gainsDb[2]).toBe(12);

    store.actions.setEqualizerBand(2, -40);
    expect(store.getSnapshot().equalizer.gainsDb[2]).toBe(-12);
    expect(graph.setEqualizerGains).toHaveBeenLastCalledWith([0, 0, -12, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("steps the preamp the same way as a band", async () => {
    const store = await freshStore();
    store.actions.setEqualizerEnabled(true);

    store.actions.setEqualizerPreamp(2.2);
    expect(store.getSnapshot().equalizer.preampDb).toBe(2);
    store.actions.setEqualizerPreamp(30);
    expect(store.getSnapshot().equalizer.preampDb).toBe(12);
  });

  it("ignores a band the curve does not have", async () => {
    const store = await freshStore();

    store.actions.setEqualizerBand(10, 3);

    expect(store.getSnapshot().equalizer.gainsDb).toEqual(FLAT);
    expect(graph.setEqualizerGains).not.toHaveBeenCalled();
    expect(saved()).toBeNull();
  });

  it("puts a preset on every band at once", async () => {
    const store = await freshStore();

    store.actions.applyEqualizerPreset({ kind: "builtIn", id: "rock" });

    expect(store.getSnapshot().equalizer.gainsDb).toEqual(ROCK);
  });
});

describe("a curve saved by an earlier visit", () => {
  it("comes back, preamp and all, and reaches the graph", async () => {
    window.localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify({ enabled: true, gainsDb: ROCK, preampDb: -2 }));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().equalizer).toEqual({ enabled: true, gainsDb: ROCK, preampDb: -2 });
    expect(graph.setEqualizerGains).toHaveBeenCalledWith(ROCK);
    expect(graph.setEqualizerPreamp).toHaveBeenCalledWith(-2);
  });

  it("reads a curve saved before the preamp existed as a curve with no preamp", async () => {
    window.localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify({ enabled: true, gainsDb: ROCK }));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().equalizer).toEqual({ enabled: true, gainsDb: ROCK, preampDb: 0 });
  });

  it("comes back switched off without touching the graph's curve", async () => {
    window.localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify({ enabled: false, gainsDb: ROCK }));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().equalizer.gainsDb).toEqual(ROCK);
    expect(graph.setEqualizerGains).toHaveBeenCalledWith(FLAT);
  });

  it("is left flat when the saved entry cannot be read, so a broken entry never silences the player", async () => {
    window.localStorage.setItem(EQUALIZER_STORAGE_KEY, "{nope");
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().equalizer).toEqual({ enabled: false, gainsDb: FLAT, preampDb: 0 });
    expect(graph.setEqualizerGains).not.toHaveBeenCalled();
  });
});
