import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { COMPRESSOR_STORAGE_KEY, CONVERSION_STORAGE_KEY, EQUALIZER_PRESETS_STORAGE_KEY } from "../constants";

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

const engine = vi.hoisted(() => ({
  applyVolume: vi.fn(),
  loadAndPlay: vi.fn(),
  loadAt: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  seek: vi.fn(),
  stop: vi.fn(),
  playing: null as null | ((playing: boolean) => void),
}));

vi.mock("../engine", () => ({
  applyVolume: engine.applyVolume,
  canPlayMime: () => true,
  connectEngine: (handlers: { onPlayingChange: (playing: boolean) => void }) => {
    engine.playing = handlers.onPlayingChange;
  },
  loadAndPlay: engine.loadAndPlay,
  loadAt: engine.loadAt,
  pause: engine.pause,
  resume: engine.resume,
  seek: engine.seek,
  stop: engine.stop,
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

const CURVE = [2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const MODERATE = { thresholdDb: -24, ratio: 4, attackMs: 20, releaseMs: 300, kneeDb: 3 };

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
  };
}

async function freshStore(): Promise<typeof import("../store")> {
  vi.resetModules();
  return import("../store");
}

function saved(key: string): unknown {
  return JSON.parse(window.localStorage.getItem(key) ?? "null");
}

beforeEach(() => {
  vi.clearAllMocks();
  engine.playing = null;
  window.localStorage.clear();
});

describe("presets the listener saves", () => {
  it("keeps the current curve under the name given, trimmed, and applies it back later", async () => {
    const store = await freshStore();
    store.actions.setEqualizerBand(0, 2);
    store.actions.setEqualizerBand(1, 1);

    store.actions.saveEqualizerPreset("  Mine  ");
    store.actions.applyEqualizerPreset({ kind: "builtIn", id: "flat" });
    store.actions.applyEqualizerPreset({ kind: "custom", name: "Mine" });

    expect(store.getSnapshot().equalizerPresets).toEqual([{ name: "Mine", gainsDb: CURVE }]);
    expect(store.getSnapshot().equalizer.gainsDb).toEqual(CURVE);
    expect(saved(EQUALIZER_PRESETS_STORAGE_KEY)).toEqual([{ name: "Mine", gainsDb: CURVE }]);
  });

  it("refuses a blank name and a name nobody could read", async () => {
    const store = await freshStore();

    store.actions.saveEqualizerPreset("   ");
    store.actions.saveEqualizerPreset("x".repeat(41));

    expect(store.getSnapshot().equalizerPresets).toEqual([]);
    expect(saved(EQUALIZER_PRESETS_STORAGE_KEY)).toBeNull();
  });

  it("replaces a preset saved again under the same name rather than doubling it", async () => {
    const store = await freshStore();
    store.actions.saveEqualizerPreset("Mine");
    store.actions.setEqualizerBand(0, 2);

    store.actions.saveEqualizerPreset("Mine");

    expect(store.getSnapshot().equalizerPresets).toHaveLength(1);
    expect(store.getSnapshot().equalizerPresets[0]?.gainsDb[0]).toBe(2);
  });

  it("forgets a preset on request and ignores a name it never held", async () => {
    const store = await freshStore();
    store.actions.saveEqualizerPreset("Mine");

    store.actions.deleteEqualizerPreset("Theirs");
    expect(store.getSnapshot().equalizerPresets).toHaveLength(1);

    store.actions.deleteEqualizerPreset("Mine");
    expect(store.getSnapshot().equalizerPresets).toEqual([]);
    expect(saved(EQUALIZER_PRESETS_STORAGE_KEY)).toEqual([]);
  });

  it("leaves the curve alone when asked for a preset that is not there", async () => {
    const store = await freshStore();

    store.actions.applyEqualizerPreset({ kind: "custom", name: "Nobody" });

    expect(graph.setEqualizerGains).not.toHaveBeenCalled();
  });

  it("comes back on the next visit", async () => {
    window.localStorage.setItem(EQUALIZER_PRESETS_STORAGE_KEY, JSON.stringify([{ name: "Mine", gainsDb: CURVE }]));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().equalizerPresets).toEqual([{ name: "Mine", gainsDb: CURVE }]);
  });
});

describe("the compressor", () => {
  it("starts off on the moderate preset", async () => {
    const store = await freshStore();

    expect(store.getSnapshot().compressor).toEqual({ enabled: false, ...MODERATE });
  });

  it("reaches the graph and the next visit when switched on", async () => {
    const store = await freshStore();

    store.actions.setCompressorEnabled(true);

    expect(graph.setCompressor).toHaveBeenLastCalledWith({ enabled: true, ...MODERATE });
    expect(saved(COMPRESSOR_STORAGE_KEY)).toEqual({ enabled: true, ...MODERATE });
  });

  it("takes a preset whole", async () => {
    const store = await freshStore();

    store.actions.applyCompressorPreset("limiter");

    expect(store.getSnapshot().compressor).toEqual({
      enabled: false,
      thresholdDb: -3,
      ratio: 20,
      attackMs: 1,
      releaseMs: 100,
      kneeDb: 1,
    });
  });

  it("steps and clamps one parameter at a time", async () => {
    const store = await freshStore();

    store.actions.setCompressorParam("ratio", 4.3);
    expect(store.getSnapshot().compressor.ratio).toBe(4.5);
    store.actions.setCompressorParam("thresholdDb", 5);
    expect(store.getSnapshot().compressor.thresholdDb).toBe(0);
    store.actions.setCompressorParam("releaseMs", 1234);
    expect(store.getSnapshot().compressor.releaseMs).toBe(1000);
    expect(graph.setCompressor).toHaveBeenLastCalledWith(store.getSnapshot().compressor);
  });

  it("comes back on the next visit and reaches the graph", async () => {
    window.localStorage.setItem(COMPRESSOR_STORAGE_KEY, JSON.stringify({ enabled: true, ...MODERATE, ratio: 8 }));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().compressor).toEqual({ enabled: true, ...MODERATE, ratio: 8 });
    expect(graph.setCompressor).toHaveBeenCalledWith({ enabled: true, ...MODERATE, ratio: 8 });
  });
});

describe("conversion the listener asks for", () => {
  it("starts off, streaming the original file", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);

    expect(engine.loadAndPlay).toHaveBeenLastCalledWith("/api/v1/library/tracks/a/stream", 0.8, false, 0);
    expect(store.getSnapshot().transcoding).toBe(false);
  });

  it("reloads the playing track converted at the chosen bitrate, from where it was", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.playing?.(true);
    store.actions.seekTo(42);

    store.actions.setConversion({ enabled: true, bitrateKbps: 128 });

    expect(engine.loadAndPlay).toHaveBeenLastCalledWith(
      "/api/v1/library/tracks/a/stream?format=mp3&maxBitrate=128&offset=42",
      0.8,
      false,
      0
    );
    expect(store.getSnapshot().transcoding).toBe(true);
    expect(saved(CONVERSION_STORAGE_KEY)).toEqual({ enabled: true, bitrateKbps: 128 });
  });

  it("re-arms a paused track rather than starting it", async () => {
    const store = await freshStore();
    store.actions.playQueue([track("a")], 0);
    engine.loadAndPlay.mockClear();

    store.actions.setConversion({ enabled: true, bitrateKbps: 192 });

    expect(engine.loadAndPlay).not.toHaveBeenCalled();
    expect(engine.loadAt).toHaveBeenCalledWith(
      "/api/v1/library/tracks/a/stream?format=mp3&maxBitrate=192",
      0,
      0.8,
      false
    );
  });

  it("does nothing for a setting that did not change, and touches no track before one has started", async () => {
    const store = await freshStore();

    store.actions.setConversion({ enabled: true, bitrateKbps: 128 });
    store.actions.setConversion({ enabled: true, bitrateKbps: 128 });

    expect(engine.loadAndPlay).not.toHaveBeenCalled();
    expect(engine.loadAt).not.toHaveBeenCalled();
    expect(saved(CONVERSION_STORAGE_KEY)).toEqual({ enabled: true, bitrateKbps: 128 });
  });

  it("comes back on the next visit", async () => {
    window.localStorage.setItem(CONVERSION_STORAGE_KEY, JSON.stringify({ enabled: true, bitrateKbps: 320 }));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();
    store.actions.playQueue([track("a")], 0);

    expect(engine.loadAndPlay).toHaveBeenLastCalledWith(
      "/api/v1/library/tracks/a/stream?format=mp3&maxBitrate=320",
      0.8,
      false,
      0
    );
  });

  it("ignores a saved bitrate the server would not honour", async () => {
    window.localStorage.setItem(CONVERSION_STORAGE_KEY, JSON.stringify({ enabled: true, bitrateKbps: 999 }));
    const store = await freshStore();

    store.actions.restorePlaybackSettings();

    expect(store.getSnapshot().conversion).toEqual({ enabled: false, bitrateKbps: 192 });
  });
});
