import { describe, expect, it } from "vitest";

import { flushResampler, resampleChunk, startResampler } from "../pcm-resample";

function sine(frames: number, rate: number, hz: number): Float32Array {
  return Float32Array.from({ length: frames }, (_, at) => Math.sin((2 * Math.PI * hz * at) / rate));
}

function resampleInChunks(signal: Float32Array, sizes: readonly number[], from: number, to: number): Float32Array[] {
  const state = startResampler(from, to, 1);
  const out: Float32Array[] = [];
  let at = 0;
  for (const size of sizes) {
    const piece = signal.subarray(at, at + size);
    at += size;
    const planes = resampleChunk(state, [piece]);
    if (planes[0] !== undefined && planes[0].length > 0) out.push(planes[0]);
  }
  const tail = flushResampler(state);
  if (tail[0] !== undefined && tail[0].length > 0) out.push(tail[0]);
  return out;
}

function joined(parts: readonly Float32Array[]): Float32Array {
  const all = new Float32Array(parts.reduce((total, part) => total + part.length, 0));
  let at = 0;
  for (const part of parts) {
    all.set(part, at);
    at += part.length;
  }
  return all;
}

describe("resampling decoded audio as one continuous stream", () => {
  it("gives the same samples whatever size the decoder's chunks come in", () => {
    const signal = sine(48_000, 48_000, 220);
    const frames = Array.from({ length: 41 }, () => 1152);
    frames.push(48_000 - 41 * 1152);

    const chunked = joined(resampleInChunks(signal, frames, 48_000, 44_100));
    const whole = joined(resampleInChunks(signal, [48_000], 48_000, 44_100));

    expect(chunked).toEqual(whole);
  });

  it("produces exactly the target rate's worth of samples for the input's duration", () => {
    const signal = sine(48_000, 48_000, 220);

    const out = joined(
      resampleInChunks(
        signal,
        Array.from({ length: 48 }, () => 1000),
        48_000,
        44_100
      )
    );

    expect(out.length).toBe(44_100);
  });

  it("follows a smooth tone without a jump at any chunk boundary", () => {
    const signal = sine(48_000, 48_000, 5);
    const out = joined(
      resampleInChunks(
        signal,
        Array.from({ length: 48 }, () => 1000),
        48_000,
        44_100
      )
    );

    const steps = Array.from({ length: out.length - 1 }, (_, at) => Math.abs((out[at + 1] ?? 0) - (out[at] ?? 0)));
    const expectedStep = (2 * Math.PI * 5) / 44_100;
    expect(Math.max(...steps)).toBeLessThan(expectedStep * 1.01);
  });

  it("upsamples a stream as continuously as it downsamples one", () => {
    const signal = sine(44_100, 44_100, 220);

    const chunked = joined(
      resampleInChunks(
        signal,
        Array.from({ length: 49 }, () => 900),
        44_100,
        48_000
      )
    );
    const whole = joined(resampleInChunks(signal, [44_100], 44_100, 48_000));

    expect(chunked).toEqual(whole);
    expect(whole.length).toBe(48_000);
  });

  it("keeps every channel in step", () => {
    const left = sine(4800, 48_000, 220);
    const right = sine(4800, 48_000, 330);
    const state = startResampler(48_000, 44_100, 2);

    const first = resampleChunk(state, [left.subarray(0, 1152), right.subarray(0, 1152)]);
    const rest = resampleChunk(state, [left.subarray(1152), right.subarray(1152)]);
    const tail = flushResampler(state);

    expect(first[0]?.length).toBe(first[1]?.length);
    expect(rest[0]?.length).toBe(rest[1]?.length);
    expect(tail[0]?.length).toBe(tail[1]?.length);
    expect((first[0]?.length ?? 0) + (rest[0]?.length ?? 0) + (tail[0]?.length ?? 0)).toBe(4410);
  });
});
