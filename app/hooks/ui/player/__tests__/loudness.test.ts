import { describe, expect, it } from "vitest";

import { createPlayerTrack } from "@test/factories";
import type { PlayerReplayGain } from "@components/Player";

import { gainFactorFor, loudnessModeFor } from "../loudness";

const ON = { enabled: true, preAmpDb: 0 };

function trackWith(gain: Partial<PlayerReplayGain>, albumId = "album-1") {
  return createPlayerTrack({
    albumId,
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null, ...gain },
  });
}

describe("how loud the player asks the browser to play a track", () => {
  it("turns a loud master DOWN", () => {
    const factor = gainFactorFor(trackWith({ trackGain: -8.3, trackPeak: 1.02 }), "track", ON);
    expect(factor).toBeLessThan(1);
    expect(factor).toBeCloseTo(0.3846, 4);
  });

  it("turns a quiet master UP, which is the whole point for the tracks that annoy a listener", () => {
    const factor = gainFactorFor(trackWith({ trackGain: 3.1, trackPeak: 0.4 }), "track", ON);
    expect(factor).toBeCloseTo(1.4289, 4);
  });

  it("refuses to boost past the peak, so a quiet track with no headroom is raised less rather than clipped", () => {
    const factor = gainFactorFor(trackWith({ trackGain: 3.1, trackPeak: 0.95 }), "track", ON);
    expect(factor).toBeCloseTo(1 / 0.95, 6);
  });

  it("adds the listener's pre-amplifier on top of the correction", () => {
    const plain = gainFactorFor(trackWith({ trackGain: -8.3, trackPeak: 0.1 }), "track", ON);
    const lifted = gainFactorFor(trackWith({ trackGain: -8.3, trackPeak: 0.1 }), "track", {
      enabled: true,
      preAmpDb: 6,
    });
    expect(lifted / plain).toBeCloseTo(Math.pow(10, 6 / 20), 6);
  });

  it("leaves the audio alone when the listener turned normalization off", () => {
    expect(
      gainFactorFor(trackWith({ trackGain: -8.3, trackPeak: 1.02 }), "track", { enabled: false, preAmpDb: 6 })
    ).toBe(1);
  });

  it("leaves the audio alone when nothing has measured the track", () => {
    expect(gainFactorFor(trackWith({}), "track", ON)).toBe(1);
  });

  it("uses the album reading in album mode, which keeps the quiet track of a record quiet", () => {
    const track = trackWith({ trackGain: -8.3, trackPeak: 1.02, albumGain: -6.03, albumPeak: 1.05 });
    expect(gainFactorFor(track, "album", ON)).toBeCloseTo(Math.pow(10, -6.03 / 20), 6);
  });

  it("falls back to the track reading with the track's OWN peak when the album was never pooled", () => {
    const track = trackWith({ trackGain: 3.1, trackPeak: 0.95 });
    expect(gainFactorFor(track, "album", ON)).toBeCloseTo(1 / 0.95, 6);
  });
});

describe("choosing between track and album on its own, the way Spotify does", () => {
  it("uses ALBUM when the queue is one record played straight through", () => {
    const queue = [trackWith({}), trackWith({}), trackWith({})];
    expect(loudnessModeFor(queue, false)).toBe("album");
  });

  it("uses TRACK on shuffle, even when every track belongs to the same record", () => {
    const queue = [trackWith({}), trackWith({})];
    expect(loudnessModeFor(queue, true)).toBe("track");
  });

  it("uses TRACK when the queue mixes records, which is what a playlist is", () => {
    const queue = [trackWith({}, "album-1"), trackWith({}, "album-2")];
    expect(loudnessModeFor(queue, false)).toBe("track");
  });

  it("uses TRACK for a single track, where an album correction would preserve nothing", () => {
    expect(loudnessModeFor([trackWith({})], false)).toBe("track");
  });

  it("uses TRACK when the queue came from a device that never told us the album", () => {
    const queue = [trackWith({}, ""), trackWith({}, "")];
    expect(loudnessModeFor(queue, false)).toBe("track");
  });
});
