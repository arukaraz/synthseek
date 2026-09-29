import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class FakeAudio {
  loop = false;
  paused = true;
  readonly src: string;
  readonly listeners = new Map<string, () => void>();
  readonly play = vi.fn(() => {
    this.paused = false;
    return Promise.resolve();
  });
  readonly pause = vi.fn(() => {
    this.paused = true;
  });

  constructor(src: string) {
    this.src = src;
  }

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener);
  }

  dispatch(type: string): void {
    this.listeners.get(type)?.();
  }
}

const created: FakeAudio[] = [];

beforeEach(() => {
  created.length = 0;
  vi.stubGlobal(
    "Audio",
    class {
      constructor(src: string) {
        const audio = new FakeAudio(src);
        created.push(audio);
        return audio;
      }
    }
  );
  Object.defineProperty(URL, "createObjectURL", { value: vi.fn(() => "blob:silence"), configurable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(URL, "createObjectURL");
});

const CHROME_TRANSIENT_SOUND_MAX_SECONDS = 5;

async function fresh(): Promise<typeof import("../keepalive")> {
  vi.resetModules();
  return import("../keepalive");
}

function silentWave(): Blob {
  const blob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0];
  if (!(blob instanceof Blob)) throw new Error("no wave file was built");
  return blob;
}

function bytesOf(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("the wave file did not read as bytes"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function waveSeconds(blob: Blob): Promise<number> {
  const view = new DataView(await bytesOf(blob));
  const byteRate = view.getUint32(28, true);
  const dataBytes = view.getUint32(40, true);
  return dataBytes / byteRate;
}

describe("the silent element that keeps the media session alive", () => {
  it("plays one looping silent wave file, built in memory, and reuses it", async () => {
    const keepalive = await fresh();

    keepalive.keepAlive();
    keepalive.keepAlive();

    expect(created).toHaveLength(1);
    expect(created[0]?.loop).toBe(true);
    expect(created[0]?.src).toBe("blob:silence");
    expect(created[0]?.play).toHaveBeenCalledTimes(2);
    expect(silentWave().type).toBe("audio/wav");
  });

  it("lasts longer than the five seconds Chrome treats as a transient sound, which Android never shows on the lock screen", async () => {
    const keepalive = await fresh();

    keepalive.keepAlive();

    const wave = silentWave();
    const seconds = await waveSeconds(wave);
    expect(seconds).toBeGreaterThan(CHROME_TRANSIENT_SOUND_MAX_SECONDS);
    expect(wave.size).toBe(44 + seconds * 8000);
  });

  it("pauses it when playback stops, and does nothing before it ever played", async () => {
    const keepalive = await fresh();

    keepalive.releaseKeepAlive();
    expect(created).toHaveLength(0);

    keepalive.keepAlive();
    keepalive.releaseKeepAlive();
    expect(created[0]?.pause).toHaveBeenCalled();
  });

  it("tells its follower when the system pauses it while held, and when the system plays it once released", async () => {
    const keepalive = await fresh();
    const follower = vi.fn();
    keepalive.followKeepAlive(follower);
    keepalive.keepAlive();
    const element = created[0];
    if (element === undefined) throw new Error("no element was built");

    element.paused = true;
    element.dispatch("pause");
    expect(follower).toHaveBeenLastCalledWith(false);

    keepalive.releaseKeepAlive();
    element.paused = false;
    element.dispatch("play");
    expect(follower).toHaveBeenLastCalledWith(true);
  });

  it("keeps quiet about the pauses and plays it made itself", async () => {
    const keepalive = await fresh();
    const follower = vi.fn();
    keepalive.followKeepAlive(follower);
    keepalive.keepAlive();
    const element = created[0];
    if (element === undefined) throw new Error("no element was built");

    element.dispatch("play");
    keepalive.releaseKeepAlive();
    element.dispatch("pause");

    expect(follower).not.toHaveBeenCalled();
  });

  it("reads the element as the event lands, so a release and a restart in one task, or the reverse, read as its own", async () => {
    const keepalive = await fresh();
    const follower = vi.fn();
    keepalive.followKeepAlive(follower);
    keepalive.keepAlive();
    const element = created[0];
    if (element === undefined) throw new Error("no element was built");

    keepalive.releaseKeepAlive();
    keepalive.keepAlive();
    element.dispatch("pause");

    keepalive.releaseKeepAlive();
    keepalive.keepAlive();
    keepalive.releaseKeepAlive();
    element.dispatch("play");

    expect(follower).not.toHaveBeenCalled();
  });
});
