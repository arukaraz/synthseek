import { describe, it, expect } from "vitest";

import type { LibraryArtistItem } from "@hooks/api/queries/library/types";

import { albumMetaLine, artistSubtitle, cardInitials, mosaicTiles } from "../helpers";

const ARTIST: LibraryArtistItem = {
  id: null,
  artist: "Daft Punk",
  trackCount: 42,
  albumCount: 6,
  albumArt: null,
  genre: "electronic",
};

describe("artistSubtitle", () => {
  it("adds the genre after the album count when there is one", () => {
    expect(artistSubtitle(ARTIST, "6 albums")).toBe("6 albums · electronic");
    expect(artistSubtitle({ ...ARTIST, genre: null }, "6 albums")).toBe("6 albums");
  });
});

describe("cardInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(cardInitials("daft punk forever")).toBe("DP");
  });

  it("takes the first two letters of a single word", () => {
    expect(cardInitials("  justice ")).toBe("JU");
  });

  it("falls back to a placeholder for a blank name", () => {
    expect(cardInitials("   ")).toBe("?");
  });
});

describe("albumMetaLine", () => {
  it("joins the year, the quality and every library path", () => {
    expect(albumMetaLine(2001, "FLAC", ["Music", "Archive"])).toBe("2001 · FLAC · Music · Archive");
  });

  it("skips what is missing, and gives no line when nothing is known", () => {
    expect(albumMetaLine(null, "", ["Music"])).toBe("Music");
    expect(albumMetaLine(null, null, [])).toBeNull();
  });
});

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
