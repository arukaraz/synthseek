import { describe, expect, it } from "vitest";

import { EQUALIZER_PRESETS } from "../constants";
import {
  appliedEqualizerGains,
  clampGainDb,
  equalizerPresetIds,
  equalizerPresetMatching,
  equalizerResponseDb,
  flatEqualizer,
  headroomDbFor,
  headroomFactorFor,
  isEqualizerPresetId,
  restorableEqualizer,
  steppedGainDb,
} from "../equalizer";

const FLAT = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const ROCK = [5, 4, 3, 1, -1, 1, 3, 4, 5, 5];

describe("stepping a band", () => {
  it("rounds to the nearest half decibel", () => {
    expect(steppedGainDb(3.3)).toBe(3.5);
    expect(steppedGainDb(3.2)).toBe(3);
    expect(steppedGainDb(-0.26)).toBe(-0.5);
  });

  it("stops at the ends of the slider", () => {
    expect(steppedGainDb(40)).toBe(12);
    expect(steppedGainDb(-40)).toBe(-12);
  });

  it("treats a value that is not a number as flat", () => {
    expect(steppedGainDb(Number.NaN)).toBe(0);
  });

  it("clamps without stepping", () => {
    expect(clampGainDb(3.3)).toBe(3.3);
    expect(clampGainDb(13)).toBe(12);
    expect(clampGainDb(-13)).toBe(-12);
  });
});

describe("naming the curve", () => {
  it("recognises every preset by its own values", () => {
    for (const id of equalizerPresetIds()) {
      expect(equalizerPresetMatching(EQUALIZER_PRESETS[id])).toBe(id);
    }
  });

  it("calls anything else custom", () => {
    expect(equalizerPresetMatching([1, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it("does not mistake a shorter curve for the preset it starts like", () => {
    expect(equalizerPresetMatching([])).toBeNull();
    expect(equalizerPresetMatching([5, 4, 3])).toBeNull();
  });

  it("lists the presets with flat first", () => {
    expect(equalizerPresetIds()[0]).toBe("flat");
    expect(equalizerPresetIds()).toHaveLength(11);
  });

  it("only accepts a name it has a curve for", () => {
    expect(isEqualizerPresetId("rock")).toBe(true);
    expect(isEqualizerPresetId("toString")).toBe(false);
    expect(isEqualizerPresetId("")).toBe(false);
  });
});

describe("the shape of one band", () => {
  it("is the cookbook peaking filter: the full gain at the centre and half of it one octave wide", () => {
    const only1k = [0, 0, 0, 0, 0, 6, 0, 0, 0, 0];
    expect(equalizerResponseDb(only1k, 1000)).toBeCloseTo(6, 6);
    expect(equalizerResponseDb(only1k, 707)).toBeCloseTo(3, 1);
    expect(equalizerResponseDb(only1k, 1414)).toBeCloseTo(3, 1);
    expect(equalizerResponseDb(only1k, 4000)).toBeLessThan(0.3);
  });

  it("adds the neighbours' skirts, so a curve is louder at a centre than the band alone says", () => {
    expect(equalizerResponseDb(ROCK, 31.5)).toBeGreaterThan(5.5);
    expect(equalizerResponseDb(ROCK, 8000)).toBeCloseTo(6.05, 1);
  });
});

describe("the headroom an equaliser curve needs", () => {
  it("is the loudest point of the whole curve, not the largest band on its own", () => {
    expect(headroomDbFor(ROCK)).toBeCloseTo(-6.05, 1);
    expect(headroomDbFor(ROCK)).toBeLessThan(-Math.max(...ROCK));
  });

  it("equals the band gain when one band stands alone, where nothing overlaps it", () => {
    expect(headroomDbFor([0, 0, 0, 0, 0, 6, 0, 0, 0, 0])).toBeCloseTo(-6, 6);
  });

  it("lets a cut next door pull a boost down, so the headroom is what the ear gets and not the slider", () => {
    const headroom = headroomDbFor([0, 3, 6.5, -4, 0, 0, 0, 0, 0, 0]);
    expect(headroom).toBeGreaterThan(-6.5);
    expect(headroom).toBeLessThan(-6);
  });

  it("charges the overlap of two neighbouring bands both at the ceiling", () => {
    expect(headroomDbFor([12, 12, 0, 0, 0, 0, 0, 0, 0, 0])).toBeCloseTo(-14.6, 1);
  });

  it("needs none for a curve that only cuts", () => {
    expect(headroomDbFor([-3, -12, 0, 0, 0, 0, 0, 0, 0, -1])).toBe(0);
  });

  it("needs none for an empty curve", () => {
    expect(headroomDbFor([])).toBe(0);
  });

  it("moves by about a tenth of a decibel between 44.1 and 48 kHz, which the graph absorbs by using its real rate", () => {
    expect(Math.abs(headroomDbFor(ROCK, 44_100) - headroomDbFor(ROCK, 48_000))).toBeLessThan(0.2);
    expect(Math.abs(headroomDbFor(ROCK, 44_100) - headroomDbFor(ROCK, 48_000))).toBeGreaterThan(0.01);
  });

  it("turns the headroom into the factor the gain node multiplies by", () => {
    expect(headroomFactorFor([0, 0, 0, 0, 0, 6, 0, 0, 0, 0])).toBeCloseTo(Math.pow(10, -6 / 20), 6);
    expect(headroomFactorFor([-6, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(1);
  });
});

describe("what the filters are asked to do", () => {
  it("passes the curve through while the equaliser is on", () => {
    expect(appliedEqualizerGains({ enabled: true, gainsDb: ROCK, preampDb: 0 })).toEqual(ROCK);
  });

  it("flattens every band while it is off, without forgetting the curve", () => {
    const settings = { enabled: false, gainsDb: ROCK, preampDb: 0 };

    expect(appliedEqualizerGains(settings)).toEqual(FLAT);
    expect(settings.gainsDb).toEqual(ROCK);
  });

  it("starts off and flat, with no preamp", () => {
    expect(flatEqualizer()).toEqual({ enabled: false, gainsDb: FLAT, preampDb: 0 });
  });
});

describe("restoring the curve a browser saved", () => {
  it("accepts what the store wrote", () => {
    expect(restorableEqualizer(JSON.stringify({ enabled: true, gainsDb: ROCK, preampDb: -3 }))).toEqual({
      enabled: true,
      gainsDb: ROCK,
      preampDb: -3,
    });
  });

  it("reads a curve saved before the preamp existed as one with no preamp", () => {
    expect(restorableEqualizer(JSON.stringify({ enabled: true, gainsDb: ROCK }))).toEqual({
      enabled: true,
      gainsDb: ROCK,
      preampDb: 0,
    });
  });

  it("ignores a preamp outside what the slider can reach", () => {
    expect(restorableEqualizer(JSON.stringify({ enabled: true, gainsDb: ROCK, preampDb: 13 }))).toBeNull();
  });

  it("finds nothing when nothing was saved", () => {
    expect(restorableEqualizer(null)).toBeNull();
  });

  it("ignores text that is not JSON", () => {
    expect(restorableEqualizer("{nope")).toBeNull();
  });

  it("ignores a curve with the wrong number of bands", () => {
    expect(restorableEqualizer(JSON.stringify({ enabled: true, gainsDb: [1, 2, 3] }))).toBeNull();
  });

  it("ignores a band outside what the sliders can reach", () => {
    expect(restorableEqualizer(JSON.stringify({ enabled: true, gainsDb: [13, ...FLAT.slice(1)] }))).toBeNull();
  });

  it("ignores an on-off flag that is not one", () => {
    expect(restorableEqualizer(JSON.stringify({ enabled: "yes", gainsDb: FLAT }))).toBeNull();
  });
});
