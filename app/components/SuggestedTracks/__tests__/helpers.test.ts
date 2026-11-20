import { describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import {
  coverInitials,
  filtersYears,
  knowsYears,
  libraryCopyId,
  sameYears,
  thumbsFor,
  yearSpan,
  yearsAt,
  yearsInForce,
  yearsLabel,
} from "../helpers";
import type { SuggestedTrack } from "../types";

const t = i18n.getFixedT("en", "components");
const SPAN = { floor: 1950, ceiling: 2026 };

function suggestion(externalId: string, overrides?: Partial<SuggestedTrack>): SuggestedTrack {
  return {
    externalId,
    title: `Song ${externalId}`,
    artist: "Artist",
    inLibrary: false,
    requestId: null,
    ...overrides,
  } as SuggestedTrack;
}

describe("libraryCopyId", () => {
  it("is the request id only when the track is in the library", () => {
    expect(libraryCopyId(suggestion("a", { inLibrary: true, requestId: "req-1" }))).toBe("req-1");
    expect(libraryCopyId(suggestion("a", { inLibrary: false, requestId: "req-1" }))).toBeNull();
    expect(libraryCopyId(suggestion("a"))).toBeNull();
  });
});

describe("coverInitials", () => {
  it("takes the first two characters of the trimmed title in upper case", () => {
    expect(coverInitials("  night drive")).toBe("NI");
  });
});

describe("yearSpan", () => {
  it("runs from the floor to the current year", () => {
    expect(yearSpan(1950, new Date(2026, 10, 20))).toEqual({ floor: 1950, ceiling: 2026 });
  });

  it("never ends before it starts", () => {
    expect(yearSpan(1950, new Date(1940, 0, 1))).toEqual({ floor: 1950, ceiling: 1950 });
  });
});

describe("filtersYears", () => {
  it("is a filter as soon as one end is set", () => {
    expect(filtersYears({ from: null, to: null })).toBe(false);
    expect(filtersYears({ from: 1990, to: null })).toBe(true);
    expect(filtersYears({ from: null, to: 2005 })).toBe(true);
  });
});

describe("sameYears", () => {
  it("compares both ends", () => {
    expect(sameYears({ from: 1990, to: null }, { from: 1990, to: null })).toBe(true);
    expect(sameYears({ from: 1990, to: null }, { from: 1991, to: null })).toBe(false);
    expect(sameYears({ from: 1990, to: 2000 }, { from: 1990, to: null })).toBe(false);
  });
});

describe("yearsInForce", () => {
  const any = { from: null, to: null };
  const applied = { playlistId: "pl-1", years: { from: 1990, to: null } };

  it("believes the loaded batch over anything applied before it", () => {
    expect(yearsInForce({ from: null, to: 2005 }, applied, "pl-1", any)).toEqual({ from: null, to: 2005 });
  });

  it("shows the years just applied to this playlist while their batch is on its way", () => {
    expect(yearsInForce(undefined, applied, "pl-1", any)).toEqual({ from: 1990, to: null });
  });

  it("does not carry the years applied to one playlist over to another", () => {
    expect(yearsInForce(undefined, applied, "pl-2", any)).toEqual(any);
    expect(yearsInForce(undefined, null, "pl-1", any)).toEqual(any);
  });
});

describe("knowsYears", () => {
  const known = { playlistId: "pl-1", years: { from: 1990, to: null } };

  it("knows the years it holds for the same playlist", () => {
    expect(knowsYears(known, "pl-1", { from: 1990, to: null })).toBe(true);
  });

  it("does not know other years, another playlist's years, or anything before the first batch", () => {
    expect(knowsYears(known, "pl-1", { from: 1991, to: null })).toBe(false);
    expect(knowsYears(known, "pl-2", { from: 1990, to: null })).toBe(false);
    expect(knowsYears(null, "pl-1", { from: 1990, to: null })).toBe(false);
  });
});

describe("thumbsFor", () => {
  it("puts an open end at the edge of the slider", () => {
    expect(thumbsFor({ from: null, to: null }, SPAN)).toEqual({ low: 1950, high: 2026 });
    expect(thumbsFor({ from: 1990, to: null }, SPAN)).toEqual({ low: 1990, high: 2026 });
    expect(thumbsFor({ from: null, to: 2005 }, SPAN)).toEqual({ low: 1950, high: 2005 });
  });

  it("keeps a saved year the slider cannot reach inside the slider", () => {
    expect(thumbsFor({ from: 1920, to: 1930 }, SPAN)).toEqual({ low: 1950, high: 1950 });
    expect(thumbsFor({ from: 2050, to: 2060 }, SPAN)).toEqual({ low: 2026, high: 2026 });
  });
});

describe("yearsAt", () => {
  it("reads a thumb resting on an edge as an open end", () => {
    expect(yearsAt({ low: 1950, high: 2026 }, SPAN)).toEqual({ from: null, to: null });
    expect(yearsAt({ low: 1990, high: 2026 }, SPAN)).toEqual({ from: 1990, to: null });
    expect(yearsAt({ low: 1950, high: 2005 }, SPAN)).toEqual({ from: null, to: 2005 });
    expect(yearsAt({ low: 1990, high: 2005 }, SPAN)).toEqual({ from: 1990, to: 2005 });
  });
});

describe("yearsLabel", () => {
  it("names the range by the ends that are set", () => {
    expect(yearsLabel({ from: 1990, to: 2005 }, t)).toBe("1990 – 2005");
    expect(yearsLabel({ from: 1999, to: 1999 }, t)).toBe("1999");
    expect(yearsLabel({ from: 1990, to: null }, t)).toBe("From 1990");
    expect(yearsLabel({ from: null, to: 2005 }, t)).toBe("Up to 2005");
    expect(yearsLabel({ from: null, to: null }, t)).toBe("Any year");
  });
});
