import { describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import {
  clockLabel,
  comparedCopiesOf,
  describeCopies,
  percent,
  positionAtPointer,
  rulerTicks,
  spansLibraryPaths,
  waveformPath,
} from "../helpers";
import type { DuplicateCopy, DuplicateGroup } from "../types";

function copy(overrides: Partial<DuplicateCopy> = {}): DuplicateCopy {
  return {
    id: "file-1",
    libraryPath: "Music",
    relativePath: "A/B/01 - Song.flac",
    fileName: "01 - Song.flac",
    sizeBytes: 1000,
    fileFormat: "flac",
    durationSeconds: 180,
    loudnessLufs: -9,
    serving: true,
    offsetSeconds: 1.5,
    peaks: [],
    differences: [],
    ...overrides,
  };
}

function group(copies: DuplicateCopy[]): DuplicateGroup {
  return { requestId: "req-1", artist: "Artist", title: "Song", reclaimableBytes: 0, copies };
}

const t = i18n.getFixedT("en", "settings");

describe("the line under a duplicated song", () => {
  it("counts the copies and names each format once, in the order they come", () => {
    const copies = [copy(), copy({ id: "2", fileFormat: "mp3" }), copy({ id: "3", fileFormat: "flac" })];
    expect(describeCopies(group(copies), t)).toBe("3 copies · FLAC, MP3");
  });

  it("names each copy's library only when the copies sit in more than one", () => {
    expect(spansLibraryPaths(group([copy(), copy({ id: "2" })]))).toBe(false);
    expect(spansLibraryPaths(group([copy(), copy({ id: "2", libraryPath: "Archive" })]))).toBe(true);
  });
});

describe("what the comparator plays", () => {
  it("streams each copy from its own library file", () => {
    const [compared] = comparedCopiesOf(group([copy({ id: "file/1" })]));
    expect(compared).toEqual({
      id: "file/1",
      src: "/api/v1/library-copies/file%2F1/audio",
      offsetSeconds: 1.5,
      loudnessLufs: -9,
      durationSeconds: 180,
    });
  });
});

describe("the timeline drawing", () => {
  it("draws one centred bar per peak, scaled to the waveform height", () => {
    expect(waveformPath([255, 0])).toBe("M0.5 0V100M1.5 49.5V50.5");
  });

  it("labels a position as a clock, with a sign before the song starts", () => {
    expect(clockLabel(75)).toBe("1:15");
    expect(clockLabel(-2)).toBe("-0:02");
  });

  it("spreads the ruler ticks evenly from the start to the end", () => {
    expect(rulerTicks({ start: 0, end: 100 })).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it("keeps a percentage inside the box", () => {
    expect(percent(0.25)).toBe("25%");
    expect(percent(-1)).toBe("0%");
    expect(percent(3)).toBe("100%");
  });

  it("turns a click on the timeline into a position, clamped to its edges", () => {
    const box = new DOMRect(100, 0, 400, 20);
    expect(positionAtPointer(300, box, { start: 0, end: 200 })).toBe(100);
    expect(positionAtPointer(50, box, { start: 0, end: 200 })).toBe(0);
    expect(positionAtPointer(900, box, { start: 0, end: 200 })).toBe(200);
  });
});
