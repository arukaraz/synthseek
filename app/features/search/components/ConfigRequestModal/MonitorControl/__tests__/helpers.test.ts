import { describe, it, expect } from "vitest";
import { isAlbumScope, nextRadioIndex } from "../helpers";

describe("isAlbumScope", () => {
  it("returns true only for the album scope", () => {
    expect(isAlbumScope("album")).toBe(true);
  });

  it("returns false for entire-artist scopes", () => {
    for (const scope of ["all", "future", "missing", "none"] as const) {
      expect(isAlbumScope(scope)).toBe(false);
    }
  });
});

describe("nextRadioIndex", () => {
  it("moves forward and wraps to the start", () => {
    expect(nextRadioIndex("ArrowDown", 0, 4)).toBe(1);
    expect(nextRadioIndex("ArrowRight", 3, 4)).toBe(0);
  });

  it("moves backward and wraps to the end", () => {
    expect(nextRadioIndex("ArrowUp", 1, 4)).toBe(0);
    expect(nextRadioIndex("ArrowLeft", 0, 4)).toBe(3);
  });

  it("jumps to the first and last option", () => {
    expect(nextRadioIndex("Home", 2, 4)).toBe(0);
    expect(nextRadioIndex("End", 1, 4)).toBe(3);
  });

  it("returns null for keys that do not move the selection", () => {
    expect(nextRadioIndex("Enter", 1, 4)).toBeNull();
    expect(nextRadioIndex("Tab", 1, 4)).toBeNull();
  });
});
