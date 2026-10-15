import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionEventType } from "@api/__generated__/types";

import { CONVERSION_STORAGE_KEY, EQUALIZER_PRESETS, TRANSITION_STORAGE_KEY } from "../constants";
import type { SettingsCommandPayload, ViewCommandPayload } from "../types";

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
  primedUrl: vi.fn((): string | null => null),
  crossfadeTo: vi.fn(),
  setActiveTrackGain: vi.fn(),
}));

vi.mock("../media-session", () => ({
  clearMediaSession: vi.fn(),
  publishMediaSession: vi.fn(),
  publishPlaybackState: vi.fn(),
  publishPosition: vi.fn(),
}));

vi.mock("../audio-graph", () => ({
  setEqualizerGains: vi.fn(),
  setEqualizerPreamp: vi.fn(),
  setCompressor: vi.fn(),
  setGainFactor: vi.fn(),
}));

const envelope: Pick<SettingsCommandPayload, "eventType" | "userId" | "deviceId" | "issuedAt"> = {
  eventType: SubscriptionEventType.PlayerCommand,
  userId: "u1",
  deviceId: "mine",
  issuedAt: 1,
};

function settings(change: Omit<SettingsCommandPayload, keyof typeof envelope | "command">): SettingsCommandPayload {
  return { ...envelope, command: "applySettings", ...change };
}

function view(change: Omit<ViewCommandPayload, keyof typeof envelope | "command">): ViewCommandPayload {
  return { ...envelope, command: "showView", ...change };
}

async function fresh() {
  vi.resetModules();
  const store = await import("../store");
  const remote = await import("../remote-settings");
  return { store, remote };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("applyRemoteSettings", () => {
  it("applies a built-in preset by its id and switches the equalizer on", async () => {
    const { store, remote } = await fresh();

    remote.applyRemoteSettings(settings({ equalizer: { enabled: true, preset: { kind: "builtIn", name: "rock" } } }));

    expect(store.getSnapshot().equalizer).toMatchObject({ enabled: true, gainsDb: EQUALIZER_PRESETS.rock });
  });

  it("applies a preset the listener saved, and ignores a built-in name this build does not know", async () => {
    const { store, remote } = await fresh();
    store.actions.setEqualizerBand(0, 4);
    store.actions.saveEqualizerPreset("Mine");
    store.actions.applyEqualizerPreset({ kind: "builtIn", id: "flat" });

    remote.applyRemoteSettings(settings({ equalizer: { preset: { kind: "custom", name: "Mine" } } }));
    expect(store.getSnapshot().equalizer.gainsDb[0]).toBe(4);

    remote.applyRemoteSettings(settings({ equalizer: { preset: { kind: "builtIn", name: "polka" } } }));
    expect(store.getSnapshot().equalizer.gainsDb[0]).toBe(4);
  });

  it("sets every band and the preamp, kept to the player's steps", async () => {
    const { store, remote } = await fresh();
    const gainsDb = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10.2];

    remote.applyRemoteSettings(settings({ equalizer: { gainsDb, preampDb: -2.3 } }));

    expect(store.getSnapshot().equalizer.gainsDb).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(store.getSnapshot().equalizer.preampDb).toBe(-2.5);
  });

  it("applies a compressor preset, then the single values on top of it", async () => {
    const { store, remote } = await fresh();

    remote.applyRemoteSettings(settings({ compressor: { enabled: true, preset: "heavy", ratio: 3 } }));

    expect(store.getSnapshot().compressor).toMatchObject({ enabled: true, ratio: 3 });
    expect(store.getSnapshot().compressor.thresholdDb).not.toBe(-24);
  });

  it("changes only the transition values it was given, and remembers them", async () => {
    const { store, remote } = await fresh();
    const before = store.getSnapshot().transition;

    remote.applyRemoteSettings(settings({ transition: { mode: "crossfade", seconds: 7 } }));

    expect(store.getSnapshot().transition).toEqual({ mode: "crossfade", seconds: 7, curve: before.curve });
    expect(JSON.parse(window.localStorage.getItem(TRANSITION_STORAGE_KEY) ?? "null")).toEqual({
      mode: "crossfade",
      seconds: 7,
      curve: before.curve,
    });
  });

  it("changes only the conversion values it was given", async () => {
    const { store, remote } = await fresh();
    const before = store.getSnapshot().conversion;

    remote.applyRemoteSettings(settings({ conversion: { enabled: true } }));

    expect(store.getSnapshot().conversion).toEqual({ enabled: true, bitrateKbps: before.bitrateKbps });
    expect(JSON.parse(window.localStorage.getItem(CONVERSION_STORAGE_KEY) ?? "null")).toEqual({
      enabled: true,
      bitrateKbps: before.bitrateKbps,
    });
  });
});

describe("applyRemoteView", () => {
  it("opens the lyrics full screen, then leaves full screen and shows the queue in a compact bar", async () => {
    const { store, remote } = await fresh();

    remote.applyRemoteView(view({ lyrics: true }));
    expect(store.getSnapshot()).toMatchObject({ fullscreen: true, lyricsOpen: true });

    remote.applyRemoteView(view({ fullscreen: false, queue: true, mode: "compact" }));
    expect(store.getSnapshot()).toMatchObject({
      fullscreen: false,
      lyricsOpen: false,
      queueOpen: true,
      mode: "compact",
    });
  });

  it("asks for a state, so a repeated request changes nothing", async () => {
    const { store, remote } = await fresh();

    remote.applyRemoteView(view({ queue: true, fullscreen: true }));
    remote.applyRemoteView(view({ queue: true, fullscreen: true }));

    expect(store.getSnapshot()).toMatchObject({ queueOpen: true, fullscreen: true });
  });

  it("closes the lyrics while staying full screen", async () => {
    const { store, remote } = await fresh();
    remote.applyRemoteView(view({ lyrics: true }));

    remote.applyRemoteView(view({ lyrics: false }));

    expect(store.getSnapshot()).toMatchObject({ fullscreen: true, lyricsOpen: false });
  });
});

describe("playerSettingsReport", () => {
  it("names the preset the curve matches and lists what an assistant may pick", async () => {
    const { store, remote } = await fresh();
    store.actions.applyEqualizerPreset({ kind: "builtIn", id: "rock" });

    const report = remote.playerSettingsReport(store.getSnapshot());

    expect(report.equalizer.preset).toEqual({ kind: "builtIn", name: "rock" });
    expect(report.equalizer.builtInPresets).toEqual(Object.keys(EQUALIZER_PRESETS));
    expect(report.equalizer.bandsHz).toHaveLength(report.equalizer.gainsDb.length);
    expect(report.compressor.presets).toContain("heavy");
    expect(report.compressor.ranges.ratio.max).toBeGreaterThan(report.compressor.ranges.ratio.min);
    expect(report.conversion.bitrates).toContain(report.conversion.bitrateKbps);
    expect(report.view).toEqual({ mode: "normal", fullscreen: false, lyricsOpen: false, queueOpen: false });
  });

  it("names a saved preset by its name, and none when the curve matches nothing", async () => {
    const { store, remote } = await fresh();
    store.actions.setEqualizerBand(0, 4);
    store.actions.saveEqualizerPreset("Mine");

    expect(remote.playerSettingsReport(store.getSnapshot()).equalizer).toMatchObject({
      preset: { kind: "custom", name: "Mine" },
      customPresets: ["Mine"],
    });

    store.actions.setEqualizerBand(1, 3);
    expect(remote.playerSettingsReport(store.getSnapshot()).equalizer.preset).toBeNull();
  });
});
