import { describe, expect, it } from "vitest";

import {
  accumulateListen,
  beatIsDue,
  beginListen,
  expectedPosition,
  isMirroring,
  listenIsDue,
  listenRestarted,
  listenThresholdSeconds,
  mirroredPositionSeconds,
  needsConversion,
  nextIndexIn,
  queueChanged,
  playerTrackFrom,
  previousIndexIn,
  sessionChanged,
  shuffledOrder,
  startedSecondsAgo,
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
  const remote = {
    deviceId: "d1",
    deviceName: "Web Player (Chrome)",
    trackId: "t1",
    updatedAt: 10_000,
    shuffle: false,
    repeat: "off" as const,
    volume: 0.8,
    muted: false,
    transcoding: false,
  };

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

describe("queueChanged", () => {
  const base = { trackIds: ["t1", "t2"], currentTrackId: "t1", positionMs: 10_000 };

  it("is what makes a brand new queue worth saving at once", () => {
    expect(queueChanged(null, base)).toBe(true);
    expect(queueChanged(base, { ...base, trackIds: ["t3"] })).toBe(true);
    expect(queueChanged(base, { ...base, currentTrackId: "t2" })).toBe(true);
  });

  it("does not fire for a position that merely moved on", () => {
    expect(queueChanged(base, { ...base, positionMs: 90_000 })).toBe(false);
  });
});

describe("isMirroring", () => {
  const mirrored = {
    deviceId: "d1",
    deviceName: "Web Player (Firefox)",
    confirmed: true,
    playing: true,
    track: null,
    positionSeconds: 10,
    shuffle: false,
    repeat: "off" as const,
    volume: 0.8,
    muted: false,
    transcoding: false,
    updatedAt: 1_000,
  };

  it("is not mirroring when nobody else holds the audio", () => {
    expect(isMirroring(sessionWith({ remote: null }))).toBe(false);
  });

  it("is mirroring while another device holds it", () => {
    expect(isMirroring(sessionWith({ remote: mirrored }))).toBe(true);
  });

  it("is never mirroring while this tab is the one making sound, whatever it still remembers", () => {
    expect(isMirroring(sessionWith({ remote: mirrored, playing: true }))).toBe(false);
  });
});

describe("the listen accumulator", () => {
  const started = beginListen("t1", 1_000_000, 0);

  it("counts the seconds the audio actually advanced", () => {
    const heard = accumulateListen(accumulateListen(started, 1), 2);

    expect(heard.listenedSeconds).toBe(2);
  });

  it("does not count a jump forward, because a seek is not listening", () => {
    const seeked = accumulateListen(started, 90);

    expect(seeked.listenedSeconds).toBe(0);
    expect(seeked.lastPositionSeconds).toBe(90);
  });

  it("does not count a jump backwards either", () => {
    const seeked = accumulateListen(accumulateListen(started, 3), 1);

    expect(seeked.listenedSeconds).toBe(3);
  });

  it("keeps counting after a seek, from wherever it landed", () => {
    const afterSeek = accumulateListen(accumulateListen(started, 90), 91);

    expect(afterSeek.listenedSeconds).toBe(1);
  });
});

describe("listenThresholdSeconds", () => {
  it("asks for half of a short track", () => {
    expect(listenThresholdSeconds(180)).toBe(90);
  });

  it("never asks for more than four minutes of a long one", () => {
    expect(listenThresholdSeconds(3600)).toBe(240);
  });
});

describe("listenIsDue", () => {
  const heard = (seconds: number) => ({ ...beginListen("t1", 0, 0), listenedSeconds: seconds });

  it("is not due one second short of the threshold", () => {
    expect(listenIsDue(heard(89), 180)).toBe(false);
  });

  it("is due at the threshold", () => {
    expect(listenIsDue(heard(90), 180)).toBe(true);
  });

  it("is never due twice for the same play", () => {
    expect(listenIsDue({ ...heard(90), recorded: true }, 180)).toBe(false);
  });

  it("is never due for a track of unknown length", () => {
    expect(listenIsDue(heard(600), 0)).toBe(false);
  });
});

describe("listenRestarted", () => {
  const recorded = { ...beginListen("t1", 0, 0), lastPositionSeconds: 180, recorded: true };

  it("sees a loop back to the top as a new play once the first one counted", () => {
    expect(listenRestarted(recorded, 0)).toBe(true);
  });

  it("does not see the ordinary advance as a restart", () => {
    expect(listenRestarted({ ...recorded, lastPositionSeconds: 180 }, 181)).toBe(false);
  });

  it("does not restart a play that has not counted yet, however far back it is dragged", () => {
    expect(listenRestarted({ ...recorded, recorded: false }, 0)).toBe(false);
  });
});

describe("startedSecondsAgo", () => {
  it("measures from when the play began", () => {
    expect(startedSecondsAgo(beginListen("t1", 1_000_000, 0), 1_090_000)).toBe(90);
  });

  it("never reports a play that started in the future", () => {
    expect(startedSecondsAgo(beginListen("t1", 1_090_000, 0), 1_000_000)).toBe(0);
  });
});
