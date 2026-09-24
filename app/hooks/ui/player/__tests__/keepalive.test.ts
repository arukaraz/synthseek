import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class FakeAudio {
  loop = false;
  readonly src: string;
  readonly play = vi.fn(() => Promise.resolve());
  readonly pause = vi.fn();

  constructor(src: string) {
    this.src = src;
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

async function fresh(): Promise<typeof import("../keepalive")> {
  vi.resetModules();
  return import("../keepalive");
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
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    expect((blob as Blob).type).toBe("audio/wav");
    expect((blob as Blob).size).toBe(44 + 8000);
  });

  it("pauses it when playback stops, and does nothing before it ever played", async () => {
    const keepalive = await fresh();

    keepalive.releaseKeepAlive();
    expect(created).toHaveLength(0);

    keepalive.keepAlive();
    keepalive.releaseKeepAlive();
    expect(created[0]?.pause).toHaveBeenCalled();
  });
});
