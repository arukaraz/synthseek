import { describe, expect, it } from "vitest";

import {
  formatClock,
  fractionFromPointer,
  lyricDepth,
  nextRepeat,
  percentOf,
  secondsFromPointer,
  shouldRestart,
  trackInitials,
  waveLobePaths,
} from "../helpers";

function rect(left: number, width: number): DOMRect {
  return { left, width, top: 0, right: left + width, bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({}) };
}

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

describe("waveLobePaths", () => {
  it("draws one closed path per lobe", () => {
    const paths = waveLobePaths("track-a");
    expect(paths).toHaveLength(3);
    paths.forEach((path) => {
      expect(path.startsWith("M")).toBe(true);
      expect(path.endsWith("Z")).toBe(true);
    });
  });

  it("draws the same wave for the same track and a different one for another", () => {
    expect(waveLobePaths("track-a")).toBe(waveLobePaths("track-a"));
    expect(waveLobePaths("track-b")[0]).not.toBe(waveLobePaths("track-a")[0]);
  });

  it("keeps every point inside the view box", () => {
    waveLobePaths("track-c").forEach((path) => {
      const values = path.match(/,(-?\d+\.\d)/g) ?? [];
      values.forEach((value) => {
        const y = Number(value.slice(1));
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(100);
      });
    });
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
