import { describe, expect, it } from "vitest";

import {
  effectivePlayerMode,
  followed,
  formatClock,
  fractionFromPointer,
  lyricDepth,
  nextRepeat,
  percentOf,
  restorablePlayerMode,
  secondsFromPointer,
  shouldRestart,
  softLimit,
  trackInitials,
  waveEnvelope,
  wavePhase,
} from "../helpers";

function rect(left: number, width: number): DOMRect {
  return { left, width, top: 0, right: left + width, bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({}) };
}

describe("effectivePlayerMode", () => {
  const node = document.createElement("div");

  it("keeps the chosen mode once its surface exists", () => {
    expect(effectivePlayerMode("compact", node)).toBe("compact");
    expect(effectivePlayerMode("mini", node)).toBe("mini");
  });

  it("falls back to normal when the surface is missing, so the dock and the CSS agree", () => {
    expect(effectivePlayerMode("compact", null)).toBe("normal");
    expect(effectivePlayerMode("mini", null)).toBe("normal");
  });
});

describe("restorablePlayerMode", () => {
  it("accepts the modes a reload can put back on its own", () => {
    expect(restorablePlayerMode("normal")).toBe("normal");
    expect(restorablePlayerMode("compact")).toBe("compact");
  });

  it("refuses mini, whose window needs a user gesture no reload can supply", () => {
    expect(restorablePlayerMode("mini")).toBeNull();
  });

  it("refuses a value that is not a mode at all", () => {
    expect(restorablePlayerMode("COMPACT")).toBeNull();
    expect(restorablePlayerMode("")).toBeNull();
    expect(restorablePlayerMode(null)).toBeNull();
  });
});

describe("formatClock", () => {
  it("pads the seconds below ten", () => {
    expect(formatClock(65)).toBe("1:05");
  });

  it("switches to hours once the track passes an hour", () => {
    expect(formatClock(3600)).toBe("1:00:00");
    expect(formatClock(3725)).toBe("1:02:05");
  });

  it("clamps a negative position to zero", () => {
    expect(formatClock(-12)).toBe("0:00");
  });
});

describe("trackInitials", () => {
  it("takes one initial per word, up to two", () => {
    expect(trackInitials("Kansas Live")).toBe("KL");
    expect(trackInitials("Nifelheim")).toBe("N");
  });

  it("keeps letters outside ASCII", () => {
    expect(trackInitials("Älvagrimmar Blå")).toBe("ÄB");
  });

  it("falls back when the album has no letters or digits", () => {
    expect(trackInitials("!!! ---")).toBe("?");
  });
});

describe("percentOf", () => {
  it("reports the share of the duration", () => {
    expect(percentOf(30, 120)).toBe(25);
  });

  it("returns zero when the duration is unknown", () => {
    expect(percentOf(30, 0)).toBe(0);
  });

  it("clamps past the end", () => {
    expect(percentOf(500, 100)).toBe(100);
  });
});

describe("pointer maths", () => {
  it("maps a pointer inside the track to a position", () => {
    expect(secondsFromPointer(150, rect(100, 200), 60)).toBe(15);
  });

  it("clamps a pointer dragged outside the track", () => {
    expect(secondsFromPointer(20, rect(100, 200), 60)).toBe(0);
    expect(secondsFromPointer(400, rect(100, 200), 60)).toBe(60);
  });

  it("returns zero for a collapsed track", () => {
    expect(fractionFromPointer(150, rect(100, 0))).toBe(0);
  });
});

describe("repeat and restart rules", () => {
  it("cycles off, all, one", () => {
    expect(nextRepeat("off")).toBe("all");
    expect(nextRepeat("all")).toBe("one");
    expect(nextRepeat("one")).toBe("off");
  });

  it("restarts the track only after the opening seconds", () => {
    expect(shouldRestart(1)).toBe(false);
    expect(shouldRestart(9)).toBe(true);
  });
});

describe("waveEnvelope", () => {
  it("silences both ends of the strip so the wave meets the baseline", () => {
    expect(waveEnvelope(0, 200)).toBeCloseTo(0, 6);
    expect(waveEnvelope(200, 200)).toBeCloseTo(0, 6);
  });

  it("reaches full height at the middle", () => {
    expect(waveEnvelope(100, 200)).toBeCloseTo(1, 6);
  });

  it("grows monotonically towards the middle", () => {
    expect(waveEnvelope(50, 200)).toBeGreaterThan(waveEnvelope(20, 200));
    expect(waveEnvelope(90, 200)).toBeGreaterThan(waveEnvelope(50, 200));
  });

  it("falls away steeply rather than linearly, which is what keeps the ends quiet", () => {
    expect(waveEnvelope(50, 200)).toBeCloseTo(0.354, 3);
  });

  it("returns zero for a collapsed strip", () => {
    expect(waveEnvelope(10, 0)).toBe(0);
  });
});

describe("wavePhase", () => {
  it("gives the same track the same wave and another track a different one", () => {
    expect(wavePhase("track-a")).toBe(wavePhase("track-a"));
    expect(wavePhase("track-b")).not.toBe(wavePhase("track-a"));
  });

  it("stays inside one turn", () => {
    ["track-a", "track-b", "", "a-very-long-track-identifier-9481"].forEach((id) => {
      expect(wavePhase(id)).toBeGreaterThanOrEqual(0);
      expect(wavePhase(id)).toBeLessThan(Math.PI * 2);
    });
  });

  it("spreads across the whole turn instead of bunching near the start", () => {
    const phases = Array.from({ length: 40 }, (_, index) => wavePhase(`track-${index}`));
    expect(Math.max(...phases)).toBeGreaterThan(Math.PI);
  });
});

describe("softLimit", () => {
  it("leaves a quiet wave untouched below the knee", () => {
    expect(softLimit(5, 100)).toBe(5);
    expect(softLimit(70, 100)).toBe(70);
  });

  it("never crosses the edge it is given, however loud the audio gets", () => {
    [80, 100, 200, 1000, 100000].forEach((value) => {
      expect(softLimit(value, 100)).toBeLessThanOrEqual(100);
    });
  });

  it("keeps a margin at the loudest the player can actually ask for", () => {
    expect(softLimit(21.6, 16.8)).toBeLessThan(16.8);
  });

  it("keeps growing with the input so louder still reads as taller", () => {
    expect(softLimit(120, 100)).toBeGreaterThan(softLimit(90, 100));
    expect(softLimit(200, 100)).toBeGreaterThan(softLimit(120, 100));
  });

  it("gives a collapsed strip no amplitude at all", () => {
    expect(softLimit(40, 0)).toBe(0);
    expect(softLimit(40, -3)).toBe(0);
  });
});

describe("followed", () => {
  it("moves towards the target without overshooting it", () => {
    const next = followed(0, 1, 120, 120);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  it("covers more ground the longer the frame took", () => {
    expect(followed(0, 1, 200, 120)).toBeGreaterThan(followed(0, 1, 40, 120));
  });

  it("holds still when no time passed", () => {
    expect(followed(0.4, 1, 0, 120)).toBe(0.4);
  });

  it("holds still rather than running backwards when the clock jumps back", () => {
    expect(followed(0.4, 1, -50, 120)).toBe(0.4);
  });

  it("closes the gap from either side", () => {
    expect(followed(1, 0, 120, 120)).toBeLessThan(1);
    expect(followed(1, 0, 120, 120)).toBeGreaterThan(0);
  });
});

describe("lyricDepth", () => {
  it("keeps the line playing and its neighbours sharp", () => {
    expect(lyricDepth(10, 10)).toBe("near");
    expect(lyricDepth(10, 11)).toBe("near");
  });

  it("softens a line two away, which is where the blur starts", () => {
    expect(lyricDepth(10, 12)).toBe("mid");
    expect(lyricDepth(10, 8)).toBe("mid");
  });

  it("pushes a line four away furthest back", () => {
    expect(lyricDepth(10, 14)).toBe("far");
    expect(lyricDepth(10, 6)).toBe("far");
  });

  it("treats an unsynced lyric as one flat plane, since no line is playing", () => {
    expect(lyricDepth(null, 40)).toBe("near");
  });
});
