import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOAD_TIMEOUT_MS, STALL_TIMEOUT_MS } from "../constants";
import type { EngineCallbacks } from "../types";

const energy = vi.hoisted(() => ({ followAudio: vi.fn(), stopFollowingAudio: vi.fn() }));

vi.mock("../energy", () => energy);

class FakeAudio extends EventTarget {
  preload = "";
  crossOrigin: string | null = null;
  src = "";
  volume = 1;
  muted = false;
  currentTime = 0;
  duration = Number.NaN;
  ended = false;
  playable = "probably";
  playRejection: Error | null = null;
  readonly load = vi.fn();
  readonly pause = vi.fn();
  readonly removeAttribute = vi.fn((name: string) => {
    if (name === "src") this.src = "";
  });
  readonly play = vi.fn(() => (this.playRejection === null ? Promise.resolve() : Promise.reject(this.playRejection)));
  readonly canPlayType = vi.fn(() => this.playable);
}

let node: FakeAudio;

function callbacks(): EngineCallbacks {
  return {
    onProgress: vi.fn(),
    onEnded: vi.fn(),
    onPlayingChange: vi.fn(),
    onLoadingChange: vi.fn(),
    onFailure: vi.fn(),
  };
}

async function freshEngine(): Promise<{ engine: typeof import("../engine"); heard: EngineCallbacks }> {
  vi.resetModules();
  const engine = await import("../engine");
  const heard = callbacks();
  engine.connectEngine(heard);
  return { engine, heard };
}

beforeEach(() => {
  vi.clearAllMocks();
  node = new FakeAudio();
  vi.stubGlobal(
    "Audio",
    class {
      constructor() {
        return node;
      }
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("canPlayMime", () => {
  it("accepts a format the browser says it can decode", async () => {
    const { engine } = await freshEngine();

    expect(engine.canPlayMime("audio/mpeg")).toBe(true);
  });

  it("refuses a format the browser answers nothing about", async () => {
    node.playable = "";
    const { engine } = await freshEngine();

    expect(engine.canPlayMime("audio/flac")).toBe(false);
  });

  it("builds the probe element once and reuses it", async () => {
    const { engine } = await freshEngine();

    engine.canPlayMime("audio/mpeg");
    engine.canPlayMime("audio/flac");

    expect(node.preload).toBe("auto");
    expect(node.crossOrigin).toBe("use-credentials");
  });
});

describe("engine playback", () => {
  it("points the element at the stream and starts it", async () => {
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 0.4, true);

    expect(node.src).toBe("/stream/a");
    expect(node.volume).toBe(0.4);
    expect(node.muted).toBe(true);
    expect(node.load).toHaveBeenCalled();
    expect(node.play).toHaveBeenCalled();
    expect(heard.onLoadingChange).toHaveBeenCalledWith(true);
  });

  it("reports a stream that never produced a frame", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    vi.advanceTimersByTime(LOAD_TIMEOUT_MS);

    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });

  it("drops the timer of a stream that was replaced before it timed out", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    engine.loadAndPlay("/stream/b", 1, false);
    vi.advanceTimersByTime(LOAD_TIMEOUT_MS * 2);

    expect(heard.onFailure).toHaveBeenCalledTimes(1);
  });

  it("reports the browser refusing to start without a gesture", async () => {
    node.playRejection = new Error("NotAllowedError");
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    await vi.waitFor(() => expect(heard.onFailure).toHaveBeenCalledWith("autoplay"));
  });

  it("stays silent about a refusal that belongs to a stream already replaced", async () => {
    node.playRejection = new Error("NotAllowedError");
    const { engine, heard } = await freshEngine();

    engine.loadAndPlay("/stream/a", 1, false);
    engine.loadAndPlay("/stream/b", 1, false);
    await vi.waitFor(() => expect(heard.onFailure).toHaveBeenCalledWith("autoplay"));

    expect(heard.onFailure).toHaveBeenCalledTimes(1);
  });

  it("seeks into the stream once the browser knows its length", async () => {
    const { engine } = await freshEngine();

    engine.loadAt("/stream/a", 42, 0.8, false);
    expect(node.currentTime).toBe(0);

    node.dispatchEvent(new Event("loadedmetadata"));

    expect(node.currentTime).toBe(42);
  });

  it("does not seek a stream asked to start at its beginning", async () => {
    const { engine } = await freshEngine();

    engine.loadAt("/stream/a", 0, 0.8, false);
    node.currentTime = 7;
    node.dispatchEvent(new Event("loadedmetadata"));

    expect(node.currentTime).toBe(7);
  });

  it("abandons a pending seek when another track was loaded first", async () => {
    const { engine } = await freshEngine();

    engine.loadAt("/stream/a", 42, 0.8, false);
    engine.loadAt("/stream/b", 0, 0.8, false);
    node.dispatchEvent(new Event("loadedmetadata"));

    expect(node.currentTime).toBe(0);
  });

  it("resumes without reloading", async () => {
    const { engine } = await freshEngine();

    engine.resume();

    expect(node.play).toHaveBeenCalled();
    expect(node.load).not.toHaveBeenCalled();
  });

  it("reports a refused resume", async () => {
    node.playRejection = new Error("NotAllowedError");
    const { engine, heard } = await freshEngine();

    engine.resume();
    await vi.waitFor(() => expect(heard.onFailure).toHaveBeenCalledWith("autoplay"));
  });

  it("pauses the element", async () => {
    const { engine } = await freshEngine();

    engine.pause();

    expect(node.pause).toHaveBeenCalled();
  });

  it("seeks to a position, never behind the start", async () => {
    const { engine } = await freshEngine();

    engine.seek(30);
    expect(node.currentTime).toBe(30);

    engine.seek(-5);
    expect(node.currentTime).toBe(0);
  });

  it("refuses a seek to a position that is not a number", async () => {
    const { engine } = await freshEngine();
    engine.seek(30);

    engine.seek(Number.NaN);

    expect(node.currentTime).toBe(30);
  });

  it("clamps the volume to the range the element accepts", async () => {
    const { engine } = await freshEngine();

    engine.applyVolume(1.7, false);
    expect(node.volume).toBe(1);

    engine.applyVolume(-1, true);
    expect(node.volume).toBe(0);
    expect(node.muted).toBe(true);
  });

  it("releases the stream when told to stop", async () => {
    const { engine } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    engine.stop();

    expect(node.pause).toHaveBeenCalled();
    expect(node.removeAttribute).toHaveBeenCalledWith("src");
    expect(node.src).toBe("");
  });

  it("silences the timers of the stream it released", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.loadAndPlay("/stream/a", 1, false);

    engine.stop();
    vi.advanceTimersByTime(LOAD_TIMEOUT_MS * 2);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });
});

describe("engine element events", () => {
  it("reports progress with the length the browser knows", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");
    node.currentTime = 12;
    node.duration = 210;

    node.dispatchEvent(new Event("timeupdate"));

    expect(heard.onProgress).toHaveBeenCalledWith(12, 210);
  });

  it("reports a length of zero while the browser is still guessing", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");
    node.currentTime = 3;

    node.dispatchEvent(new Event("durationchange"));

    expect(heard.onProgress).toHaveBeenCalledWith(3, 0);
  });

  it("clears the loading flag once the browser has the metadata", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("loadedmetadata"));

    expect(heard.onLoadingChange).toHaveBeenCalledWith(false);
    expect(heard.onProgress).toHaveBeenCalled();
  });

  it("starts watching the level as soon as sound comes out", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("playing"));

    expect(heard.onPlayingChange).toHaveBeenCalledWith(true);
    expect(heard.onLoadingChange).toHaveBeenCalledWith(false);
    expect(energy.followAudio).toHaveBeenCalledWith(node);
  });

  it("reports a pause and stops watching the level", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("pause"));

    expect(heard.onPlayingChange).toHaveBeenCalledWith(false);
    expect(energy.stopFollowingAudio).toHaveBeenCalled();
  });

  it("does not call the end of a track a pause", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");
    node.ended = true;

    node.dispatchEvent(new Event("pause"));

    expect(heard.onPlayingChange).not.toHaveBeenCalled();
  });

  it("announces the end of a track", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("ended"));

    expect(heard.onEnded).toHaveBeenCalled();
    expect(energy.stopFollowingAudio).toHaveBeenCalled();
  });

  it("reports a stream that went quiet for too long", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("waiting"));
    expect(heard.onLoadingChange).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(STALL_TIMEOUT_MS);
    expect(heard.onFailure).toHaveBeenCalledWith("stall");
  });

  it("reports a stall the browser announced itself", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("stalled"));
    vi.advanceTimersByTime(STALL_TIMEOUT_MS);

    expect(heard.onFailure).toHaveBeenCalledWith("stall");
  });

  it("calls off the stall watch as soon as the stream moves again", async () => {
    vi.useFakeTimers();
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("waiting"));
    node.dispatchEvent(new Event("timeupdate"));
    vi.advanceTimersByTime(STALL_TIMEOUT_MS * 2);

    expect(heard.onFailure).not.toHaveBeenCalled();
  });

  it("reports a stream the browser rejected", async () => {
    const { engine, heard } = await freshEngine();
    engine.canPlayMime("audio/mpeg");

    node.dispatchEvent(new Event("error"));

    expect(heard.onFailure).toHaveBeenCalledWith("load");
  });
});
