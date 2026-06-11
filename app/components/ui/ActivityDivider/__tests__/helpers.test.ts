import { describe, it, expect } from "vitest";

import { clampRatio, fillStyle } from "../helpers";

describe("ActivityDivider helpers", () => {
  describe("clampRatio", () => {
    it("returns 0 when max is not positive", () => {
      expect(clampRatio(3, 0)).toBe(0);
      expect(clampRatio(3, -2)).toBe(0);
    });

    it("returns the proportional ratio", () => {
      expect(clampRatio(2, 8)).toBe(0.25);
      expect(clampRatio(4, 8)).toBe(0.5);
    });

    it("clamps to the unit interval", () => {
      expect(clampRatio(-1, 8)).toBe(0);
      expect(clampRatio(12, 8)).toBe(1);
    });
  });

  describe("fillStyle", () => {
    it("maps a ratio to a percentage inline size", () => {
      expect(fillStyle(0.5)).toEqual({ inlineSize: "50%" });
      expect(fillStyle(0)).toEqual({ inlineSize: "0%" });
      expect(fillStyle(1)).toEqual({ inlineSize: "100%" });
    });
  });
});
