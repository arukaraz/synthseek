import { describe, expect, it } from "vitest";

import { clipBuffer, leadFilled, positionOf, roundToSample } from "../pcm-schedule";

describe("clipping a decoded buffer to the track it belongs to", () => {
  it("passes a buffer inside the track through unchanged", () => {
    expect(clipBuffer(10, 0.5, 0, 200)).toEqual({ startSeconds: 10, offsetSeconds: 0, playSeconds: 0.5 });
  });

  it("shifts a buffer by the encoder delay and starts inside the one that straddles it", () => {
    const first = clipBuffer(0, 0.026, 0.025, 200);
    expect(first?.startSeconds).toBe(0);
    expect(first?.offsetSeconds).toBeCloseTo(0.025, 9);
    expect(first?.playSeconds).toBeCloseTo(0.001, 9);
    expect(clipBuffer(0.026, 0.026, 0.025, 200)?.startSeconds).toBeCloseTo(0.001, 9);
  });

  it("drops a buffer that lies entirely in the delay, or entirely past the end", () => {
    expect(clipBuffer(0, 0.02, 0.025, 200)).toBeNull();
    expect(clipBuffer(200, 0.026, 0, 200)).toBeNull();
  });

  it("cuts the last buffer at the exact end of the track", () => {
    const last = clipBuffer(199.99, 0.026, 0, 200);
    expect(last?.startSeconds).toBe(199.99);
    expect(last?.offsetSeconds).toBe(0);
    expect(last?.playSeconds).toBeCloseTo(0.01, 9);
  });

  it("refuses a buffer with no length", () => {
    expect(clipBuffer(5, 0, 0, 200)).toBeNull();
  });
});

describe("timing helpers", () => {
  it("rounds a start time onto the context's sample grid", () => {
    expect(roundToSample(1.00001, 48000)).toBe(1);
    expect(roundToSample(0.0500104, 48000)).toBe(2400 / 48000);
  });

  it("knows when enough audio is scheduled ahead of the play head", () => {
    expect(leadFilled(18, 10, 8)).toBe(true);
    expect(leadFilled(17.9, 10, 8)).toBe(false);
  });

  it("reads the position off the audio clock, never before the start nor past the end", () => {
    expect(positionOf(100, 130.5, 200)).toBe(30.5);
    expect(positionOf(100, 90, 200)).toBe(0);
    expect(positionOf(100, 400, 200)).toBe(200);
  });
});
