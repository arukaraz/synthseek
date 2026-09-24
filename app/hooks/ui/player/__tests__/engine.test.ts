import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const decks = vi.hoisted(() => ({
  canPlayMime: vi.fn(() => true),
  connectEngine: vi.fn(),
  loadAndPlay: vi.fn(() => 1),
  crossfadeTo: vi.fn(() => 2),
  loadAt: vi.fn(),
  prime: vi.fn(),
  cancelPrime: vi.fn(),
  primedUrl: vi.fn(() => "/stream/primed"),
  setActiveTrackGain: vi.fn(),
  resume: vi.fn(),
  pause: vi.fn(),
  seek: vi.fn(),
  applyVolume: vi.fn(),
  stop: vi.fn(),
}));
const pcm = vi.hoisted(() => ({ loadAndPlay: vi.fn(), connectEngine: vi.fn(), canPlayMime: vi.fn(() => true) }));

vi.mock("../deck-engine", () => decks);
vi.mock("../pcm-engine", () => pcm);

async function freshFacade(): Promise<typeof import("../engine")> {
  vi.resetModules();
  const facade = await import("../engine");
  await import("../pcm-support").then((support) => support.probePcmBackend());
  return facade;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("choosing the engine for the session", () => {
  it("plays through the two elements where the browser cannot decode audio itself", async () => {
    vi.stubGlobal("AudioDecoder", undefined);
    const facade = await freshFacade();

    facade.loadAndPlay("/stream/a", 1, false);
    expect(decks.loadAndPlay).toHaveBeenCalledWith("/stream/a", 1, false, 0);
    expect(pcm.loadAndPlay).not.toHaveBeenCalled();
  });

  it("wires the store's callbacks into both engines, so the choice can wait for the first play", async () => {
    vi.stubGlobal("AudioDecoder", undefined);
    const facade = await freshFacade();
    const heard = {
      onProgress: vi.fn(),
      onEnded: vi.fn(),
      onHandoff: vi.fn(),
      onPlayingChange: vi.fn(),
      onLoadingChange: vi.fn(),
      onFailure: vi.fn(),
    };

    facade.connectEngine(heard);

    expect(decks.connectEngine).toHaveBeenCalledWith(heard);
    expect(pcm.connectEngine).toHaveBeenCalledWith(heard);
  });

  it("decodes in the page and schedules the samples itself where WebCodecs takes mp3 and flac", async () => {
    vi.stubGlobal("AudioDecoder", { isConfigSupported: vi.fn(async () => ({ supported: true })) });
    vi.stubGlobal("AudioContext", class {});
    const facade = await freshFacade();

    facade.loadAndPlay("/stream/a", 1, false, 3);
    expect(pcm.loadAndPlay).toHaveBeenCalledWith("/stream/a", 1, false, 3);
    expect(decks.loadAndPlay).not.toHaveBeenCalled();
    facade.canPlayMime("audio/mpeg");
    expect(pcm.canPlayMime).toHaveBeenCalledWith("audio/mpeg");
    expect(decks.canPlayMime).not.toHaveBeenCalled();
  });

  it("keeps the two elements when the browser has WebCodecs but refuses one of the required formats", async () => {
    vi.stubGlobal("AudioDecoder", {
      isConfigSupported: vi.fn(async (config: { codec: string }) => ({ supported: config.codec === "mp3" })),
    });
    vi.stubGlobal("AudioContext", class {});
    const facade = await freshFacade();

    facade.pause();
    expect(decks.pause).toHaveBeenCalled();
    expect(pcm.loadAndPlay).not.toHaveBeenCalled();
  });

  it("answers a format question from the probe before any engine has been chosen", async () => {
    vi.stubGlobal("AudioDecoder", { isConfigSupported: vi.fn(async () => ({ supported: true })) });
    vi.stubGlobal("AudioContext", class {});
    const facade = await freshFacade();

    facade.canPlayMime("audio/flac");

    expect(pcm.canPlayMime).toHaveBeenCalledWith("audio/flac");
    expect(decks.canPlayMime).not.toHaveBeenCalled();
  });

  it("forwards every call to the engine it chose, arguments and answers intact", async () => {
    vi.stubGlobal("AudioDecoder", undefined);
    const facade = await freshFacade();
    const heard = {
      onProgress: vi.fn(),
      onEnded: vi.fn(),
      onHandoff: vi.fn(),
      onPlayingChange: vi.fn(),
      onLoadingChange: vi.fn(),
      onFailure: vi.fn(),
    };
    const plan = { url: "/stream/b", gainFactor: 0.8, fadeSeconds: 0, curve: "equalPower" as const };
    const fade = { seconds: 4, curve: "linear" as const, gainFactor: 1 };

    facade.connectEngine(heard);
    expect(facade.canPlayMime("audio/flac")).toBe(true);
    expect(facade.crossfadeTo("/stream/b", fade, 0.5, false, 2)).toBe(2);
    facade.loadAt("/stream/c", 12, 0.5, true);
    facade.prime(plan);
    expect(facade.primedUrl()).toBe("/stream/primed");
    facade.cancelPrime();
    facade.setActiveTrackGain(0.7);
    facade.resume();
    facade.pause();
    facade.seek(33);
    facade.applyVolume(0.4, true);
    facade.stop();

    expect(decks.connectEngine).toHaveBeenCalledWith(heard);
    expect(decks.canPlayMime).toHaveBeenCalledWith("audio/flac");
    expect(decks.crossfadeTo).toHaveBeenCalledWith("/stream/b", fade, 0.5, false, 2);
    expect(decks.loadAt).toHaveBeenCalledWith("/stream/c", 12, 0.5, true);
    expect(decks.prime).toHaveBeenCalledWith(plan);
    expect(decks.primedUrl).toHaveBeenCalled();
    expect(decks.cancelPrime).toHaveBeenCalled();
    expect(decks.setActiveTrackGain).toHaveBeenCalledWith(0.7);
    expect(decks.resume).toHaveBeenCalled();
    expect(decks.pause).toHaveBeenCalled();
    expect(decks.seek).toHaveBeenCalledWith(33);
    expect(decks.applyVolume).toHaveBeenCalledWith(0.4, true);
    expect(decks.stop).toHaveBeenCalled();
  });

  it("stays with the engine it started with for the rest of the session", async () => {
    vi.stubGlobal("AudioDecoder", undefined);
    const facade = await freshFacade();
    facade.pause();

    vi.stubGlobal("AudioDecoder", { isConfigSupported: vi.fn(async () => ({ supported: true })) });
    await import("../pcm-support").then((support) => support.probePcmBackend());
    facade.loadAndPlay("/stream/a", 1, false);

    expect(decks.loadAndPlay).toHaveBeenCalledWith("/stream/a", 1, false, 0);
    expect(pcm.loadAndPlay).not.toHaveBeenCalled();
  });
});
