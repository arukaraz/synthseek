import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerTrack } from "@components/Player";

import { DIAGNOSTICS } from "../constants";
import { diagnosticBase, sendable } from "../diagnostics";
import { elementErrorCause, thrownCause } from "../failure-cause";
import type { RecordedDiagnostic } from "../types";

function track(overrides: Partial<PlayerTrack> = {}): PlayerTrack {
  return {
    id: "t1",
    title: "Song",
    artist: "Band",
    album: "Record",
    durationSeconds: 200,
    format: "mp3",
    bitrateKbps: 320,
    lossless: false,
    tone: "primary",
    artworkUrl: null,
    albumId: "album-1",
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    sources: [],
    ...overrides,
  };
}

let diagnostics: typeof import("../diagnostics");

beforeEach(async () => {
  vi.resetModules();
  diagnostics = await import("../diagnostics");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("diagnosticBase", () => {
  it("labels the track by artist and title and clips a long label", () => {
    expect(diagnosticBase(track(), 10).label).toBe("Band - Song");
    expect(diagnosticBase(track({ title: "x".repeat(500) }), 10).label).toHaveLength(DIAGNOSTICS.MAX_LABEL_LENGTH);
  });

  it("clips a track id the server would refuse, so one event cannot sink its batch", () => {
    expect(diagnosticBase(track({ id: "i".repeat(500) }), 0).trackId).toHaveLength(DIAGNOSTICS.MAX_TRACK_ID_LENGTH);
  });

  it("keeps the position inside what the server accepts", () => {
    expect(diagnosticBase(null, Number.NaN).positionSeconds).toBe(0);
    expect(diagnosticBase(null, -5).positionSeconds).toBe(0);
    expect(diagnosticBase(null, Number.MAX_SAFE_INTEGER).positionSeconds).toBe(DIAGNOSTICS.MAX_POSITION_SECONDS);
  });
});

describe("the diagnostics buffer", () => {
  it("holds events until a sink connects, then hands them over in order", () => {
    diagnostics.recordDroppedCommand("seek", new Error("a"));
    diagnostics.recordDroppedCommand("pause", new Error("b"));
    const received: RecordedDiagnostic[] = [];

    diagnostics.setDiagnosticsSink((event) => received.push(event));

    expect(received.map((event) => (event.kind === "remoteCommandDropped" ? event.command : null))).toEqual([
      "seek",
      "pause",
    ]);
  });

  it("keeps only the newest events while nothing listens", () => {
    for (let index = 0; index < DIAGNOSTICS.MAX_BUFFERED + 3; index += 1) {
      diagnostics.recordDiagnostic({ ...diagnosticBase(null, index), kind: "userSkip", direction: "next" });
    }
    const received: RecordedDiagnostic[] = [];

    diagnostics.setDiagnosticsSink((event) => received.push(event));

    expect(received).toHaveLength(DIAGNOSTICS.MAX_BUFFERED);
    expect(received[0]?.positionSeconds).toBe(3);
  });
});

describe("sendable", () => {
  it("turns the recording time into an age and never a negative one", () => {
    const event: RecordedDiagnostic = { ...diagnosticBase(null, 0), at: 1000, kind: "userSkip", direction: "next" };

    expect(sendable(event, 3500).ageMs).toBe(2500);
    expect(sendable(event, 500).ageMs).toBe(0);
    expect(sendable(event, 3500)).not.toHaveProperty("at");
  });
});

describe("failure causes", () => {
  it("names a thrown error by its type and message", () => {
    expect(thrownCause(new TypeError("bad"))).toBe("TypeError: bad");
    expect(thrownCause("plain")).toBe("plain");
  });

  it("says when the element failed without a media error", () => {
    const element = document.createElement("audio");

    expect(elementErrorCause(element)).toBe("media error without detail; network state 0, ready state 0");
  });
});
