import { describe, expect, it } from "vitest";

import { needsConversion, nextIndexIn, previousIndexIn, shuffledOrder, streamUrlFor } from "../helpers";
import type { PlayerSessionState } from "../types";

function sessionWith(overrides: Partial<PlayerSessionState>): PlayerSessionState {
  return {
    queue: [],
    index: 0,
    playing: false,
    loading: false,
    positionSeconds: 0,
    durationSeconds: 0,
    scrubSeconds: null,
    volume: 0.8,
    muted: false,
    shuffle: false,
    shuffleOrder: [],
    repeat: "off",
    transcoding: false,
    offsetSeconds: 0,
    chainVisible: false,
    moreOpen: false,
    devicesOpen: false,
    fullscreen: false,
    notice: null,
    consecutiveFailures: 0,
    started: false,
    ...overrides,
  };
}

function queueOf(length: number): PlayerSessionState["queue"] {
  return Array.from({ length }, (_, index) => ({
    id: `t${index}`,
    title: `Track ${index}`,
    artist: "Artist",
    album: "Album",
    durationSeconds: 100,
    format: "mp3",
    bitrateKbps: 320,
    lossless: false,
    tone: "primary" as const,
    artworkUrl: null,
  }));
}

describe("streamUrlFor", () => {
  it("escapes an id so it cannot break out of the path", () => {
    expect(streamUrlFor("a/b?c", false, 0)).toBe("/api/v1/library/tracks/a%2Fb%3Fc/stream");
  });

  it("asks for the original file when the browser can decode it", () => {
    expect(streamUrlFor("t1", false, 90)).toBe("/api/v1/library/tracks/t1/stream");
  });

  it("asks for a conversion when the browser cannot", () => {
    expect(streamUrlFor("t1", true, 0)).toBe("/api/v1/library/tracks/t1/stream?format=mp3&maxBitrate=320");
  });

  it("carries the position so a converted stream can be seeked", () => {
    expect(streamUrlFor("t1", true, 90.7)).toBe("/api/v1/library/tracks/t1/stream?format=mp3&maxBitrate=320&offset=90");
  });
});

describe("needsConversion", () => {
  it("plays a format the browser accepts as it is", () => {
    expect(needsConversion("FLAC", (mimeType) => mimeType === "audio/flac")).toBe(false);
  });

  it("converts a format the browser rejects", () => {
    expect(needsConversion("flac", () => false)).toBe(true);
  });

  it("converts a format nobody knows the media type of", () => {
    expect(needsConversion("wma", () => true)).toBe(true);
  });
});

describe("shuffledOrder", () => {
  it("starts on the track the listener picked", () => {
    expect(shuffledOrder(6, 3)[0]).toBe(3);
  });

  it("visits every position exactly once", () => {
    const order = shuffledOrder(8, 5);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("nextIndexIn", () => {
  it("walks the queue in order when shuffle is off", () => {
    expect(nextIndexIn(sessionWith({ queue: queueOf(3), index: 1 }))).toBe(2);
  });

  it("stops at the end of the queue", () => {
    expect(nextIndexIn(sessionWith({ queue: queueOf(3), index: 2 }))).toBeNull();
  });

  it("follows the shuffled order rather than the queue order", () => {
    const state = sessionWith({ queue: queueOf(4), index: 2, shuffle: true, shuffleOrder: [2, 0, 3, 1] });
    expect(nextIndexIn(state)).toBe(0);
  });

  it("stops at the end of the shuffled order", () => {
    const state = sessionWith({ queue: queueOf(4), index: 1, shuffle: true, shuffleOrder: [2, 0, 3, 1] });
    expect(nextIndexIn(state)).toBeNull();
  });
});

describe("previousIndexIn", () => {
  it("steps back through the queue when shuffle is off", () => {
    expect(previousIndexIn(sessionWith({ queue: queueOf(3), index: 1 }))).toBe(0);
  });

  it("has nowhere to go from the first track", () => {
    expect(previousIndexIn(sessionWith({ queue: queueOf(3), index: 0 }))).toBeNull();
  });

  it("steps back through the shuffled order", () => {
    const state = sessionWith({ queue: queueOf(4), index: 3, shuffle: true, shuffleOrder: [2, 0, 3, 1] });
    expect(previousIndexIn(state)).toBe(0);
  });
});
