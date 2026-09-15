import { afterEach, describe, expect, it } from "vitest";

import {
  activeLyricIndex,
  emptyReason,
  fractionFromPointer,
  labelled,
  lyricLineState,
  returnFocusTo,
  visibleMatch,
  waveColors,
} from "../helpers";

const SELECTOR = "[data-visibility-probe]";

function addCandidate(width: number, visibility: "visible" | "hidden"): HTMLButtonElement {
  const node = document.createElement("button");
  node.setAttribute("data-visibility-probe", "");
  node.style.setProperty("visibility", visibility);
  node.getBoundingClientRect = () => new DOMRect(0, 0, width, 20);
  document.body.appendChild(node);
  return node;
}

afterEach(() => {
  document.querySelectorAll(SELECTOR).forEach((node) => node.remove());
});

describe("visibleMatch", () => {
  it("finds nothing when the selector matches nothing", () => {
    expect(visibleMatch(SELECTOR)).toBeNull();
  });

  it("skips a candidate the layout has collapsed to nothing", () => {
    addCandidate(0, "visible");
    const shown = addCandidate(40, "visible");

    expect(visibleMatch(SELECTOR)).toBe(shown);
  });

  it("skips a candidate the stylesheet has hidden, though it still has a width", () => {
    addCandidate(40, "hidden");
    const shown = addCandidate(40, "visible");

    expect(visibleMatch(SELECTOR)).toBe(shown);
  });

  it("finds nothing when every candidate is out of sight", () => {
    addCandidate(0, "visible");
    addCandidate(40, "hidden");

    expect(visibleMatch(SELECTOR)).toBeNull();
  });
});

describe("returnFocusTo", () => {
  it("puts the focus back on the control that opened the panel", () => {
    const toggle = addCandidate(40, "visible");

    returnFocusTo(SELECTOR);

    expect(document.activeElement).toBe(toggle);
  });

  it("leaves the focus alone when the control is no longer on screen", () => {
    addCandidate(0, "visible");
    const elsewhere = document.createElement("button");
    document.body.appendChild(elsewhere);
    elsewhere.focus();

    returnFocusTo(SELECTOR);

    expect(document.activeElement).toBe(elsewhere);
    elsewhere.remove();
  });
});

describe("waveColors", () => {
  it("resolves the theme tokens the wave is painted with, without leaving a probe behind", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const colors = waveColors(host);

    expect(colors.lobes).toHaveLength(3);
    expect(host.children).toHaveLength(0);
    host.remove();
  });
});

describe("activeLyricIndex", () => {
  const lyrics = {
    synced: true,
    lines: [
      { start: 0, value: "one" },
      { start: 10_000, value: "two" },
      { start: 20_000, value: "three" },
    ],
  };

  it("has no active line without any lyrics", () => {
    expect(activeLyricIndex(null, 12)).toBeNull();
  });

  it("has no active line when the lyrics carry no timings", () => {
    expect(activeLyricIndex({ synced: false, lines: lyrics.lines }, 12)).toBeNull();
  });

  it("holds on the line that has started and not yet been replaced", () => {
    expect(activeLyricIndex(lyrics, 12)).toBe(1);
  });

  it("holds on the first line from the very start of the track", () => {
    expect(activeLyricIndex(lyrics, 0)).toBe(0);
  });

  it("holds on the last line once the track runs past it", () => {
    expect(activeLyricIndex(lyrics, 400)).toBe(2);
  });

  it("stops at the first untimed line rather than reading past it", () => {
    const mixed = {
      synced: true,
      lines: [
        { start: 0, value: "one" },
        { start: null, value: "interlude" },
        { start: 20_000, value: "three" },
      ],
    };

    expect(activeLyricIndex(mixed, 400)).toBe(0);
  });
});

describe("lyricLineState", () => {
  const lyrics = { synced: true, lines: [{ start: 0, value: "one" }] };

  it("flattens every line when the lyrics carry no timings, since none is playing", () => {
    expect(lyricLineState({ synced: false, lines: lyrics.lines }, null, 0)).toBe("plain");
  });

  it("flattens every line when there are no lyrics at all", () => {
    expect(lyricLineState(null, null, 0)).toBe("plain");
  });

  it("lifts the line that is playing and rests the others", () => {
    expect(lyricLineState(lyrics, 2, 2)).toBe("active");
    expect(lyricLineState(lyrics, 2, 3)).toBe("resting");
  });
});

describe("emptyReason", () => {
  it("says the lyrics are still coming while the fetch is in flight", () => {
    expect(emptyReason({ lyricsLoading: true, lyricsFailure: null })).toBe("loading");
  });

  it("says there are none once the fetch is done", () => {
    expect(emptyReason({ lyricsLoading: false, lyricsFailure: null })).toBe("empty");
  });
});

describe("labelled", () => {
  it("gives a control the same text for a screen reader and for a hover", () => {
    expect(labelled("Play")).toEqual({ "aria-label": "Play", title: "Play" });
  });
});

describe("fractionFromPointer", () => {
  it("reads the share of the track the pointer is over", () => {
    expect(fractionFromPointer(40, new DOMRect(0, 0, 200, 8))).toBe(0.2);
  });

  it("measures from the left edge of the control, not the window", () => {
    expect(fractionFromPointer(140, new DOMRect(100, 0, 200, 8))).toBe(0.2);
  });

  it("clamps a pointer dragged past either end", () => {
    expect(fractionFromPointer(-40, new DOMRect(0, 0, 200, 8))).toBe(0);
    expect(fractionFromPointer(900, new DOMRect(0, 0, 200, 8))).toBe(1);
  });

  it("reads a collapsed control as its start rather than dividing by nothing", () => {
    expect(fractionFromPointer(40, new DOMRect(0, 0, 0, 8))).toBe(0);
  });
});
