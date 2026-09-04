import { describe, expect, it } from "vitest";

import {
  beatIsDue,
  expectedPosition,
  mirroredPositionSeconds,
  needsConversion,
  nextIndexIn,
  playerTrackFrom,
  previousIndexIn,
  sessionChanged,
  shuffledOrder,
  streamUrlFor,
} from "../helpers";
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
    armed: false,
    remote: null,
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

describe("sessionChanged", () => {
  const base = { trackIds: ["t1", "t2"], currentTrackId: "t1", positionMs: 10_000 };

  it("saves the first session it ever sees", () => {
    expect(sessionChanged(null, base)).toBe(true);
  });

  it("saves when the listener moved to another track", () => {
    expect(sessionChanged(base, { ...base, currentTrackId: "t2" })).toBe(true);
  });

  it("saves when the queue was reordered, even at the same length", () => {
    expect(sessionChanged(base, { ...base, trackIds: ["t2", "t1"] })).toBe(true);
  });

  it("saves when the queue grew", () => {
    expect(sessionChanged(base, { ...base, trackIds: ["t1", "t2", "t3"] })).toBe(true);
  });

  it("ignores the position creeping forward by less than the drift it tolerates", () => {
    expect(sessionChanged(base, { ...base, positionMs: 14_000 })).toBe(false);
  });

  it("saves once the position has drifted far enough to be worth resuming from", () => {
    expect(sessionChanged(base, { ...base, positionMs: 15_000 })).toBe(true);
  });

  it("saves when the listener scrubbed backwards", () => {
    expect(sessionChanged(base, { ...base, positionMs: 2_000 })).toBe(true);
  });
});

describe("playerTrackFrom", () => {
  const item = {
    id: "t1",
    external_id: "ext",
    title: "Song",
    artist: "Air",
    status: "complete" as const,
    source: "deezer",
    format: "mp3" as const,
    request_type: "track" as const,
    bitrate: 320,
    file_bitrate: 1035,
    file_format: "flac",
    playable: true,
    duration_ms: 227_400,
    track_number: 1,
    disc_number: 1,
    explicit: false,
    album_id: "al1",
    albumName: "Album",
    albumArt: "https://art/1.jpg",
    genres: [],
    playlistIds: [],
    created_at: new Date("2024-01-01T00:00:00Z"),
    completed_at: null,
  };

  it("believes the file on disk over what was requested", () => {
    const track = playerTrackFrom(item);
    expect(track.format).toBe("flac");
    expect(track.bitrateKbps).toBe(1035);
    expect(track.lossless).toBe(true);
  });

  it("falls back to the requested format when nothing was measured", () => {
    const track = playerTrackFrom({ ...item, file_format: null, file_bitrate: null });
    expect(track.format).toBe("mp3");
    expect(track.bitrateKbps).toBe(320);
    expect(track.lossless).toBe(false);
  });

  it("rounds the duration to whole seconds", () => {
    expect(playerTrackFrom(item).durationSeconds).toBe(227);
  });
});

describe("beatIsDue", () => {
  it("reports in the first time it is ever asked", () => {
    expect(beatIsDue(0, 1_000_000)).toBe(true);
  });

  it("refuses to report in again straight away, so a remounted effect cannot flood the server", () => {
    expect(beatIsDue(1_000_000, 1_000_100)).toBe(false);
  });

  it("reports in again once the interval has passed", () => {
    expect(beatIsDue(1_000_000, 1_015_000)).toBe(true);
  });
});

describe("mirroredPositionSeconds", () => {
  const remote = { deviceId: "d1", deviceName: "Web Player (Chrome)", trackId: "t1", updatedAt: 10_000 };

  it("carries the reported position forward while the other device keeps playing", () => {
    expect(mirroredPositionSeconds({ ...remote, playing: true, positionSeconds: 30 }, 14_000)).toBe(34);
  });

  it("holds the position still once that device paused", () => {
    expect(mirroredPositionSeconds({ ...remote, playing: false, positionSeconds: 30 }, 99_000)).toBe(30);
  });

  it("never runs backwards when a clock disagrees", () => {
    expect(mirroredPositionSeconds({ ...remote, playing: true, positionSeconds: 30 }, 1_000)).toBe(30);
  });
});

describe("expectedPosition", () => {
  it("advances a playing position by the time that passed", () => {
    expect(expectedPosition({ playing: true, positionSeconds: 10, at: 1_000 }, 6_000)).toBe(15);
  });

  it("leaves a paused position where it was", () => {
    expect(expectedPosition({ playing: false, positionSeconds: 10, at: 1_000 }, 60_000)).toBe(10);
  });
});
