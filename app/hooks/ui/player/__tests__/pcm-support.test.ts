import { afterEach, describe, expect, it, vi } from "vitest";

import { PCM_CODEC_PROBES } from "../constants";

async function fresh(): Promise<typeof import("../pcm-support")> {
  vi.resetModules();
  return import("../pcm-support");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("finding out what the browser can decode itself", () => {
  it("answers each format from its own probe, takes wav for granted, and asks only once", async () => {
    const isConfigSupported = vi.fn(async (config: AudioDecoderConfig) => ({ supported: config.codec !== "vorbis" }));
    vi.stubGlobal("AudioDecoder", { isConfigSupported });
    vi.stubGlobal("AudioContext", class {});
    const support = await fresh();

    expect(support.pcmCanPlay("audio/mpeg")).toBe(false);
    await support.probePcmBackend();
    await support.probePcmBackend();

    expect(support.pcmBackendReady()).toBe(true);
    expect(support.pcmCanPlay("audio/mpeg")).toBe(true);
    expect(support.pcmCanPlay("audio/flac")).toBe(true);
    expect(support.pcmCanPlay("audio/opus")).toBe(true);
    expect(support.pcmCanPlay("audio/ogg")).toBe(false);
    expect(support.pcmCanPlay("audio/wav")).toBe(true);
    expect(support.pcmCanPlay("audio/x-ms-wma")).toBe(false);
    expect(isConfigSupported).toHaveBeenCalledTimes(PCM_CODEC_PROBES.length);
  });

  it("is not ready without a required format, and a probe the decoder rejects counts as unsupported", async () => {
    vi.stubGlobal("AudioDecoder", {
      isConfigSupported: vi.fn(async (config: AudioDecoderConfig) => {
        if (config.codec === "flac") throw new TypeError("description required");
        return { supported: true };
      }),
    });
    vi.stubGlobal("AudioContext", class {});
    const support = await fresh();

    expect(await support.probePcmBackend()).toBe(false);
    expect(support.pcmBackendReady()).toBe(false);
    expect(support.pcmCanPlay("audio/mpeg")).toBe(true);
    expect(support.pcmCanPlay("audio/flac")).toBe(false);
  });

  it("is not ready where WebCodecs is missing", async () => {
    vi.stubGlobal("AudioDecoder", undefined);
    const support = await fresh();

    expect(await support.probePcmBackend()).toBe(false);
    expect(support.pcmCanPlay("audio/wav")).toBe(true);
  });
});
