import { describe, it, expect } from "vitest";

import { mosaicTiles } from "../helpers";

describe("mosaicTiles", () => {
  it("prefers the real cover over the mosaic when image is present", () => {
    const result = mosaicTiles(["a.jpg", "b.jpg", "c.jpg", "d.jpg"], "cover.jpg");

    expect(result).toEqual(["cover.jpg"]);
  });

  it("falls back to up to four mosaic tiles when the real cover is null", () => {
    const result = mosaicTiles(["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg"], null);

    expect(result).toEqual(["a.jpg", "b.jpg", "c.jpg", "d.jpg"]);
  });

  it("returns an empty array when both the real cover and mosaic are absent", () => {
    expect(mosaicTiles([], null)).toEqual([]);
  });
});
