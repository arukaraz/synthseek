import { describe, expect, it } from "vitest";

import type { CustomThemeSummary } from "@theme/ThemeProvider";

import { isRovingKey, nextRovingIndex, previewPaintOf } from "../helpers";

const custom: CustomThemeSummary = {
  name: "Mine",
  scheme: "light",
  startedFrom: "midnight",
  follows: [],
  fingerprint: "abc",
  folder: "mine",
};

describe("isRovingKey", () => {
  it("returns true for every roving navigation key", () => {
    for (const key of ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]) {
      expect(isRovingKey(key)).toBe(true);
    }
  });

  it("returns false for an unrelated key", () => {
    expect(isRovingKey("Enter")).toBe(false);
    expect(isRovingKey("a")).toBe(false);
  });
});

describe("nextRovingIndex", () => {
  it("advances forward and wraps for next keys", () => {
    expect(nextRovingIndex(0, 4, "ArrowRight")).toBe(1);
    expect(nextRovingIndex(3, 4, "ArrowDown")).toBe(0);
  });

  it("moves backward and wraps for previous keys", () => {
    expect(nextRovingIndex(2, 4, "ArrowLeft")).toBe(1);
    expect(nextRovingIndex(0, 4, "ArrowUp")).toBe(3);
  });

  it("jumps to the first and last index for Home and End", () => {
    expect(nextRovingIndex(2, 4, "Home")).toBe(0);
    expect(nextRovingIndex(0, 4, "End")).toBe(3);
  });
});

describe("previewPaintOf", () => {
  it("paints a preset with itself", () => {
    expect(previewPaintOf("ocean", custom, "dark")).toEqual({ theme: "ocean" });
  });

  it("paints Custom with the account's custom theme over its base preset", () => {
    expect(previewPaintOf("custom", custom, "dark")).toEqual({ theme: "custom", base: "midnight" });
  });

  it("hands the miniature the saved tokens when the sheet is not on the page", () => {
    expect(previewPaintOf("custom", custom, "dark", { "--surface": "red" })).toEqual({
      theme: "custom",
      base: "midnight",
      vars: { "--surface": "red" },
    });
    expect(previewPaintOf("ocean", custom, "dark", { "--surface": "red" })).toEqual({ theme: "ocean" });
  });

  it("paints Custom with the active preset before a custom theme exists", () => {
    expect(previewPaintOf("custom", null, "ocean")).toEqual({ theme: "ocean" });
  });

  it("falls back to the first preset when nothing else is known", () => {
    expect(previewPaintOf("custom", null, "custom")).toEqual({ theme: "dark" });
  });
});
