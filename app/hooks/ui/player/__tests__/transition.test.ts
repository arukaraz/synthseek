import { describe, expect, it } from "vitest";

import {
  HANDOFF_LEAD_SECONDS,
  PRIME_AHEAD_SECONDS,
  TRANSITION_DEFAULT_SECONDS,
  TRANSITION_MAX_SECONDS,
  TRANSITION_MIN_SECONDS,
} from "../constants";
import {
  defaultTransition,
  fadeAllowed,
  fadeCurveValues,
  fadeGain,
  handoffLeadSeconds,
  isTransitionCurve,
  isTransitionMode,
  primeDue,
  restorableTransition,
  sameTransition,
  steppedTransitionSeconds,
  transitionFadeSeconds,
} from "../transition";

const CROSSFADE = { mode: "crossfade", seconds: 6, curve: "equalPower" } as const;
const SMART = { mode: "smart", seconds: 4, curve: "linear" } as const;

describe("what each transition mode does at a seam", () => {
  it("runs one track straight into the next in gapless mode, whether the track ended or was skipped", () => {
    expect(transitionFadeSeconds(defaultTransition(), "ended")).toBe(0);
    expect(transitionFadeSeconds(defaultTransition(), "skip")).toBe(0);
  });

  it("blends for the chosen length in crossfade mode, on a natural end and on a skip alike", () => {
    expect(transitionFadeSeconds(CROSSFADE, "ended")).toBe(6);
    expect(transitionFadeSeconds(CROSSFADE, "skip")).toBe(6);
  });

  it("blends only a skip in smart mode, and lets a track that ends on its own run straight on", () => {
    expect(transitionFadeSeconds(SMART, "ended")).toBe(0);
    expect(transitionFadeSeconds(SMART, "skip")).toBe(4);
  });
});

describe("whether a blend fits the tracks around it", () => {
  it("keeps a blend when both tracks are long enough to carry it twice over", () => {
    expect(fadeAllowed(5, 200, 30)).toBe(5);
  });

  it("drops a blend when either track is shorter than twice its length", () => {
    expect(fadeAllowed(5, 9, 200)).toBe(0);
    expect(fadeAllowed(5, 200, 9)).toBe(0);
  });

  it("keeps a blend when a track's length is not known yet", () => {
    expect(fadeAllowed(5, 0, 200)).toBe(5);
  });

  it("has nothing to drop when there is no blend", () => {
    expect(fadeAllowed(0, 1, 1)).toBe(0);
  });
});

describe("the fade curves", () => {
  it("holds the power steady across an equal-power blend, so the seam neither dips nor swells", () => {
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const power = fadeGain("equalPower", "in", progress) ** 2 + fadeGain("equalPower", "out", progress) ** 2;
      expect(power).toBeCloseTo(1, 6);
    }
  });

  it("crosses at the midpoint on a linear blend, where each side is at half", () => {
    expect(fadeGain("linear", "in", 0.5)).toBeCloseTo(0.5, 6);
    expect(fadeGain("linear", "out", 0.5)).toBeCloseTo(0.5, 6);
    expect(fadeGain("linear", "in", 0.25)).toBeCloseTo(0.25, 6);
  });

  it("clamps progress outside the fade to its ends", () => {
    expect(fadeGain("equalPower", "in", -1)).toBe(0);
    expect(fadeGain("equalPower", "out", 2)).toBeCloseTo(0, 6);
  });

  it("scales a curve to the level the track should reach, ending exactly there", () => {
    const values = fadeCurveValues("equalPower", "in", 0.5, 5);

    expect(values).toHaveLength(5);
    expect(values[0]).toBe(0);
    expect(values[4]).toBeCloseTo(0.5, 6);
    expect(values[2]).toBeCloseTo(0.5 * Math.SQRT1_2, 6);
  });

  it("never emits a curve too short for the browser to interpolate", () => {
    expect(fadeCurveValues("linear", "out", 1, 1)).toHaveLength(2);
  });
});

describe("when the next track is readied and when the handover fires", () => {
  it("readies the next track a fixed stretch before the end, plus the blend it has to fit", () => {
    expect(primeDue(200 - PRIME_AHEAD_SECONDS - 1, 200, 0)).toBe(false);
    expect(primeDue(200 - PRIME_AHEAD_SECONDS, 200, 0)).toBe(true);
    expect(primeDue(200 - PRIME_AHEAD_SECONDS - 3, 200, 5)).toBe(true);
  });

  it("readies nothing while the track's length is unknown", () => {
    expect(primeDue(500, 0, 0)).toBe(false);
  });

  it("hands over a few milliseconds early without a blend, and a whole blend early with one", () => {
    expect(handoffLeadSeconds(0)).toBe(HANDOFF_LEAD_SECONDS);
    expect(handoffLeadSeconds(6)).toBe(6);
  });
});

describe("the stored transition setting", () => {
  it("starts gapless, with a blend length ready for when the listener switches", () => {
    expect(defaultTransition()).toEqual({ mode: "gapless", seconds: TRANSITION_DEFAULT_SECONDS, curve: "equalPower" });
  });

  it("comes back from storage when it is well formed, and falls back otherwise", () => {
    expect(restorableTransition(JSON.stringify(CROSSFADE))).toEqual(CROSSFADE);
    expect(restorableTransition(JSON.stringify({ mode: "reverse", seconds: 3, curve: "linear" }))).toBeNull();
    expect(restorableTransition(JSON.stringify({ mode: "smart", seconds: 99, curve: "linear" }))).toBeNull();
    expect(restorableTransition("not json")).toBeNull();
    expect(restorableTransition(null)).toBeNull();
  });

  it("keeps the blend length on whole seconds inside the range the panel offers", () => {
    expect(steppedTransitionSeconds(3.4)).toBe(3);
    expect(steppedTransitionSeconds(TRANSITION_MAX_SECONDS + 5)).toBe(TRANSITION_MAX_SECONDS);
    expect(steppedTransitionSeconds(0)).toBe(TRANSITION_MIN_SECONDS);
    expect(steppedTransitionSeconds(Number.NaN)).toBe(TRANSITION_DEFAULT_SECONDS);
  });

  it("tells two settings apart by any of their three fields", () => {
    expect(sameTransition(CROSSFADE, { ...CROSSFADE })).toBe(true);
    expect(sameTransition(CROSSFADE, { ...CROSSFADE, seconds: 7 })).toBe(false);
    expect(sameTransition(CROSSFADE, { ...CROSSFADE, curve: "linear" })).toBe(false);
    expect(sameTransition(CROSSFADE, { ...CROSSFADE, mode: "smart" })).toBe(false);
  });

  it("recognises the modes and curves the panel can name, and nothing else", () => {
    expect(isTransitionMode("smart")).toBe(true);
    expect(isTransitionMode("reverse")).toBe(false);
    expect(isTransitionCurve("linear")).toBe(true);
    expect(isTransitionCurve("cubic")).toBe(false);
  });
});
