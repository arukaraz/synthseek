import { describe, expect, it } from "vitest";

import { bandLabel, formatGainDb, gainDbFromPointer, gainFractionFromTop } from "../helpers";

function rect(top: number, height: number): DOMRect {
  return { top, height, left: 0, width: 20, right: 20, bottom: top + height, x: 0, y: top, toJSON: () => ({}) };
}

describe("labelling a band", () => {
  it("shortens the kilohertz bands and rounds the rest", () => {
    expect(bandLabel(31.5)).toBe("32");
    expect(bandLabel(250)).toBe("250");
    expect(bandLabel(1000)).toBe("1k");
    expect(bandLabel(16000)).toBe("16k");
  });

  it("signs a boost and leaves a cut and flat alone", () => {
    expect(formatGainDb(5)).toBe("+5");
    expect(formatGainDb(0)).toBe("0");
    expect(formatGainDb(-3.5)).toBe("-3.5");
  });
});

describe("placing the head on a vertical band", () => {
  it("puts the loudest boost at the top, flat in the middle and the deepest cut at the bottom", () => {
    expect(gainFractionFromTop(12)).toBe(0);
    expect(gainFractionFromTop(0)).toBe(0.5);
    expect(gainFractionFromTop(-12)).toBe(1);
  });

  it("reads the pointer the same way back, stepped", () => {
    expect(gainDbFromPointer(0, rect(0, 120))).toBe(12);
    expect(gainDbFromPointer(120, rect(0, 120))).toBe(-12);
    expect(gainDbFromPointer(30, rect(0, 120))).toBe(6);
    expect(gainDbFromPointer(29, rect(0, 120))).toBe(6);
  });

  it("clamps a pointer that left the band, and gives flat for a band with no height", () => {
    expect(gainDbFromPointer(-50, rect(0, 120))).toBe(12);
    expect(gainDbFromPointer(500, rect(0, 120))).toBe(-12);
    expect(gainDbFromPointer(10, rect(0, 0))).toBe(0);
  });
});
