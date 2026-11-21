// @vitest-environment node
import { THEME_PRESETS } from "@theme/contract";
import { describe, expect, it } from "vitest";

import { contrastRatio, followedColor, formatOklch, fromHex, parseColor, relativeLuminance, toHex } from "../color";
import type { Oklch } from "../types";

import { hex, oklch } from "./fixtures";

const WHITE: Oklch = { l: 1, c: 0, h: 0, alpha: 1 };
const BLACK: Oklch = { l: 0, c: 0, h: 0, alpha: 1 };

function required(color: Oklch | null): Oklch {
  if (!color) throw new Error("expected a color");
  return color;
}

describe("parseColor", () => {
  it("reads every oklch value of every preset", () => {
    for (const values of Object.values(THEME_PRESETS)) {
      for (const [name, value] of Object.entries(values)) {
        if (value.startsWith("oklch(")) expect(parseColor(value), name).not.toBeNull();
      }
    }
  });

  it("reads plain numbers and an alpha after a slash", () => {
    expect(parseColor(oklch("0.62 0.19 285 / 0.4"))).toEqual({ l: 0.62, c: 0.19, h: 285, alpha: 0.4 });
  });

  it("reads percentages for lightness and alpha, deg for hue, and none as zero", () => {
    expect(parseColor(oklch("50% 0.1 120deg / 25%"))).toEqual({ l: 0.5, c: 0.1, h: 120, alpha: 0.25 });
    expect(parseColor(oklch("none 0.1 none"))).toEqual({ l: 0, c: 0.1, h: 0, alpha: 1 });
  });

  it("ignores case, surrounding space and spacing around the slash", () => {
    expect(parseColor(`  ${oklch("0.5 0.1 200/0.5").toUpperCase()} `)).toEqual({ l: 0.5, c: 0.1, h: 200, alpha: 0.5 });
  });

  it("keeps the lightness and alpha inside 0 and 1", () => {
    const color = required(parseColor(oklch("1.5 0.1 10 / 2")));
    expect(color.l).toBe(1);
    expect(color.alpha).toBe(1);
  });

  it("reads hex colors of 3, 4, 6 and 8 digits", () => {
    expect(required(parseColor(hex("fff"))).l).toBeCloseTo(1, 3);
    expect(required(parseColor(hex("000"))).l).toBeCloseTo(0, 3);
    expect(required(parseColor(hex("ffff"))).alpha).toBe(1);
    expect(required(parseColor(hex("ffffff80"))).alpha).toBeCloseTo(128 / 255, 5);
    expect(required(parseColor(hex("F0F0"))).alpha).toBe(0);
  });

  it.each([
    "var(--x)",
    "red",
    ["rgb", "(0 0 0)"].join(""),
    "color-mix(in oklch, red, blue)",
    oklch("0.5 0.1"),
    oklch("0.5 0.1 200 300"),
    oklch("0.5, 0.1, 200"),
    oklch("0.5 0.1 200 /"),
    oklch("0.5 0.1 200 / 0.5 0.2"),
    oklch("0.5 abc 200"),
    oklch("0.5 10% 200"),
    `${oklch("0.5 0.1 200")} extra`,
    oklch("0.5 0.1 var(--h)"),
    hex("ggg"),
    hex("12345"),
    hex(""),
    "",
  ])("returns null for %s", (value) => {
    expect(parseColor(value)).toBeNull();
  });
});

describe("formatOklch", () => {
  it("rounds lightness and chroma to 3 decimals and hue to 1", () => {
    expect(formatOklch({ l: 0.123456, c: 0.234567, h: 12.3456, alpha: 1 })).toBe(oklch("0.123 0.235 12.3"));
  });

  it("drops trailing zeros", () => {
    expect(formatOklch({ l: 0.5, c: 0, h: 0, alpha: 1 })).toBe(oklch("0.5 0 0"));
  });

  it("writes the alpha with 2 decimals only below 1", () => {
    expect(formatOklch({ l: 0.5, c: 0.1, h: 20, alpha: 0.456 })).toBe(oklch("0.5 0.1 20 / 0.46"));
    expect(formatOklch({ l: 0.5, c: 0.1, h: 20, alpha: 1 })).toBe(oklch("0.5 0.1 20"));
  });

  it("round-trips through parseColor within the roundings", () => {
    const original: Oklch = { l: 0.61234, c: 0.18765, h: 287.46, alpha: 0.333 };
    const back = required(parseColor(formatOklch(original)));
    expect(back.l).toBeCloseTo(original.l, 3);
    expect(back.c).toBeCloseTo(original.c, 3);
    expect(back.h).toBeCloseTo(original.h, 1);
    expect(back.alpha).toBeCloseTo(original.alpha, 2);
  });
});

describe("hex conversion", () => {
  it("maps white and black to their hex colors", () => {
    expect(toHex(WHITE)).toBe(hex("ffffff"));
    expect(toHex(BLACK)).toBe(hex("000000"));
  });

  it("clamps an out-of-gamut color into range", () => {
    const out = toHex({ l: 0.7, c: 0.4, h: 140, alpha: 1 });
    expect(out).toHaveLength(7);
    expect(fromHex(out)).not.toBeNull();
    expect(toHex({ l: 1.2, c: 0, h: 0, alpha: 1 })).toBe(hex("ffffff"));
  });

  it("reads a known red as OKLCH", () => {
    const red = required(fromHex(hex("ff0000")));
    expect(red.l).toBeCloseTo(0.628, 2);
    expect(red.c).toBeCloseTo(0.258, 2);
    expect(red.h).toBeCloseTo(29.2, 0);
  });

  it("gives an achromatic color a hue of 0", () => {
    expect(required(fromHex(hex("808080"))).h).toBe(0);
  });

  it("reads the alpha of a 4 and an 8 digit hex", () => {
    expect(required(fromHex(hex("ffffff00"))).alpha).toBe(0);
    expect(required(fromHex(hex("fff8"))).alpha).toBeCloseTo(136 / 255, 5);
  });

  it("refuses a value without the hash or with a bad length or digit", () => {
    expect(fromHex("ffffff")).toBeNull();
    expect(fromHex(hex("fffff"))).toBeNull();
    expect(fromHex(hex("gggggg"))).toBeNull();
  });

  it("gives back the same hex for every color read from a hex", () => {
    for (const digits of ["7c3aed", "10b981", "f59e0b", "0ea5e9", "ef4444", "123456", "fedcba", "808080"]) {
      expect(toHex(required(fromHex(hex(digits))))).toBe(hex(digits));
    }
  });

  it("round-trips an in-gamut color through hex within 0.01", () => {
    for (const color of [
      { l: 0.62, c: 0.15, h: 285, alpha: 1 },
      { l: 0.7, c: 0.08, h: 140, alpha: 1 },
      { l: 0.45, c: 0.06, h: 30, alpha: 1 },
      { l: 0.5, c: 0.09, h: 210, alpha: 1 },
    ]) {
      const back = required(fromHex(toHex(color)));
      expect(Math.abs(back.l - color.l)).toBeLessThan(0.01);
      expect(Math.abs(back.c - color.c)).toBeLessThan(0.01);
      expect(Math.abs(back.h - color.h)).toBeLessThan(3);
    }
  });
});

describe("contrast", () => {
  it("gives white on black exactly 21 and a color against itself 1", () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 3);
    const color = { l: 0.6, c: 0.1, h: 100, alpha: 1 };
    expect(contrastRatio(color, color)).toBe(1);
  });

  it("does not depend on the order and ignores alpha", () => {
    const grey = required(fromHex(hex("777777")));
    expect(contrastRatio(grey, WHITE)).toBeCloseTo(4.48, 1);
    expect(contrastRatio(WHITE, grey)).toBe(contrastRatio(grey, WHITE));
    expect(contrastRatio({ ...grey, alpha: 0.1 }, WHITE)).toBe(contrastRatio(grey, WHITE));
  });

  it("has a luminance of 0 for black and 1 for white", () => {
    expect(relativeLuminance(BLACK)).toBe(0);
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 5);
  });
});

describe("followedColor", () => {
  const before: Oklch = { l: 0.6, c: 0.2, h: 280, alpha: 1 };
  const follower: Oklch = { l: 0.75, c: 0.1, h: 290, alpha: 0.5 };

  it("keeps the lightness gap to the base", () => {
    const after = { ...before, l: 0.4 };
    const moved = followedColor(before, after, follower);
    expect(moved.l).toBeCloseTo(0.55, 10);
    expect(moved.l - after.l).toBeCloseTo(follower.l - before.l, 10);
  });

  it("scales the chroma by the ratio of the base", () => {
    expect(followedColor(before, { ...before, c: 0.1 }, follower).c).toBeCloseTo(0.05, 10);
  });

  it("moves the chroma by the difference when the base had none", () => {
    const grey = { ...before, c: 0 };
    expect(followedColor(grey, { ...grey, c: 0.05 }, follower).c).toBeCloseTo(0.15, 10);
    expect(followedColor(grey, { ...grey, c: 0.05 }, { ...follower, c: 0.01 }).c).toBeCloseTo(0.06, 10);
    const nearGrey = { ...before, c: 0.00005 };
    expect(followedColor(nearGrey, { ...nearGrey, c: 0 }, { ...follower, c: 0.00001 }).c).toBe(0);
  });

  it("shifts the hue and wraps it into 0 to 360", () => {
    expect(followedColor(before, { ...before, h: 300 }, follower).h).toBeCloseTo(310, 10);
    expect(followedColor(before, { ...before, h: 350 }, follower).h).toBeCloseTo(0, 10);
    expect(followedColor(before, { ...before, h: 10 }, { ...follower, h: 100 }).h).toBeCloseTo(190, 10);
  });

  it("clamps the lightness and keeps the alpha", () => {
    const moved = followedColor(before, { ...before, l: 1 }, { ...follower, l: 0.9 });
    expect(moved.l).toBe(1);
    expect(moved.alpha).toBe(0.5);
  });

  it("changes nothing when the base did not move", () => {
    expect(followedColor(before, before, follower)).toEqual(follower);
  });
});
