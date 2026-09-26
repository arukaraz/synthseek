import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MP3_HEAD_BYTES,
  MP3_XING_WINDOW_BYTES,
  PCM_NETWORK_RETRY_MAX_SECONDS,
  PCM_READ_RETRIES,
  PCM_URL_CACHE_BYTES,
} from "../constants";
import type { GaplessInfo, PcmTrim } from "../types";

interface UrlSourceOptions {
  requestInit?: RequestInit;
  maxCacheSize?: number;
  fetchFn?: (input: string, init?: RequestInit) => Promise<Response>;
  getRetryDelay?: (previousAttempts: number, error: unknown, url: string) => number | null;
}

const lame = vi.hoisted(() => ({
  gaplessInfoFrom: vi.fn<(bytes: Uint8Array) => GaplessInfo | null>(),
  id3Length: vi.fn<(bytes: Uint8Array) => number>(),
  trimFor: vi.fn<(info: GaplessInfo, sampleRate: number) => PcmTrim>(),
}));

const media = vi.hoisted(() => {
  const track = {
    codec: "flac",
    decodable: true,
    headerDuration: 200 as number | null,
    canDecode: vi.fn(async () => track.decodable),
    getCodec: vi.fn(async () => track.codec),
    getSampleRate: vi.fn(async () => 44100),
    computeDuration: vi.fn(async () => 200),
    getDurationFromMetadata: vi.fn(async () => track.headerDuration),
  };
  const state = {
    track,
    missingTrack: false,
    headRead: false,
    urlSources: [] as { url: string; options: UrlSourceOptions }[],
    inputs: [] as { options: unknown; dispose: ReturnType<typeof vi.fn> }[],
    sinks: [] as { track: unknown; buffers: ReturnType<typeof vi.fn> }[],
  };
  return state;
});

vi.mock("../lame", () => lame);
vi.mock("mediabunny", () => ({
  ALL_FORMATS: ["every-format"],
  UrlSource: class {
    constructor(url: string, options: UrlSourceOptions) {
      media.urlSources.push({ url, options });
    }
  },
  AudioBufferSink: class {
    readonly buffers = vi.fn((from: number) => `buffers from ${from}`);

    constructor(track: unknown) {
      media.sinks.push({ track, buffers: this.buffers });
    }
  },
  Input: class {
    readonly dispose = vi.fn();

    constructor(options: unknown) {
      media.inputs.push({ options, dispose: this.dispose });
    }

    async getPrimaryAudioTrack(): Promise<typeof media.track | null> {
      if (media.headRead) {
        await media.urlSources.at(-1)?.options.fetchFn?.("/stream/1", { headers: { Range: "bytes=0-" } });
      }
      return media.missingTrack ? null : media.track;
    }
  },
}));

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>();

function headResponse(ok: boolean): Response {
  return {
    ok,
    status: ok ? 206 : 404,
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  } as unknown as Response;
}

async function fresh(): Promise<typeof import("../pcm-source")> {
  vi.resetModules();
  return import("../pcm-source");
}

beforeEach(() => {
  vi.clearAllMocks();
  media.track.codec = "flac";
  media.track.decodable = true;
  media.track.headerDuration = 200;
  media.missingTrack = false;
  media.headRead = false;
  media.urlSources.length = 0;
  media.inputs.length = 0;
  media.sinks.length = 0;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(headResponse(true));
  lame.gaplessInfoFrom.mockReturnValue({ delaySamples: 576, paddingSamples: 1000, frames: 100, samplesPerFrame: 1152 });
  lame.trimFor.mockReturnValue({ startSeconds: 0.025, durationSeconds: 100 });
  lame.id3Length.mockReturnValue(0);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("opening a stream as decoded audio", () => {
  it("reads the stream through the session cookie with a bounded cache, and demuxes every format", async () => {
    const source = await fresh();

    await source.openPcmSource("/stream/1");

    expect(media.urlSources[0]).toMatchObject({
      url: "/stream/1",
      options: { requestInit: { credentials: "include" }, maxCacheSize: PCM_URL_CACHE_BYTES },
    });
    expect(media.inputs[0]?.options).toMatchObject({ formats: ["every-format"] });
  });

  it("gives up on a server that keeps refusing the read, so the player can move to the next copy", async () => {
    const source = await fresh();
    await source.openPcmSource("/stream/1");
    const { fetchFn, getRetryDelay } = media.urlSources[0]?.options ?? {};
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503, statusText: "Service Unavailable" }));

    const refusal = await fetchFn?.("/stream/1", {}).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(Error);
    expect(getRetryDelay?.(1, refusal, "/stream/1")).toBe(1);
    expect(getRetryDelay?.(PCM_READ_RETRIES, refusal, "/stream/1")).toBe(PCM_READ_RETRIES);
    expect(getRetryDelay?.(PCM_READ_RETRIES + 1, refusal, "/stream/1")).toBeNull();
  });

  it("keeps retrying a read the network dropped, so playback resumes when the connection does", async () => {
    const source = await fresh();
    await source.openPcmSource("/stream/1");
    const getRetryDelay = media.urlSources[0]?.options.getRetryDelay;
    const offline = new TypeError("Failed to fetch");

    expect(getRetryDelay?.(1, offline, "/stream/1")).toBe(1);
    expect(getRetryDelay?.(PCM_READ_RETRIES + 1, offline, "/stream/1")).toBe(PCM_READ_RETRIES + 1);
    expect(getRetryDelay?.(1000, offline, "/stream/1")).toBe(PCM_NETWORK_RETRY_MAX_SECONDS);
  });

  it("hands a read the server answered straight back", async () => {
    const source = await fresh();
    await source.openPcmSource("/stream/1");
    const fetchFn = media.urlSources[0]?.options.fetchFn;
    const partial = new Response("audio", { status: 206 });
    fetchMock.mockResolvedValueOnce(partial);

    expect(await fetchFn?.("/stream/1", { headers: { Range: "bytes=0-4" } })).toBe(partial);
  });

  it("takes a flac's length from its header, never by reading every frame, with no trim or extra request", async () => {
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(media.track.computeDuration).not.toHaveBeenCalled();
    expect(opened.durationSeconds).toBe(200);
    expect(opened.sampleRate).toBe(44100);
    expect(opened.trimStartSeconds).toBe(0);
    expect(opened.buffers(5)).toBe("buffers from 5");
    expect(media.sinks[0]?.track).toBe(media.track);
  });

  it("reads the first bytes of an mp3 for its encoder delay and shifts the decode by it", async () => {
    media.track.codec = "mp3";
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(fetchMock).toHaveBeenCalledWith("/stream/1", {
      headers: { Range: `bytes=0-${MP3_HEAD_BYTES - 1}` },
      credentials: "include",
    });
    expect(lame.gaplessInfoFrom.mock.calls[0]?.[0]).toEqual(new Uint8Array([1, 2, 3]));
    expect(lame.trimFor).toHaveBeenCalledWith(
      { delaySamples: 576, paddingSamples: 1000, frames: 100, samplesPerFrame: 1152 },
      44100
    );
    expect(opened.durationSeconds).toBe(100);
    expect(opened.trimStartSeconds).toBe(0.025);
    expect(opened.buffers(5)).toBe("buffers from 5.025");
  });

  it("reads past a large ID3 block, the artwork most files carry, with a second range request", async () => {
    media.track.codec = "mp3";
    lame.id3Length.mockReturnValue(540_170);
    fetchMock.mockResolvedValueOnce(headResponse(true));
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 206,
      arrayBuffer: async () => new Uint8Array([9, 9]).buffer,
    } as unknown as Response);
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]).toEqual({
      headers: { Range: `bytes=540170-${540_170 + MP3_HEAD_BYTES - 1}` },
      credentials: "include",
    });
    expect(lame.gaplessInfoFrom.mock.calls[0]?.[0]).toEqual(new Uint8Array([9, 9]));
    expect(opened.trimStartSeconds).toBe(0.025);
  });

  it("keeps one request when the ID3 block leaves room for the first frame inside the head", async () => {
    media.track.codec = "mp3";
    lame.id3Length.mockReturnValue(MP3_HEAD_BYTES - MP3_XING_WINDOW_BYTES);
    const fullHead = new Uint8Array(MP3_HEAD_BYTES).fill(7);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 206,
      arrayBuffer: async () => fullHead.buffer,
    } as unknown as Response);
    const source = await fresh();

    await source.openPcmSource("/stream/1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lame.gaplessInfoFrom.mock.calls[0]?.[0]).toEqual(fullHead);
  });

  it("plays untrimmed when the second window cannot be read either", async () => {
    media.track.codec = "mp3";
    lame.id3Length.mockReturnValue(540_170);
    fetchMock.mockResolvedValueOnce(headResponse(true));
    fetchMock.mockResolvedValueOnce(headResponse(false));
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(opened.trimStartSeconds).toBe(0);
    expect(lame.gaplessInfoFrom).not.toHaveBeenCalled();
  });

  it("never claims more than the file's header says, even when the tag says so", async () => {
    media.track.codec = "mp3";
    lame.trimFor.mockReturnValue({ startSeconds: 0.025, durationSeconds: 300 });
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(opened.durationSeconds).toBe(200);
  });

  it("plays an mp3 untrimmed when its head cannot be read or carries no tag", async () => {
    media.track.codec = "mp3";
    const source = await fresh();

    fetchMock.mockResolvedValueOnce(headResponse(false));
    const unreadable = await source.openPcmSource("/stream/1");
    expect(unreadable.trimStartSeconds).toBe(0);
    expect(unreadable.durationSeconds).toBe(200);

    lame.gaplessInfoFrom.mockReturnValueOnce(null);
    const untagged = await source.openPcmSource("/stream/2");
    expect(untagged.trimStartSeconds).toBe(0);
    expect(lame.trimFor).not.toHaveBeenCalled();
  });

  it("drops a whole conversion sent in answer to the head's range and plays it untrimmed", async () => {
    media.track.codec = "mp3";
    const cancel = vi.fn();
    let chunks = 3;
    const body = new ReadableStream<Uint8Array>({
      pull: (controller) => {
        if (chunks === 0) {
          controller.close();
          return;
        }
        chunks -= 1;
        controller.enqueue(new Uint8Array(1024).fill(5));
      },
      cancel,
    });
    fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1?format=mp3&maxBitrate=192");

    expect(cancel).toHaveBeenCalled();
    expect(lame.gaplessInfoFrom).not.toHaveBeenCalled();
    expect(opened.trimStartSeconds).toBe(0);
    expect(opened.durationSeconds).toBe(200);
  });

  it("reads a stream the server will not range once, front to back, leaving its length to its end", async () => {
    media.track.codec = "mp3";
    media.track.headerDuration = null;
    media.headRead = true;
    fetchMock.mockResolvedValueOnce(new Response("mp3 frames", { status: 200 }));
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1?format=mp3&maxBitrate=192");

    expect(media.track.computeDuration).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(opened.durationSeconds).toBeNull();
    expect(opened.trimStartSeconds).toBe(0);
  });

  it("still measures and trims a stream the server ranges", async () => {
    media.track.codec = "mp3";
    media.headRead = true;
    fetchMock.mockResolvedValueOnce(new Response("mp3 frames", { status: 206 }));
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(media.track.getDurationFromMetadata).toHaveBeenCalled();
    expect(opened.durationSeconds).toBe(100);
    expect(opened.trimStartSeconds).toBe(0.025);
  });

  it("leaves the length unknown when the file's header does not carry one", async () => {
    media.track.codec = "opus";
    media.track.headerDuration = null;
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");

    expect(media.track.computeDuration).not.toHaveBeenCalled();
    expect(opened.durationSeconds).toBeNull();
  });

  it("closes the input when the stream has no audio or cannot be decoded here", async () => {
    const source = await fresh();

    media.missingTrack = true;
    await expect(source.openPcmSource("/stream/1")).rejects.toThrow("undecodable");
    expect(media.inputs[0]?.dispose).toHaveBeenCalledTimes(1);

    media.missingTrack = false;
    media.track.decodable = false;
    await expect(source.openPcmSource("/stream/2")).rejects.toThrow("undecodable");
    expect(media.inputs[1]?.dispose).toHaveBeenCalledTimes(1);
  });

  it("lets the caller close the input once the track is done", async () => {
    const source = await fresh();

    const opened = await source.openPcmSource("/stream/1");
    opened.dispose();

    expect(media.inputs[0]?.dispose).toHaveBeenCalledTimes(1);
  });
});
