import { describe, expect, it } from "vitest";

import { orderedGroups } from "../helpers";
import type { DiscographyGroup } from "../types";

function group(recordType: DiscographyGroup["recordType"], albumCount: number): DiscographyGroup {
  return {
    recordType,
    albums: Array.from({ length: albumCount }, (_, index) => ({
      id: `${recordType}-${index}`,
      title: `${recordType} ${index}`,
      subtitle: null,
      image: null,
      inLibrary: false,
      libraryTrackCount: 0,
      totalTracks: 0,
    })),
  };
}

describe("Discography helpers", () => {
  describe("orderedGroups", () => {
    it("drops groups with no albums", () => {
      const result = orderedGroups([group("album", 2), group("single", 0)]);
      expect(result.map((g) => g.recordType)).toEqual(["album"]);
    });

    it("sorts the groups into the canonical record-type order", () => {
      const result = orderedGroups([group("single", 1), group("live", 1), group("album", 1), group("ep", 1)]);
      expect(result.map((g) => g.recordType)).toEqual(["album", "ep", "single", "live"]);
    });

    it("returns an empty list when every group is empty", () => {
      expect(orderedGroups([group("album", 0), group("ep", 0)])).toEqual([]);
    });
  });
});
