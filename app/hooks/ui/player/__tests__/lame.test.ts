import { describe, expect, it } from "vitest";

import { gaplessInfoFrom, id3Length, trimFor } from "../lame";

function u32(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function ascii(text: string): number[] {
  return Array.from(text, (char) => char.charCodeAt(0));
}

interface HeaderSpec {
  mpeg1?: boolean;
  mono?: boolean;
  tag?: string;
  encoder?: string;
  frames?: number;
  delay?: number;
  padding?: number;
  flags?: number;
  id3?: number;
}

function mp3Head(spec: HeaderSpec = {}): Uint8Array {
  const mpeg1 = spec.mpeg1 ?? true;
  const mono = spec.mono ?? false;
  const header = [0xff, mpeg1 ? 0xfb : 0xf3, 0x90, mono ? 0xc0 : 0x00];
  const sideInfo = mpeg1 ? (mono ? 17 : 32) : mono ? 9 : 17;
  const flags = spec.flags ?? 0x0f;
  const body: number[] = [...ascii(spec.tag ?? "Info"), ...u32(flags)];
  if (flags & 0x1) body.push(...u32(spec.frames ?? 5748));
  if (flags & 0x2) body.push(...u32(6_000_000));
  if (flags & 0x4) body.push(...new Array<number>(100).fill(0));
  if (flags & 0x8) body.push(...u32(0));
  const encoder = spec.encoder ?? "LAME3.100";
  const lame = [...ascii(encoder), ...new Array<number>(21 - encoder.length).fill(0)];
  const packed = ((spec.delay ?? 576) << 12) | (spec.padding ?? 1416);
  lame.push((packed >> 16) & 0xff, (packed >> 8) & 0xff, packed & 0xff, 0, 0, 0, 0);
  const id3 = spec.id3 ?? 0;
  const prefix = id3 > 0 ? [...ascii("ID3"), 4, 0, 0, 0, 0, 0, id3 - 10, ...new Array<number>(id3 - 10).fill(0)] : [];
  return new Uint8Array([...prefix, ...header, ...new Array<number>(sideInfo).fill(0), ...body, ...lame, 0, 0, 0, 0]);
}

describe("measuring the ID3v2 block in front of the first frame", () => {
  it("reads the syncsafe size, counts the footer, and answers zero for a file without one", () => {
    const artwork = new Uint8Array([...ascii("ID3"), 3, 0, 0x10, 0x00, 0x20, 0x7c, 0x00, 0xff, 0xfb]);

    expect(id3Length(artwork)).toBe(10 + 540_160 + 10);
    expect(id3Length(mp3Head())).toBe(0);
    expect(gaplessInfoFrom(artwork)).toBeNull();
  });
});

describe("reading the gapless information LAME leaves in an mp3", () => {
  it("finds the delay and padding behind an Info tag on a stereo MPEG-1 frame", () => {
    expect(gaplessInfoFrom(mp3Head())).toEqual({
      delaySamples: 576,
      paddingSamples: 1416,
      frames: 5748,
      samplesPerFrame: 1152,
    });
  });

  it("reads it just as well behind a Xing tag, past an ID3v2 block, and on a mono MPEG-2 frame", () => {
    expect(gaplessInfoFrom(mp3Head({ tag: "Xing", id3: 40 }))?.delaySamples).toBe(576);
    expect(gaplessInfoFrom(mp3Head({ mpeg1: false, mono: true, frames: 100 }))).toEqual({
      delaySamples: 576,
      paddingSamples: 1416,
      frames: 100,
      samplesPerFrame: 576,
    });
  });

  it("follows the flags to find the LAME tag when the table of contents is absent", () => {
    expect(gaplessInfoFrom(mp3Head({ flags: 0x1, delay: 1000, padding: 5 }))).toMatchObject({
      delaySamples: 1000,
      paddingSamples: 5,
    });
  });

  it("keeps the frame count but claims no trim for an encoder that does not write one", () => {
    expect(gaplessInfoFrom(mp3Head({ encoder: "Gogo3.14" }))).toEqual({
      delaySamples: 0,
      paddingSamples: 0,
      frames: 5748,
      samplesPerFrame: 1152,
    });
  });

  it("answers nothing for a stream with no Xing frame at all, or one without a frame count", () => {
    expect(gaplessInfoFrom(mp3Head({ tag: "Zzzz" }))).toBeNull();
    expect(gaplessInfoFrom(mp3Head({ flags: 0x2 }))).toBeNull();
    expect(gaplessInfoFrom(new Uint8Array([1, 2, 3]))).toBeNull();
  });

  it("turns the tag into the seconds to skip and the seconds that remain, decoder delay included", () => {
    const trim = trimFor({ delaySamples: 576, paddingSamples: 1416, frames: 5748, samplesPerFrame: 1152 }, 44100);

    expect(trim.startSeconds).toBeCloseTo((576 + 529) / 44100, 9);
    expect(trim.durationSeconds).toBeCloseTo(150.106667, 5);
  });

  it("skips nothing and keeps every frame when the tag carries no trim", () => {
    expect(trimFor({ delaySamples: 0, paddingSamples: 0, frames: 100, samplesPerFrame: 1152 }, 48000)).toEqual({
      startSeconds: 0,
      durationSeconds: 2.4,
    });
  });
});
