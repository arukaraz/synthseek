import { MP3_DECODER_DELAY_SAMPLES, MP3_SAMPLES_PER_FRAME_MPEG1, MP3_SAMPLES_PER_FRAME_MPEG2 } from "./constants";
import type { GaplessInfo, PcmTrim } from "./types";

const ID3_HEADER_BYTES = 10;
const ID3_FOOTER_FLAG = 0x10;
const XING_FLAG_FRAMES = 0x1;
const XING_FLAG_BYTES = 0x2;
const XING_FLAG_TOC = 0x4;
const XING_FLAG_QUALITY = 0x8;
const XING_TOC_BYTES = 100;
const LAME_TAG_DELAY_OFFSET = 21;
const GAPLESS_ENCODERS: readonly string[] = ["LAME", "Lavc", "Lavf"];

function ascii(bytes: Uint8Array, at: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index += 1) text += String.fromCharCode(bytes[at + index] ?? 0);
  return text;
}

function u32(bytes: Uint8Array, at: number): number {
  return (
    ((bytes[at] ?? 0) * 0x1000000 +
      ((bytes[at + 1] ?? 0) << 16) +
      ((bytes[at + 2] ?? 0) << 8) +
      (bytes[at + 3] ?? 0)) >>>
    0
  );
}

export function id3Length(bytes: Uint8Array): number {
  if (ascii(bytes, 0, 3) !== "ID3") return 0;
  const size = ((bytes[6] ?? 0) << 21) | ((bytes[7] ?? 0) << 14) | ((bytes[8] ?? 0) << 7) | (bytes[9] ?? 0);
  const footer = ((bytes[5] ?? 0) & ID3_FOOTER_FLAG) !== 0 ? ID3_HEADER_BYTES : 0;
  return ID3_HEADER_BYTES + size + footer;
}

function frameSync(bytes: Uint8Array, from: number): number | null {
  for (let at = from; at + 4 <= bytes.length; at += 1) {
    if (bytes[at] === 0xff && ((bytes[at + 1] ?? 0) & 0xe0) === 0xe0) return at;
  }
  return null;
}

function xingOffset(bytes: Uint8Array, frame: number): { at: number; mpeg1: boolean } {
  const mpeg1 = (((bytes[frame + 1] ?? 0) >> 3) & 0x3) === 0x3;
  const mono = (((bytes[frame + 3] ?? 0) >> 6) & 0x3) === 0x3;
  const sideInfo = mpeg1 ? (mono ? 17 : 32) : mono ? 9 : 17;
  return { at: frame + 4 + sideInfo, mpeg1 };
}

export function gaplessInfoFrom(bytes: Uint8Array): GaplessInfo | null {
  const frame = frameSync(bytes, id3Length(bytes));
  if (frame === null) return null;
  const { at, mpeg1 } = xingOffset(bytes, frame);
  const tag = ascii(bytes, at, 4);
  if (tag !== "Xing" && tag !== "Info") return null;
  const flags = u32(bytes, at + 4);
  if ((flags & XING_FLAG_FRAMES) === 0) return null;
  let cursor = at + 8;
  const frames = u32(bytes, cursor);
  cursor += 4;
  if ((flags & XING_FLAG_BYTES) !== 0) cursor += 4;
  if ((flags & XING_FLAG_TOC) !== 0) cursor += XING_TOC_BYTES;
  if ((flags & XING_FLAG_QUALITY) !== 0) cursor += 4;
  const samplesPerFrame = mpeg1 ? MP3_SAMPLES_PER_FRAME_MPEG1 : MP3_SAMPLES_PER_FRAME_MPEG2;
  if (!GAPLESS_ENCODERS.includes(ascii(bytes, cursor, 4)) || cursor + LAME_TAG_DELAY_OFFSET + 3 > bytes.length) {
    return { delaySamples: 0, paddingSamples: 0, frames, samplesPerFrame };
  }
  const packed =
    ((bytes[cursor + LAME_TAG_DELAY_OFFSET] ?? 0) << 16) |
    ((bytes[cursor + LAME_TAG_DELAY_OFFSET + 1] ?? 0) << 8) |
    (bytes[cursor + LAME_TAG_DELAY_OFFSET + 2] ?? 0);
  return { delaySamples: packed >> 12, paddingSamples: packed & 0xfff, frames, samplesPerFrame };
}

export function trimFor(info: GaplessInfo, sampleRate: number): PcmTrim {
  const total = info.frames * info.samplesPerFrame;
  if (info.delaySamples === 0 && info.paddingSamples === 0) {
    return { startSeconds: 0, durationSeconds: total / sampleRate };
  }
  const start = info.delaySamples + MP3_DECODER_DELAY_SAMPLES;
  const kept = Math.max(0, total - info.delaySamples - info.paddingSamples);
  return { startSeconds: start / sampleRate, durationSeconds: kept / sampleRate };
}
