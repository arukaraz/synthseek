import {
  MP3_HEAD_BYTES,
  MP3_XING_WINDOW_BYTES,
  PCM_NETWORK_RETRY_MAX_SECONDS,
  PCM_READ_RETRIES,
  PCM_URL_CACHE_BYTES,
  RANGE_ANSWER_STATUS,
} from "./constants";
import { gaplessInfoFrom, id3Length, trimFor } from "./lame";
import type { PcmSource, PcmTrim } from "./types";

class RefusedRead extends Error {}

async function fetchOrRefuse(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.ok) return response;
  await response.body?.cancel();
  throw new RefusedRead(`${response.status} ${response.statusText}`);
}

function readRetryDelay(previousAttempts: number, error: unknown): number | null {
  if (!(error instanceof RefusedRead)) return Math.min(previousAttempts, PCM_NETWORK_RETRY_MAX_SECONDS);
  return previousAttempts > PCM_READ_RETRIES ? null : previousAttempts;
}

async function fetchRange(url: string, from: number, length: number): Promise<Uint8Array | null> {
  const response = await fetch(url, {
    headers: { Range: `bytes=${from}-${from + length - 1}` },
    credentials: "include",
  });
  if (response.status !== RANGE_ANSWER_STATUS) {
    await response.body?.cancel();
    return null;
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function mp3Trim(url: string, sampleRate: number): Promise<PcmTrim | null> {
  const head = await fetchRange(url, 0, MP3_HEAD_BYTES);
  if (head === null) return null;
  const skip = id3Length(head);
  const frame = skip + MP3_XING_WINDOW_BYTES <= head.length ? head : await fetchRange(url, skip, MP3_HEAD_BYTES);
  if (frame === null) return null;
  const info = gaplessInfoFrom(frame);
  return info === null ? null : trimFor(info, sampleRate);
}

export async function openPcmSource(url: string): Promise<PcmSource> {
  const media = await import("mediabunny");
  const transport = { ranged: true };
  const input = new media.Input({
    source: new media.UrlSource(url, {
      requestInit: { credentials: "include" },
      maxCacheSize: PCM_URL_CACHE_BYTES,
      fetchFn: async (request, init) => {
        const response = await fetchOrRefuse(request, init);
        if (response.status !== RANGE_ANSWER_STATUS) transport.ranged = false;
        return response;
      },
      getRetryDelay: readRetryDelay,
    }),
    formats: media.ALL_FORMATS,
  });
  try {
    const track = await input.getPrimaryAudioTrack();
    if (track === null || !(await track.canDecode())) throw new Error("undecodable");
    const codec = await track.getCodec();
    const sampleRate = await track.getSampleRate();
    const rawDuration = await track.getDurationFromMetadata();
    const trim = codec === "mp3" && transport.ranged ? await mp3Trim(url, sampleRate) : null;
    const sink = new media.AudioBufferSink(track);
    return {
      durationSeconds:
        rawDuration === null || trim === null ? rawDuration : Math.min(rawDuration, trim.durationSeconds),
      sampleRate,
      trimStartSeconds: trim?.startSeconds ?? 0,
      buffers: (fromSeconds) => sink.buffers(fromSeconds + (trim?.startSeconds ?? 0)),
      dispose: () => input.dispose(),
    };
  } catch (error) {
    input.dispose();
    throw error;
  }
}
