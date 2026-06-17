import { describe, expect, it } from "vitest";

import { albumTarget, artistTarget, cardRingFillStyle, detailInitials, formatStat, visibleFacts } from "../helpers";

describe("content-detail helpers", () => {
  describe("detailInitials", () => {
    it("takes the first letter of the first two words", () => {
      expect(detailInitials("Daft Punk")).toBe("DP");
    });

    it("falls back to the first two letters of a single word", () => {
      expect(detailInitials("Adele")).toBe("AD");
    });

    it("returns a placeholder for an empty name", () => {
      expect(detailInitials("   ")).toBe("?");
    });
  });

  describe("formatStat", () => {
    it("renders a dash for a missing value", () => {
      expect(formatStat(null)).toBe("-");
    });

    it("compacts large values instead of writing every digit", () => {
      const formatted = formatStat(1_500_000);
      expect(formatted.length).toBeLessThan("1,500,000".length);
    });
  });

  describe("cardRingFillStyle", () => {
    it("fills the full circle when every track is in library", () => {
      expect(cardRingFillStyle(12, 12)).toEqual({ "--dock-ring-fill": "360deg" });
    });

    it("fills half the circle at half coverage", () => {
      expect(cardRingFillStyle(6, 12)).toEqual({ "--dock-ring-fill": "180deg" });
    });

    it("never exceeds a full circle when the count overshoots", () => {
      expect(cardRingFillStyle(20, 12)).toEqual({ "--dock-ring-fill": "360deg" });
    });

    it("fills nothing when the total is unknown", () => {
      expect(cardRingFillStyle(0, 0)).toEqual({ "--dock-ring-fill": "0deg" });
    });
  });

  describe("visibleFacts", () => {
    it("drops facts with a null or blank value", () => {
      const facts = visibleFacts([
        { label: "Type", value: "Person" },
        { label: "Country", value: null },
        { label: "Born", value: "   " },
      ]);
      expect(facts).toEqual([{ label: "Type", value: "Person" }]);
    });
  });

  describe("target builders", () => {
    it("builds an album target that mirrors the artist name", () => {
      expect(albumTarget({ id: "1", name: "RAM", artistName: "Daft Punk", cover: null })).toEqual({
        mode: "album",
        id: "1",
        name: "RAM",
        artistName: "Daft Punk",
        cover: null,
      });
    });

    it("builds an artist target whose artistName equals its name", () => {
      const target = artistTarget({ id: "2", name: "Adele", cover: null });
      expect(target.mode).toBe("artist");
      expect(target.artistName).toBe("Adele");
    });
  });
});
